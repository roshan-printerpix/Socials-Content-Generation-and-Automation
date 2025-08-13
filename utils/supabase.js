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
        console.warn('Supabase not configured, skipping database save');
        return null;
    }

    try {
        const { data, error } = await supabase
            .from('generated_images')
            .insert([imageData])
            .select()
            .single();

        if (error) {
            console.error('Error saving to database:', error);
            return null;
        }

        console.log('✅ Image saved to database:', data.id);
        return data;
    } catch (err) {
        console.error('Database save error:', err);
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

        return data || [];
    } catch (err) {
        console.error('Database fetch error:', err);
        return [];
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
    saveInstagramPost
};