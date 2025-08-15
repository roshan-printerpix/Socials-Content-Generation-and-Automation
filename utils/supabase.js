const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase credentials not found. Database features will be disabled.');
}

const supabase = supabaseUrl && supabaseKey 
    ? createClient(supabaseUrl, supabaseKey)
    : null;

// Database helper functions
const saveGeneratedImage = async (imageData) => {
    if (!supabase) {
        return null;
    }

    try {
        // Convert base64 to buffer
        const base64Data = imageData.base64_image.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        // Generate unique filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${imageData.model}/${timestamp}-${Math.random().toString(36).substring(2, 15)}.png`;
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('generated-images')
            .upload(filename, imageBuffer, {
                contentType: 'image/png',
                cacheControl: '3600'
            });

        if (uploadError) {
            console.error('Storage upload error:', uploadError);
            return null;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('generated-images')
            .getPublicUrl(filename);

        const publicUrl = urlData.publicUrl;

        // Save metadata to database (without base64)
        const dbData = {
            model: imageData.model,
            prompt: imageData.prompt,
            storage_path: filename,
            public_url: publicUrl,
            file_size: imageBuffer.length,
            generation_time: imageData.generation_time,
            status: imageData.status || 'completed'
        };

        const { data, error } = await supabase
            .from('generated_images')
            .insert([dbData])
            .select()
            .single();

        if (error) {
            console.error('Database insert error:', error);
            // Try to clean up uploaded file
            await supabase.storage.from('generated-images').remove([filename]);
            return null;
        }

        // Return the saved image data with database ID for auto-tagging
        return { ...data, publicUrl, id: data.id, prompt: imageData.prompt };

    } catch (err) {
        console.error('Image save exception:', err);
        return null;
    }
};

const getGeneratedImages = async (limit = 50) => {
    if (!supabase) {
        console.warn('Supabase not configured');
        return [];
    }

    try {
        const { data, error } = await supabase
            .from('generated_images')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching from database:', error);
            return [];
        }

        console.log(`✅ Retrieved ${data?.length || 0} images from database`);
        return data || [];
    } catch (err) {
        console.error('Database fetch error:', err);
        return [];
    }
};

const deleteGeneratedImage = async (imageId) => {
    if (!supabase) {
        console.warn('Supabase not configured');
        return false;
    }

    try {
        // First get the image data to find the storage path
        const { data: imageData, error: fetchError } = await supabase
            .from('generated_images')
            .select('storage_path')
            .eq('id', imageId)
            .single();

        if (fetchError || !imageData) {
            console.error('Error fetching image for deletion:', fetchError);
            return false;
        }

        // Delete from storage
        const { error: storageError } = await supabase.storage
            .from('generated-images')
            .remove([imageData.storage_path]);

        if (storageError) {
            console.error('Error deleting from storage:', storageError);
        }

        // Delete from database
        const { error: dbError } = await supabase
            .from('generated_images')
            .delete()
            .eq('id', imageId);

        if (dbError) {
            console.error('Error deleting from database:', dbError);
            return false;
        }

        console.log('✅ Image deleted successfully:', imageId);
        return true;
    } catch (err) {
        console.error('Delete error:', err);
        return false;
    }
};

const saveInstagramPost = async (postData) => {
    if (!supabase) {
        console.warn('Supabase not configured, skipping database save');
        return null;
    }

    try {
        const { data, error } = await supabase
            .from('instagram_posts')
            .insert([postData])
            .select()
            .single();

        if (error) {
            console.error('Error saving Instagram post to database:', error);
            return null;
        }

        console.log('✅ Instagram post saved to database:', data.id);
        return data;
    } catch (err) {
        console.error('Instagram post database save error:', err);
        return null;
    }
};

module.exports = {
    supabase,
    saveGeneratedImage,
    getGeneratedImages,
    deleteGeneratedImage,
    saveInstagramPost
};