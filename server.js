// server.js - Backend with Imagen 3/4/4 Ultra, Veo 3 video, OpenAI captioning, and Instagram posting

const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { OpenAI } = require('openai');
const { GoogleGenAI } = require('@google/genai');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = 3000;

// --- External services
const axios = require('axios');
const promptManager = require('./utils/promptManager');
const { saveInstagramPost } = require('./utils/supabase');

// --- OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- Google GenAI for Images
const googleAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- Google GenAI for Videos (Veo)
const googleVeoAI = new GoogleGenAI({ apiKey: process.env.GEMINI_VEO_API_KEY });

// --- Uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// --- Middleware
app.use(cors());
app.use(express.json());



// --- Static + pages
app.use(express.static('.'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'app.html'));
});

app.get('/videos.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'videos.html'));
});

app.get('/prompts.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'prompts.html'));
});

// Serve navbar component
app.get('/components/navbar.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'components/navbar.html'));
});

app.get('/gallery.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'gallery.html'));
});

// ===================== Imagen =====================

app.post('/api/imagen3', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

        if (!googleAI) {
            return res.status(500).json({ error: 'Google GenAI not initialized. Check your GEMINI_API_KEY.' });
        }

        console.log(`Generating Imagen 3 image for prompt: ${prompt}`);

        const response = await googleAI.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt,
            config: { numberOfImages: 1, aspectRatio: '1:1' }
        });

        const base64Image = response?.generatedImages?.[0]?.image?.imageBytes;
        if (!base64Image) throw new Error('No image data in Imagen response');

        // Save to Supabase Storage
        const storagePath = await saveImageToStorage(base64Image, 'imagen-3');

        // Auto-tag the image based on prompt content
        if (storagePath) {
            await autoTagImage(storagePath, prompt);
        }

        res.json({ base64: base64Image });
    } catch (error) {
        console.error('Imagen Error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate image with Imagen' });
    }
});

app.post('/api/imagen4', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

        if (!googleAI) {
            return res.status(500).json({ error: 'Google GenAI not initialized. Check your GEMINI_API_KEY.' });
        }

        console.log(`Generating Imagen 4 image for prompt: ${prompt}`);

        const response = await googleAI.models.generateImages({
            model: 'imagen-4.0-generate-preview-06-06',
            prompt,
            config: { numberOfImages: 1, aspectRatio: '1:1' }
        });

        const base64Image = response?.generatedImages?.[0]?.image?.imageBytes;
        if (!base64Image) throw new Error('No image data in Imagen response');

        // Save to Supabase Storage
        const storagePath = await saveImageToStorage(base64Image, 'imagen-4');

        // Auto-tag the image based on prompt content
        if (storagePath) {
            await autoTagImage(storagePath, prompt);
        }

        res.json({ base64: base64Image });
    } catch (error) {
        console.error('Imagen 4 Error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate image with Imagen 4' });
    }
});

app.post('/api/imagen4ultra', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

        if (!googleAI) {
            return res.status(500).json({ error: 'Google GenAI not initialized. Check your GEMINI_API_KEY.' });
        }

        console.log(`Generating Imagen 4 Ultra image for prompt: ${prompt}`);

        const response = await googleAI.models.generateImages({
            model: 'imagen-4.0-ultra-generate-preview-06-06',
            prompt,
            config: { numberOfImages: 1, aspectRatio: '1:1' }
        });

        const base64Image = response?.generatedImages?.[0]?.image?.imageBytes;
        if (!base64Image) throw new Error('No image data in Imagen response');

        // Save to Supabase Storage
        const storagePath = await saveImageToStorage(base64Image, 'imagen-4-ultra');

        // Auto-tag the image based on prompt content
        if (storagePath) {
            await autoTagImage(storagePath, prompt);
        }

        res.json({ base64: base64Image });
    } catch (error) {
        console.error('Imagen 4 Ultra Error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate image with Imagen 4 Ultra' });
    }
});

// ===================== Prompt Enhancement & Captions =====================

app.post('/api/enhance-prompt', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

        console.log(`Enhancing prompt: ${prompt}`);

        const systemPrompt = systemPrompts.imageEnhancePrompt;

        // NOTE: if you don't actually have access to a "gpt-5-*" model, use gpt-4o instead.
        const response = await openai.chat.completions.create({
            model: 'gpt-5-nano',
            messages: [{ role: 'user', content: `${systemPrompt}\n\nUser scenario: ${prompt}` }],
            temperature: 1
        });

        const enhancedContent = response.choices[0].message.content;

        try {
            const jsonResponse = JSON.parse(enhancedContent);
            // Return the full JSON response as the enhanced prompt
            res.json({ enhancedPrompt: JSON.stringify(jsonResponse, null, 2) });
        } catch {
            // If JSON parsing fails, return the raw content
            res.json({ enhancedPrompt: enhancedContent });
        }
    } catch (error) {
        console.error('Prompt Enhancement Error:', error);
        res.status(500).json({ error: error.message || 'Failed to enhance prompt' });
    }
});

app.post('/api/generate-caption', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

        console.log(`Generating caption for prompt: ${prompt}`);

        const captionPrompt = systemPrompts.imageCaptionPrompt.replace('{prompt}', prompt);

        const response = await openai.chat.completions.create({
            model: 'gpt-5-nano',
            messages: [{ role: 'user', content: captionPrompt }],
            temperature: 1
        });

        const content = response.choices[0].message.content;

        // Parse the plain text response from the API
        const lines = content.split('\n').filter(line => line.trim());

        // Find caption (first non-hashtag line)
        const captionLine = lines.find(line => !line.trim().startsWith('#'));
        const caption = captionLine ? captionLine.trim() : '';

        // Find hashtags (line that starts with #)
        const tagsLine = lines.find(line => line.trim().startsWith('#'));
        const tags = tagsLine ? tagsLine.trim() : '';

        res.json({ caption, tags });
    } catch (error) {
        console.error('Caption Generation Error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate caption' });
    }
});

// ===================== System Prompts (file-based with auto-commit) =====================

let systemPrompts = {};

// Load prompts on startup
(async () => {
    try {
        systemPrompts = await promptManager.loadPrompts();
        console.log('✅ System prompts loaded from files');
    } catch (error) {
        console.error('❌ Failed to load system prompts:', error.message);
    }
})();

app.get('/api/system-prompts', async (req, res) => {
    try {
        // Always load fresh from files to ensure consistency
        const prompts = await promptManager.loadPrompts();
        res.json(prompts);
    } catch (error) {
        console.error('Error loading system prompts:', error);
        res.status(500).json({ error: 'Failed to load system prompts' });
    }
});

app.post('/api/system-prompts', async (req, res) => {
    try {
        const { imageEnhancePrompt, imageCaptionPrompt, videoEnhancePrompt, videoCaptionPrompt } = req.body;
        const updates = [];

        if (imageEnhancePrompt !== undefined) {
            await promptManager.savePrompt('imageEnhancePrompt', imageEnhancePrompt);
            systemPrompts.imageEnhancePrompt = imageEnhancePrompt;
            updates.push('Image Prompt Generation');
        }

        if (imageCaptionPrompt !== undefined) {
            await promptManager.savePrompt('imageCaptionPrompt', imageCaptionPrompt);
            systemPrompts.imageCaptionPrompt = imageCaptionPrompt;
            updates.push('Image Caption Generation');
        }

        if (videoEnhancePrompt !== undefined) {
            await promptManager.savePrompt('videoEnhancePrompt', videoEnhancePrompt);
            systemPrompts.videoEnhancePrompt = videoEnhancePrompt;
            updates.push('Video Prompt Generation');
        }

        if (videoCaptionPrompt !== undefined) {
            await promptManager.savePrompt('videoCaptionPrompt', videoCaptionPrompt);
            systemPrompts.videoCaptionPrompt = videoCaptionPrompt;
            updates.push('Video Caption Generation');
        }

        const message = updates.length > 0
            ? `System prompts updated: ${updates.join(', ')}. Changes committed to Git.`
            : 'No changes made to system prompts';

        console.log('✅', message);
        res.json({ success: true, message: 'System prompts updated successfully', updatedPrompts: updates });
    } catch (error) {
        console.error('Error updating system prompts:', error);
        res.status(500).json({ error: 'Failed to update system prompts: ' + error.message });
    }
});

// ===================== Instagram Image Posting =====================

app.post('/api/instagram/post', upload.single('image'), async (req, res) => {
    try {
        const { caption, model } = req.body;
        const imageFile = req.file;

        if (!caption) return res.status(400).json({ error: 'Caption is required' });
        if (!imageFile) return res.status(400).json({ error: 'Image is required' });

        console.log(`Posting to Instagram with model: ${model}`);

        // Convert image to base64 data URL for Instagram API
        const base64Image = `data:image/png;base64,${imageFile.buffer.toString('base64')}`;
        const imageUrl = base64Image;
        console.log('✅ Image prepared for Instagram posting');

        // Instagram Graph API
        const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
        const igUserId = process.env.IG_USER_ID;

        const mediaRes = await axios.post(
            `https://graph.facebook.com/v20.0/${igUserId}/media`,
            { image_url: imageUrl, caption, access_token: accessToken }
        );

        const creationId = mediaRes.data.id;
        console.log('📦 Media container created:', creationId);

        const publishRes = await axios.post(
            `https://graph.facebook.com/v20.0/${igUserId}/media_publish`,
            { creation_id: creationId, access_token: accessToken }
        );

        const postId = publishRes.data.id;
        console.log('📤 Post published:', postId);

        // Save Instagram post to database
        const postData = {
            post_id: postId,
            model: model,
            caption: caption,
            image_url: imageUrl,
            caption_length: caption.length,
            posted_at: new Date().toISOString(),
            status: 'published'
        };

        await saveInstagramPost(postData);

        res.json({ success: true, postId, imageUrl, captionLength: caption.length, model });
    } catch (error) {
        console.error('🔥 Instagram Post Error:', error.response?.data || error.message);
        res.status(500).json({
            error: error.response?.data?.error?.message || error.message || 'Failed to post to Instagram'
        });
    }
});

// ===================== Video: Prompt Enhancement =====================

app.post('/api/enhance-video-prompt', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

        console.log(`Enhancing video prompt: ${prompt}`);

        const videoSystemPrompt = systemPrompts.videoEnhancePrompt;

        const response = await openai.chat.completions.create({
            model: 'gpt-5-nano',
            messages: [{ role: 'user', content: `${videoSystemPrompt}\n\nUser scenario: ${prompt}` }],
            temperature: 1
        });

        const enhancedContent = response.choices[0].message.content;

        try {
            const jsonResponse = JSON.parse(enhancedContent);
            // Return the full JSON response as the enhanced prompt
            res.json({ enhancedPrompt: JSON.stringify(jsonResponse, null, 2) });
        } catch {
            // If JSON parsing fails, return the raw content
            res.json({ enhancedPrompt: enhancedContent });
        }
    } catch (error) {
        console.error('Video Prompt Enhancement Error:', error);
        res.status(500).json({ error: error.message || 'Failed to enhance video prompt' });
    }
});



// ===================== Video: Veo 3 Generation =====================
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

app.post("/api/veo/video", async (req, res) => {
    try {
        const { prompt, negativePrompt /*, personGeneration */ } = req.body;
        if (!prompt) return res.status(400).json({ error: "Prompt is required" });
        if (!googleVeoAI) return res.status(500).json({ error: "Google Veo AI not initialized. Check GEMINI_VEO_API_KEY." });

        console.log(`[Veo3] start, prompt="${prompt.slice(0, 120)}${prompt.length > 120 ? "..." : ""}"`);

        let op = await googleVeoAI.models.generateVideos({
            model: "veo-3.0-fast-generate-preview",
            prompt,
            config: {
                aspectRatio: "16:9",
                negativePrompt: negativePrompt || undefined,
                // personGeneration: "dont_allow" // only if you explicitly need it; MENA defaults apply
            },
        });

        const MAX_POLLS = 60;
        for (let i = 0; i < MAX_POLLS && !op.done; i++) {
            await sleep(10_000);
            op = await googleVeoAI.operations.getVideosOperation({ operation: op });
            if (op.error) throw new Error(op.error.message || "Video generation failed");
        }
        if (!op.done) throw new Error("Video generation timed out");

        // --- Accept both return shapes ---
        const videoObj = op.response?.generatedVideos?.[0]?.video;

        // Case 1: SDK returns a signed/authorized URI
        if (videoObj && typeof videoObj === "object" && (videoObj.uri || videoObj.url || videoObj.downloadUrl)) {
            const raw = videoObj.uri || videoObj.url || videoObj.downloadUrl;
            // Some URIs require the API key appended when fetched by the browser.
            const videoUrl = raw.includes("key=") ? raw : `${raw}${raw.includes("?") ? "&" : "?"}key=${process.env.GEMINI_VEO_API_KEY}`;
            return res.json({
                success: true,
                model: "veo-3.0-fast-generate-preview",
                videoUrl,                 // <-- frontend can <video src> this directly
                duration: "8s",
                aspectRatio: "16:9",
            });
        }

        // Case 2: SDK returns a file handle (e.g., "files/abc123")
        const handle = (typeof videoObj === "string") ? videoObj
            : (videoObj && videoObj.name ? videoObj.name : null);
        if (handle) {
            return res.json({
                success: true,
                model: "veo-3.0-fast-generate-preview",
                file: handle,             // <-- your /download route will use this
                duration: "8s",
                aspectRatio: "16:9",
            });
        }

        // Neither shape present
        console.error("[Veo3] unexpected op.response:", JSON.stringify(op.response || {}, null, 2));
        throw new Error("No downloadable file reference returned");
    } catch (err) {
        console.error("[Veo3] error:", err);
        res.status(500).json({ error: err.message || "Failed to generate video with Veo 3" });
    }
});

// ===================== Secure download proxy =====================

const fs = require("fs");
const os = require("os");

app.get("/api/veo/video/download", async (req, res) => {
    const { file } = req.query;
    if (!file) return res.status(400).json({ error: "Missing file parameter" });
    if (!googleVeoAI) return res.status(500).json({ error: "Google Veo AI not initialized" });

    // Make sure we have just the file handle string (like "files/abc123")
    const fileHandle = String(file);

    // Prepare a temp file path
    const tmpDir = os.tmpdir();
    const safeBase = (fileHandle.split("/").pop() || "veo.mp4").replace(/[^\w.-]/g, "_");
    const tmpPath = path.join(tmpDir, `${Date.now()}_${safeBase}`);

    try {
        // 1) Download to disk. SDK resolves when the file is fully written.
        await googleVeoAI.files.download({
            file: fileHandle,
            downloadPath: tmpPath,
        });

        // 2) Verify the file is really there and non-empty
        const st = await fs.promises.stat(tmpPath).catch(() => null);
        if (!st || !st.isFile() || st.size === 0) {
            throw new Error(`Downloaded file missing or empty at ${tmpPath}`);
        }

        // 3) Stream to client, then cleanup
        res.setHeader("Content-Type", "video/mp4");
        // Optional inline filename
        res.setHeader("Content-Disposition", `inline; filename="${safeBase}"`);

        const stream = fs.createReadStream(tmpPath);
        stream.on("error", (err) => {
            console.error("[Veo3] read stream error:", err);
            if (!res.headersSent) res.status(500).json({ error: "Failed to read downloaded video" });
            // Cleanup on error
            fs.promises.unlink(tmpPath).catch(() => { });
        });
        res.on("close", () => {
            // Client closed early; cleanup
            fs.promises.unlink(tmpPath).catch(() => { });
        });
        stream.pipe(res).on("finish", () => {
            fs.promises.unlink(tmpPath).catch(() => { });
        });
    } catch (err) {
        console.error("[Veo3] download/serve error:", err);
        // Attempt cleanup if the file exists
        fs.promises.unlink(tmpPath).catch(() => { });
        res.status(500).json({ error: err.message || "Failed to download video" });
    }
});


// ===================== Video Caption =====================

app.post('/api/generate-video-caption', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

        console.log(`Generating video caption for prompt: ${prompt}`);

        const videoCaptionPrompt = systemPrompts.videoCaptionPrompt.replace('{prompt}', prompt);

        const response = await openai.chat.completions.create({
            model: 'gpt-5-nano',
            messages: [{ role: 'user', content: videoCaptionPrompt }],
            temperature: 1
        });

        const content = response.choices[0].message.content;

        try {
            const jsonResponse = JSON.parse(content);
            res.json({ caption: jsonResponse.caption || '', tags: jsonResponse.tags || '' });
        } catch {
            const lines = content.split('\n').filter(Boolean);
            let caption = '';
            let tags = '';
            for (const line of lines) {
                if (line.toLowerCase().includes('caption') && !caption) {
                    caption = line.replace(/.*caption[:\-\s]*/i, '').trim();
                } else if (line.includes('#') && !tags) {
                    tags = line.trim();
                }
            }

            res.json({
                caption:
                    caption ||
                    'Bringing memories to life with Printerpix! ✨ Watch your cherished moments come alive in beautiful video stories.',
                tags:
                    tags ||
                    '#printerpix #memories #videomarketing #familymoments #personalized #keepsakes #memorymaking #videopost'
            });
        }
    } catch (error) {
        console.error('Video Caption Generation Error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate video caption' });
    }
});

// ===================== Instagram Video Posting (mock) =====================

app.post('/api/instagram/post-video', upload.single('video'), async (req, res) => {
    try {
        const { caption, model } = req.body;
        const videoFile = req.file;

        if (!caption) return res.status(400).json({ error: 'Caption is required' });
        if (!videoFile) return res.status(400).json({ error: 'Video is required' });

        console.log(`Posting video to Instagram with model: ${model}`);

        // Mock
        await new Promise(resolve => setTimeout(resolve, 3000));
        const mockPostId = `video_post_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

        res.json({
            success: true,
            postId: mockPostId,
            message: 'Video posted successfully',
            model,
            captionLength: caption.length
        });
    } catch (error) {
        console.error('Instagram Video Post Error:', error);
        res.status(500).json({ error: error.message || 'Failed to post video to Instagram' });
    }
});



// ===================== Storage Helper Function =====================

async function saveImageToStorage(base64Image, model) {
    try {
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

        // Convert base64 to buffer
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Generate unique filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${model}/${timestamp}-${Math.random().toString(36).substring(2, 15)}.png`;

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

        console.log(`✅ Image saved to storage: ${filename}`);
        return filename; // Return the storage path for tagging

    } catch (error) {
        console.error('Save to storage error:', error);
        return null;
    }
}

// ===================== Auto-Tagging Function =====================

async function autoTagImage(storagePath, prompt) {
    try {
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

        // Get all available tags
        const { data: tags, error: tagsError } = await supabase
            .from('product_tags')
            .select('*')
            .eq('is_active', true);

        if (tagsError || !tags) {
            console.error('Error fetching tags for auto-tagging:', tagsError);
            return;
        }

        const promptLower = prompt.toLowerCase();
        const suggestedTags = [];

        // Smart tagging based on prompt content - Focus on main product types
        // Priority order: canvas, photo-book, mug, blanket (most common products)
        const tagKeywords = {
            // Main priority products
            'canvas': ['canvas', 'art', 'painting', 'wall art', 'artwork', 'gallery', 'wall', 'display', 'framed', 'hanging'],
            'photo-book': ['book', 'album', 'memories', 'collection', 'story', 'family', 'pages', 'flip', 'coffee table'],
            'mug': ['mug', 'coffee', 'tea', 'cup', 'drink', 'morning', 'kitchen', 'beverage', 'ceramic'],
            'blanket': ['blanket', 'cozy', 'warm', 'comfort', 'soft', 'cuddle', 'throw', 'sofa', 'bed', 'snuggle'],
            
            // Secondary products (less likely to be auto-tagged)
            'photo-prints': ['photo', 'print', 'picture', 'image', 'standard', 'classic'],
            'frame': ['frame', 'framed', 'border', 'display', 'elegant'],
            'pillow': ['pillow', 'cushion', 'sofa', 'bed', 'home', 'decor'],
            'poster': ['poster', 'large', 'room', 'decoration']
        };

        // Check main priority products first
        const priorityProducts = ['canvas', 'photo-book', 'mug', 'blanket'];
        const secondaryProducts = ['photo-prints', 'frame', 'pillow', 'poster'];
        
        // Check priority products first
        priorityProducts.forEach(productName => {
            const tag = tags.find(t => t.name === productName);
            if (tag) {
                const keywords = tagKeywords[productName] || [];
                const hasMatch = keywords.some(keyword => promptLower.includes(keyword));
                if (hasMatch && !suggestedTags.includes(tag.id)) {
                    suggestedTags.push({ id: tag.id, name: productName, priority: 1 });
                }
            }
        });

        // Only check secondary products if we don't have enough priority matches
        if (suggestedTags.length < 2) {
            secondaryProducts.forEach(productName => {
                const tag = tags.find(t => t.name === productName);
                if (tag) {
                    const keywords = tagKeywords[productName] || [];
                    const hasMatch = keywords.some(keyword => promptLower.includes(keyword));
                    if (hasMatch && !suggestedTags.some(t => t.id === tag.id)) {
                        suggestedTags.push({ id: tag.id, name: productName, priority: 2 });
                    }
                }
            });
        }

        // If still no matches, add default fallback (canvas and photo-book as most common)
        if (suggestedTags.length === 0) {
            const defaultTags = ['canvas', 'photo-book'];
            defaultTags.forEach(tagName => {
                const tag = tags.find(t => t.name === tagName);
                if (tag && !suggestedTags.some(t => t.id === tag.id)) {
                    suggestedTags.push({ id: tag.id, name: tagName, priority: 3 });
                }
            });
        }

        // Sort by priority and limit to 2 tags maximum
        suggestedTags.sort((a, b) => a.priority - b.priority);
        const finalTags = suggestedTags.slice(0, 2).map(t => t.id);

        if (finalTags.length > 0) {
            // Insert image-tag relationships using storage path
            const imageTags = finalTags.map(tagId => ({
                storage_path: storagePath,
                tag_id: tagId
            }));

            const { error: insertError } = await supabase
                .from('image_tags')
                .insert(imageTags);

            if (insertError) {
                console.error('Error auto-tagging image:', insertError);
            } else {
                const tagNames = suggestedTags.slice(0, 2).map(t => t.name).join(', ');
                console.log(`✅ Auto-tagged image ${storagePath} with ${finalTags.length} tags: ${tagNames}`);
            }
        }

    } catch (error) {
        console.error('Auto-tagging error:', error);
    }
}

// ===================== Tags API Endpoints =====================

// Get all product tags
app.get('/api/tags', async (req, res) => {
    try {
        const { createClient } = require('@supabase/supabase-js');

        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
            return res.status(500).json({ error: 'Supabase configuration missing' });
        }

        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

        const { data: tags, error } = await supabase
            .from('product_tags')
            .select('*')
            .eq('is_active', true)
            .order('display_name');

        if (error) {
            console.error('Error fetching tags:', error);
            return res.status(500).json({ error: 'Failed to fetch tags' });
        }

        res.json({ success: true, tags });
    } catch (error) {
        console.error('Tags API error:', error);
        res.status(500).json({ error: 'Failed to load tags' });
    }
});

// Add tags to an image using storage path
app.post('/api/images/:storagePath/tags', async (req, res) => {
    try {
        const storagePath = decodeURIComponent(req.params.storagePath);
        const { tagIds } = req.body;

        console.log('Add tags request:', { storagePath, tagIds });

        if (!storagePath || !tagIds || !Array.isArray(tagIds)) {
            console.log('Validation failed:', { storagePath: !!storagePath, tagIds: !!tagIds, isArray: Array.isArray(tagIds) });
            return res.status(400).json({ error: 'Storage path and tag IDs array required' });
        }

        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

        // Test database connection
        const { data: testData, error: testError } = await supabase
            .from('product_tags')
            .select('id')
            .limit(1);

        if (testError) {
            console.error('Database connection test failed:', testError);
            return res.status(500).json({ error: 'Database connection failed' });
        }

        console.log('Database connection OK, found tags:', testData?.length || 0);

        // Insert image-tag relationships using storage path
        const imageTags = tagIds.map(tagId => ({
            storage_path: storagePath,
            tag_id: tagId
        }));

        console.log('Inserting image tags:', imageTags);

        const { data, error } = await supabase
            .from('image_tags')
            .upsert(imageTags, { onConflict: 'storage_path,tag_id' })
            .select();

        if (error) {
            console.error('Error adding tags to image:', error);
            return res.status(500).json({ error: `Failed to add tags to image: ${error.message}` });
        }

        console.log('Tags added successfully:', data);
        res.json({ success: true, message: 'Tags added successfully', data });
    } catch (error) {
        console.error('Add tags error:', error);
        res.status(500).json({ error: `Failed to add tags: ${error.message}` });
    }
});

// Remove a tag from an image using storage path
app.delete('/api/images/:storagePath/tags/:tagId', async (req, res) => {
    try {
        const storagePath = decodeURIComponent(req.params.storagePath);
        const { tagId } = req.params;

        if (!storagePath || !tagId) {
            return res.status(400).json({ error: 'Storage path and tag ID required' });
        }

        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

        const { error } = await supabase
            .from('image_tags')
            .delete()
            .eq('storage_path', storagePath)
            .eq('tag_id', tagId);

        if (error) {
            console.error('Error removing tag from image:', error);
            return res.status(500).json({ error: 'Failed to remove tag from image' });
        }

        res.json({ success: true, message: 'Tag removed successfully' });
    } catch (error) {
        console.error('Remove tag error:', error);
        res.status(500).json({ error: 'Failed to remove tag' });
    }
});

// Get tags for a specific image using storage path
app.get('/api/images/:storagePath/tags', async (req, res) => {
    try {
        const storagePath = decodeURIComponent(req.params.storagePath);

        if (!storagePath) {
            return res.status(400).json({ error: 'Storage path required' });
        }

        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

        const { data: imageTags, error } = await supabase
            .from('image_tags')
            .select(`
                tag_id,
                product_tags (
                    id,
                    name,
                    display_name,
                    color,
                    description
                )
            `)
            .eq('storage_path', storagePath);

        if (error) {
            console.error('Error fetching image tags:', error);
            return res.status(500).json({ error: 'Failed to fetch image tags' });
        }

        const tags = imageTags.map(item => item.product_tags);
        res.json({ success: true, tags });
    } catch (error) {
        console.error('Get image tags error:', error);
        res.status(500).json({ error: 'Failed to get image tags' });
    }
});

// ===================== Gallery API Endpoints =====================

// Simple test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

// Database test endpoint
app.get('/api/test-db', async (req, res) => {
    try {
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

        // Test product_tags table
        const { data: tags, error: tagsError } = await supabase
            .from('product_tags')
            .select('id, name, display_name')
            .limit(5);

        if (tagsError) {
            return res.json({
                success: false,
                error: 'product_tags table error',
                details: tagsError.message,
                suggestion: 'Run the database schema in Supabase SQL Editor'
            });
        }

        // Test image_tags table
        const { data: imageTags, error: imageTagsError } = await supabase
            .from('image_tags')
            .select('id')
            .limit(1);

        if (imageTagsError) {
            return res.json({
                success: false,
                error: 'image_tags table error',
                details: imageTagsError.message,
                suggestion: 'Run the database schema in Supabase SQL Editor'
            });
        }

        res.json({
            success: true,
            message: 'Database connection working!',
            productTags: tags?.length || 0,
            sampleTags: tags?.slice(0, 3).map(t => t.display_name) || []
        });

    } catch (error) {
        res.json({
            success: false,
            error: 'Database connection failed',
            details: error.message,
            suggestion: 'Check SUPABASE_URL and SUPABASE_ANON_KEY in .env file'
        });
    }
});

// Debug endpoint to test Supabase connection
app.get('/api/gallery/debug', async (req, res) => {
    try {
        const { createClient } = require('@supabase/supabase-js');

        console.log('Debug: Checking Supabase configuration...');
        console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Present' : 'Missing');
        console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Present' : 'Missing');

        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
            return res.status(500).json({ error: 'Supabase configuration missing' });
        }

        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

        console.log('Debug: Testing storage bucket access...');

        // Test basic bucket access
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

        if (bucketsError) {
            console.error('Debug: Buckets error:', bucketsError);
            return res.json({
                error: 'Failed to list buckets',
                details: bucketsError,
                step: 'listBuckets'
            });
        }

        console.log('Debug: Available buckets:', buckets.map(b => b.name));

        // Test generated-images bucket specifically
        const { data: rootFiles, error: rootError } = await supabase.storage
            .from('generated-images')
            .list('', { limit: 10 });

        if (rootError) {
            console.error('Debug: Root files error:', rootError);
            return res.json({
                error: 'Failed to access generated-images bucket',
                details: rootError,
                step: 'listRootFiles',
                buckets: buckets.map(b => b.name)
            });
        }

        console.log('Debug: Root files/folders:', rootFiles.map(f => f.name));

        res.json({
            success: true,
            buckets: buckets.map(b => b.name),
            rootItems: rootFiles.map(f => ({ name: f.name, id: f.id })),
            message: 'Supabase connection successful'
        });

    } catch (error) {
        console.error('Debug: Exception:', error);
        res.status(500).json({ error: error.message, step: 'exception' });
    }
});

app.get('/api/gallery/images', async (req, res) => {
    try {
        console.log('Gallery API: Starting request...');

        const { createClient } = require('@supabase/supabase-js');

        console.log('Gallery API: Checking environment variables...');
        console.log('SUPABASE_URL exists:', !!process.env.SUPABASE_URL);
        console.log('SUPABASE_ANON_KEY exists:', !!process.env.SUPABASE_ANON_KEY);

        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
            console.log('Gallery API: Missing Supabase configuration');
            return res.status(500).json({ error: 'Supabase configuration missing' });
        }

        console.log('Gallery API: Creating Supabase client...');
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

        console.log('Gallery API: Testing basic storage access...');

        // Simple test - just try to list the root of the bucket
        const { data: rootItems, error: rootError } = await supabase.storage
            .from('generated-images')
            .list('', { limit: 10 });

        if (rootError) {
            console.error('Gallery API: Root access error:', rootError);
            return res.status(500).json({
                error: 'Failed to access storage bucket',
                details: rootError.message,
                code: rootError.statusCode
            });
        }

        console.log('Gallery API: Root items found:', rootItems?.length || 0);
        console.log('Gallery API: Root item names:', rootItems?.map(item => item.name) || []);

        // Get images from all model folders
        const images = [];

        if (rootItems && rootItems.length > 0) {
            // Find all model folders (imagen-3, imagen-4, imagen-4-ultra, veo-3, etc.)
            const modelFolders = rootItems.filter(item =>
                item.name &&
                !item.name.includes('.emptyFolderPlaceholder') &&
                (item.name.startsWith('imagen-') || item.name.startsWith('veo-'))
            );

            console.log(`Gallery API: Found ${modelFolders.length} model folders:`, modelFolders.map(f => f.name));

            // Process each model folder
            for (const folder of modelFolders) {
                try {
                    console.log(`Gallery API: Processing folder: ${folder.name}`);

                    const { data: folderFiles, error: folderError } = await supabase.storage
                        .from('generated-images')
                        .list(folder.name, {
                            limit: 1000,  // Get up to 1000 images per folder
                            sortBy: { column: 'created_at', order: 'desc' }
                        });

                    if (folderError) {
                        console.error(`Gallery API: Error accessing folder ${folder.name}:`, folderError);
                        continue;
                    }

                    console.log(`Gallery API: Found ${folderFiles?.length || 0} files in ${folder.name}`);

                    // Process files from this folder
                    if (folderFiles && folderFiles.length > 0) {
                        const folderImages = folderFiles
                            .filter(file => file.name && !file.name.includes('.emptyFolderPlaceholder'))
                            .map(file => {
                                const filePath = `${folder.name}/${file.name}`;
                                const { data: urlData } = supabase.storage
                                    .from('generated-images')
                                    .getPublicUrl(filePath);

                                return {
                                    name: file.name,
                                    path: filePath,
                                    url: urlData.publicUrl,
                                    size: file.metadata?.size || 0,
                                    created_at: file.created_at,
                                    updated_at: file.updated_at,
                                    model: folder.name,
                                    id: `${folder.name}-${file.name}`,
                                    tags: [] // Will be populated if we have database records
                                };
                            });

                        images.push(...folderImages);
                        console.log(`Gallery API: Added ${folderImages.length} images from ${folder.name}`);
                    }
                } catch (folderError) {
                    console.error(`Gallery API: Exception processing folder ${folder.name}:`, folderError);
                }
            }

            // Sort all images by creation date (newest first)
            images.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            // Try to get tags for images using storage paths
            try {
                const { data: imageTags, error: tagsError } = await supabase
                    .from('image_tags')
                    .select(`
                        storage_path,
                        product_tags (
                            id,
                            name,
                            display_name,
                            color
                        )
                    `);

                if (!tagsError && imageTags) {
                    // Map tags to storage images
                    images.forEach(image => {
                        const imageTagsForPath = imageTags.filter(it => it.storage_path === image.path);
                        if (imageTagsForPath.length > 0) {
                            image.tags = imageTagsForPath.map(it => it.product_tags);
                        }
                    });
                }
            } catch (tagError) {
                console.error('Gallery API: Error fetching tags:', tagError);
                // Continue without tags if there's an error
            }
        }

        console.log(`Gallery API: Returning ${images.length} images`);
        res.json({
            success: true,
            images,
            count: images.length,
            debug: {
                rootItemsFound: rootItems?.length || 0,
                rootItemNames: rootItems?.map(item => item.name) || []
            }
        });

    } catch (error) {
        console.error('Gallery API: Exception:', error);
        res.status(500).json({
            error: 'Failed to load gallery',
            details: error.message,
            stack: error.stack
        });
    }
});

app.delete('/api/gallery/images/:filename', async (req, res) => {
    try {
        const { filename } = req.params;

        if (!filename) {
            return res.status(400).json({ error: 'Filename is required' });
        }

        const { createClient } = require('@supabase/supabase-js');

        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
            return res.status(500).json({ error: 'Supabase configuration missing' });
        }

        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

        // The filename parameter should be the full path (e.g., "imagen-3/2025-08-13T14-06-20-447...")
        // Decode it in case it was URL encoded
        const filePath = decodeURIComponent(filename);

        console.log(`Deleting image from storage: ${filePath}`);

        // Delete the file from storage
        const { error } = await supabase.storage
            .from('generated-images')
            .remove([filePath]);

        if (error) {
            console.error('Supabase delete error:', error);
            return res.status(500).json({ error: 'Failed to delete image from storage' });
        }

        console.log(`Successfully deleted image: ${filePath}`);
        res.json({ success: true, message: 'Image deleted successfully' });

    } catch (error) {
        console.error('Gallery delete error:', error);
        res.status(500).json({ error: 'Failed to delete image' });
    }
});

// ===================== Email Notification System =====================

app.post('/api/email/send-images', upload.none(), async (req, res) => {
    try {
        const { recipient, subject, message, images } = req.body;

        if (!recipient || !subject || !images) {
            return res.status(400).json({ error: 'Missing required fields: recipient, subject, or images' });
        }

        const imageData = JSON.parse(images);

        if (!Array.isArray(imageData) || imageData.length === 0) {
            return res.status(400).json({ error: 'No images provided' });
        }

        // For now, we'll use a simple mailto link approach
        // In production, you'd want to use a proper email service like SendGrid, Nodemailer, etc.

        // Create email body with image information
        let emailBody = message || '';
        emailBody += '\n\n--- Images ---\n';

        imageData.forEach((image, index) => {
            emailBody += `\n${index + 1}. ${image.name}`;
            emailBody += `\n   Model: ${image.model}`;
            emailBody += `\n   Size: ${formatFileSize(image.size)}`;
            emailBody += `\n   URL: ${image.url}\n`;
        });

        emailBody += '\n\nGenerated by Printerpix Studio';

        // For demonstration, we'll return the email data that would be sent
        // In production, integrate with your preferred email service
        const emailData = {
            to: recipient,
            subject: subject,
            body: emailBody,
            imageCount: imageData.length,
            images: imageData.map(img => ({
                name: img.name,
                url: img.url,
                model: img.model
            }))
        };

        // Log the email for debugging
        // Actually send the email using nodemailer
        console.log('📧 Attempting to send email to:', recipient, 'with', imageData.length, 'images');

        // Create email transporter
        const emailTransporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Create email content
        const htmlContent = createHtmlEmailContent(message, imageData);
        const textContent = createEmailBody(message, imageData);

        // Email options
        const mailOptions = {
            from: `"Printerpix Studio" <${process.env.EMAIL_USER}>`,
            to: recipient,
            subject: subject,
            text: textContent,
            html: htmlContent
        };

        console.log('📧 Sending email via SMTP to:', recipient);

        // Send email
        const info = await emailTransporter.sendMail(mailOptions);

        console.log('✅ Email sent successfully! Message ID:', info.messageId);



        res.json({
            success: true,
            message: 'Email sent successfully',
            emailId: `email_${Date.now()}`,
            recipient,
            imageCount: imageData.length
        });

    } catch (error) {
        console.error('Email sending error:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

// Helper functions for email
function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatModelName(model) {
    const modelMap = {
        'imagen-3': 'Imagen 3',
        'imagen-4': 'Imagen 4',
        'imagen-4-ultra': 'Imagen 4 Ultra',
        'veo-3': 'Veo 3'
    };
    return modelMap[model] || model;
}

function createEmailBody(message, imageData) {
    let emailBody = message || 'Hi,\n\nI\'m sharing some images with you from Printerpix Studio.\n\nBest regards';
    emailBody += '\n\n--- Images ---\n';

    imageData.forEach((image, index) => {
        emailBody += `\n${index + 1}. ${image.name}`;
        emailBody += `\n   Model: ${formatModelName(image.model)}`;
        emailBody += `\n   Size: ${formatFileSize(image.size)}`;
        emailBody += `\n   URL: ${image.url}\n`;
    });

    emailBody += '\n\nGenerated by Printerpix Studio';
    return emailBody;
}

function createHtmlEmailContent(message, imageData) {
    const messageHtml = (message || 'Hi,<br><br>I\'m sharing some images with you from Printerpix Studio.<br><br>Best regards').replace(/\n/g, '<br>');

    let imagesHtml = '';
    imageData.forEach((image, index) => {
        imagesHtml += `
            <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h4 style="margin: 0 0 10px 0; color: #374151;">${index + 1}. ${image.name}</h4>
                <img src="${image.url}" alt="${image.name}" style="max-width: 300px; height: auto; border-radius: 4px; margin-bottom: 10px;">
                <div style="font-size: 14px; color: #6b7280;">
                    <strong>Model:</strong> ${formatModelName(image.model)}<br>
                    <strong>Size:</strong> ${formatFileSize(image.size)}
                </div>
                <a href="${image.url}" target="_blank" style="display: inline-block; margin-top: 10px; padding: 8px 16px; background: #e90b75; color: white; text-decoration: none; border-radius: 4px; font-size: 14px;">View Full Size</a>
            </div>
        `;
    });

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Images from Printerpix Studio</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #e90b75;">Printerpix Studio</h1>
                <p style="color: #6b7280;">AI-Generated Images</p>
            </div>
            
            <div style="margin-bottom: 30px;">
                ${messageHtml}
            </div>
            
            <h2 style="color: #374151; border-bottom: 2px solid #e90b75; padding-bottom: 10px;">Your Images (${imageData.length})</h2>
            
            ${imagesHtml}
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
                <p>Generated by <strong style="color: #e90b75;">Printerpix Studio</strong></p>
            </div>
        </body>
        </html>
    `;
}

// ===================== Email Test Endpoint =====================

app.get('/api/email/test', (req, res) => {
    console.log('🔍 Email Configuration Test:');
    console.log('  EMAIL_HOST:', process.env.EMAIL_HOST || 'NOT SET');
    console.log('  EMAIL_USER:', process.env.EMAIL_USER || 'NOT SET');
    console.log('  EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET (hidden)' : 'NOT SET');
    console.log('  EMAIL_PORT:', process.env.EMAIL_PORT || '587 (default)');

    // Test nodemailer
    try {
        console.log('🔍 Testing nodemailer import:', typeof nodemailer);
        console.log('🔍 createTransport function:', typeof nodemailer.createTransport);

        if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const testTransporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT || 587,
                secure: process.env.EMAIL_SECURE === 'true',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            testTransporter.verify((error, success) => {
                if (error) {
                    console.log('❌ Email connection failed:', error.message);
                } else {
                    console.log('✅ Email connection successful!');
                }
            });

            res.json({
                status: 'configured',
                host: process.env.EMAIL_HOST,
                user: process.env.EMAIL_USER,
                port: process.env.EMAIL_PORT || 587,
                message: 'Email is configured. Check server console for connection test results.'
            });
        } else {
            res.json({
                status: 'not_configured',
                message: 'Email credentials missing. Add EMAIL_HOST, EMAIL_USER, and EMAIL_PASS to .env file.',
                current: {
                    host: process.env.EMAIL_HOST || null,
                    user: process.env.EMAIL_USER || null,
                    pass: process.env.EMAIL_PASS ? 'SET' : null
                }
            });
        }
    } catch (error) {
        res.json({
            status: 'error',
            error: error.message
        });
    }
});

// ===================== Boot =====================

app.listen(PORT, () => {
    console.log(`✨ Server running at http://localhost:${PORT}`);
});
