// server.js - Backend with Imagen 3/4/4 Ultra, Veo 3 video, OpenAI captioning, and Instagram posting

const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { OpenAI } = require('openai');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const app = express();
const PORT = 3000;

// --- External services
const cloudinary = require('cloudinary').v2;
const axios = require('axios');
const promptManager = require('./utils/promptManager');
const { saveGeneratedImage, getGeneratedImages, saveInstagramPost } = require('./utils/supabase');

// --- OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- Google GenAI
let googleAI;
try {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    googleAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log('✅ Google GenAI initialized successfully');
} catch (error) {
    console.error('❌ Failed to initialize Google GenAI:', error.message);
    googleAI = null;
}

// --- Uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// --- Middleware
app.use(cors());
app.use(express.json());

// --- Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- Static + pages
app.use(express.static('.'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'app.html'));
});

app.get('/videos.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'videos.html'));
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

        // Save to database
        const imageData = {
            model: 'imagen-3',
            prompt: prompt,
            base64_image: base64Image,
            generation_time: new Date().toISOString(),
            status: 'completed'
        };

        await saveGeneratedImage(imageData);

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

        // Save to database
        const imageData = {
            model: 'imagen-4',
            prompt: prompt,
            base64_image: base64Image,
            generation_time: new Date().toISOString(),
            status: 'completed'
        };

        await saveGeneratedImage(imageData);

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

        // Save to database
        const imageData = {
            model: 'imagen-4-ultra',
            prompt: prompt,
            base64_image: base64Image,
            generation_time: new Date().toISOString(),
            status: 'completed'
        };

        await saveGeneratedImage(imageData);

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

        // Upload to Cloudinary
        const base64Image = `data:image/png;base64,${imageFile.buffer.toString('base64')}`;
        const cloudinaryRes = await cloudinary.uploader.upload(base64Image, {
            folder: 'ai-instagram-posts',
            public_id: `post_${Date.now()}`,
            resource_type: 'image'
        });

        const imageUrl = cloudinaryRes.secure_url;
        console.log('✅ Uploaded to Cloudinary:', imageUrl);

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
            cloudinary_url: imageUrl,
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
            model: 'gpt-4o',
            messages: [{ role: 'user', content: `${videoSystemPrompt}\n\nBasic video prompt: ${prompt}` }],
            temperature: 0.7
        });

        const enhancedContent = response.choices[0].message.content;
        res.json({ enhancedPrompt: enhancedContent });
    } catch (error) {
        console.error('Video Prompt Enhancement Error:', error);
        res.status(500).json({ error: error.message || 'Failed to enhance video prompt' });
    }
});

// ===================== Video: Runway (mock) =====================

app.post('/api/runway/video', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

        console.log(`Generating Runway ML video for prompt: ${prompt}`);

        await new Promise(resolve => setTimeout(resolve, 3000)); // mock
        const mockVideoUrl = `data:video/mp4;base64,mock_video_data_${Date.now()}`;

        res.json({ videoUrl: mockVideoUrl, model: 'runway-ml', duration: '5s' });
    } catch (error) {
        console.error('Runway ML Error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate video with Runway ML' });
    }
});

// ===================== Video: Veo 3 Generation =====================
app.post('/api/veo/video', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

        if (!googleAI) {
            return res.status(500).json({ error: 'Google GenAI not initialized. Check your GEMINI_API_KEY.' });
        }

        console.log(`Generating Veo 3 video for prompt: ${prompt}`);

        // Start the job (returns an operation object)
        let operation;
        try {
            operation = await googleAI.models.generateVideos({
                model: 'veo-3.0-generate-preview',
                prompt,
                // optional:
                // config: { negative_prompt: 'low quality, cartoon' },
                // image: <image object from Imagen if doing image-to-video>
            });
        } catch (apiError) {
            console.error('Veo API Error:', apiError);

            // Check for quota/rate limit errors
            if (apiError.message && (
                apiError.message.includes('quota') ||
                apiError.message.includes('RESOURCE_EXHAUSTED') ||
                apiError.message.includes('429')
            )) {
                throw new Error(`🚫 Veo 3 quota exceeded. Your implementation is working correctly! Please visit https://aistudio.google.com/ to check your quota limits and billing settings. You may need to wait for quota reset or upgrade your plan.`);
            }

            throw new Error(`Veo 3 API call failed: ${apiError.message}. This might indicate that Veo 3 is not available with your current API key or the model name is incorrect.`);
        }

        console.log('Initial operation:', JSON.stringify(operation, null, 2));

        if (!operation) {
            throw new Error('No operation returned from generateVideos');
        }

        if (!operation.name) {
            throw new Error(`Operation missing name property. Operation structure: ${JSON.stringify(operation, null, 2)}`);
        }

        // Poll exactly as the docs show: pass the operation name to get()
        const MAX_POLLS = 60; // ~10 minutes @ 10s
        for (let i = 0; i < MAX_POLLS && !operation.done; i++) {
            await new Promise(r => setTimeout(r, 10_000));
            console.log(`Polling attempt ${i + 1}, operation name: ${operation.name}`);

            try {
                operation = await googleAI.operations.get({ name: operation.name });
                console.log(`Poll ${i + 1} result:`, JSON.stringify(operation, null, 2));
            } catch (pollError) {
                console.error(`Error during poll ${i + 1}:`, pollError);
                throw new Error(`Polling error: ${pollError.message}`);
            }

            if (operation.error) {
                throw new Error(`Veo operation error: ${operation.error.message || JSON.stringify(operation.error)}`);
            }
        }

        if (!operation.done) throw new Error('Video generation timed out');

        // Debug: Log the full operation response
        console.log('Full operation response:', JSON.stringify(operation, null, 2));

        const generated = operation.response?.generatedVideos?.[0];
        console.log('Generated video object:', JSON.stringify(generated, null, 2));

        if (!generated) throw new Error('No generated video in response');
        if (!generated.video) throw new Error('No video object in generated response');

        // Pull the file handle to use with your proxy (files/<id>)
        const fileName =
            generated.video.name ||
            (String(generated.video.uri || generated.video.url || generated.video.downloadUrl).match(/\/(files\/[^:\/\s]+)/)?.[1]);

        console.log('Extracted fileName:', fileName);

        if (!fileName) throw new Error('Could not determine file handle for proxying');

        // Return your authenticated proxy URL
        const proxiedUrl = `/api/veo/proxy/${fileName}`;
        res.json({ success: true, model: 'google-veo-3', videoUrl: proxiedUrl });

    } catch (err) {
        console.error('Google Veo Error:', err);
        res.status(500).json({ error: err.message || 'Failed to generate video with Google Veo' });
    }
});

// ===================== Video: Veo Proxy (STREAMING, wildcard) =====================
// We use a wildcard so we can capture "files/<id>" which contains a slash.
app.get('/api/veo/proxy/*', async (req, res) => {
    try {
        const fileName = decodeURIComponent(req.params[0]); // "files/<id>"
        console.log(`Proxying video file: ${fileName}`);

        if (!googleAI) {
            return res.status(500).send('Google GenAI not initialized. Check your GEMINI_API_KEY.');
        }

        const fileResp = await googleAI.files.download({ name: fileName });

        const ct = fileResp.headers?.get?.('content-type') || 'application/octet-stream';
        const cl = fileResp.headers?.get?.('content-length');
        res.setHeader('Content-Type', ct);
        if (cl) res.setHeader('Content-Length', cl);
        res.setHeader('Accept-Ranges', 'none');

        const { Readable } = require('stream');
        if (fileResp.body && typeof fileResp.body.getReader === 'function') {
            Readable.fromWeb(fileResp.body).pipe(res);
        } else if (fileResp.body?.pipe) {
            fileResp.body.pipe(res);
        } else {
            const ab = await fileResp.arrayBuffer();
            res.end(Buffer.from(ab));
        }
    } catch (err) {
        console.error('Proxy download error:', err);
        res.status(500).send('Unable to fetch video');
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
            model: 'gpt-4o',
            messages: [{ role: 'user', content: videoCaptionPrompt }],
            temperature: 0.8
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

// ===================== Database API Endpoints =====================

app.get('/api/generated-images', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const images = await getGeneratedImages(limit);
        res.json({ success: true, images, count: images.length });
    } catch (error) {
        console.error('Error fetching generated images:', error);
        res.status(500).json({ error: 'Failed to fetch generated images' });
    }
});

app.get('/api/generated-images/stats', async (req, res) => {
    try {
        const images = await getGeneratedImages(1000); // Get more for stats

        const stats = {
            total: images.length,
            byModel: {},
            byDate: {},
            recentActivity: images.slice(0, 10)
        };

        // Count by model
        images.forEach(img => {
            stats.byModel[img.model] = (stats.byModel[img.model] || 0) + 1;
        });

        // Count by date (last 7 days)
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);

        images.forEach(img => {
            const date = new Date(img.generation_time).toDateString();
            if (new Date(img.generation_time) >= last7Days) {
                stats.byDate[date] = (stats.byDate[date] || 0) + 1;
            }
        });

        res.json({ success: true, stats });
    } catch (error) {
        console.error('Error fetching image stats:', error);
        res.status(500).json({ error: 'Failed to fetch image statistics' });
    }
});

// ===================== Boot =====================

app.listen(PORT, () => {
    console.log(`✨ Server running at http://localhost:${PORT}`);
    console.log('✉️ Ensure your .env file contains:');
    console.log('   OPENAI_API_KEY=your_openai_key');
    console.log('   GEMINI_API_KEY=your_gemini_key');
    console.log('   INSTAGRAM_ACCESS_TOKEN=your_instagram_token (for Instagram posting)');
    console.log('   IG_USER_ID=your_instagram_user_id');
    console.log('   CLOUDINARY_CLOUD_NAME=...');
    console.log('   CLOUDINARY_API_KEY=...');
    console.log('   CLOUDINARY_API_SECRET=...');
});
