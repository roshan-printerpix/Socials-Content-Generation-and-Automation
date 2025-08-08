// server.js - Updated Backend with DALL-E 3, OpenAI Image, and Imagen 3 Support

const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Initialize multer for file uploads
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Initialize Express middlewares
app.use(cors());
app.use(express.json());

const cloudinary = require('cloudinary').v2;
const axios = require('axios');

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Serve the frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'app.html'));
});


// === Google Imagen 3 Endpoint ===
app.post('/api/imagen3', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        console.log(`Generating Imagen 3 image for prompt: ${prompt}`);

        // Use the new @google/genai package approach
        const { GoogleGenAI } = require('@google/genai');

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });

        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                aspectRatio: "1:1"
            }
        });

        if (response.generatedImages && response.generatedImages[0] && response.generatedImages[0].image) {
            const base64Image = response.generatedImages[0].image.imageBytes;
            res.json({ base64: base64Image });
        } else {
            throw new Error('No image data in Imagen response');
        }

    } catch (error) {
        console.error('Imagen Error:', error);
        res.status(500).json({
            error: error.message || 'Failed to generate image with Imagen'
        });
    }
});

// === Google Imagen 4 Endpoint ===
app.post('/api/imagen4', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        console.log(`Generating Imagen 4 image for prompt: ${prompt}`);

        // Use the new @google/genai package approach
        const { GoogleGenAI } = require('@google/genai');

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });

        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-preview-06-06',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                aspectRatio: "1:1"
            }
        });

        if (response.generatedImages && response.generatedImages[0] && response.generatedImages[0].image) {
            const base64Image = response.generatedImages[0].image.imageBytes;
            res.json({ base64: base64Image });
        } else {
            throw new Error('No image data in Imagen response');
        }

    } catch (error) {
        console.error('Imagen 4 Error:', error);
        res.status(500).json({
            error: error.message || 'Failed to generate image with Imagen 4'
        });
    }
});

// === Google Imagen 4 Ultra Endpoint ===
app.post('/api/imagen4ultra', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        console.log(`Generating Imagen 4 image for prompt: ${prompt}`);

        // Use the new @google/genai package approach
        const { GoogleGenAI } = require('@google/genai');

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });

        const response = await ai.models.generateImages({
            model: 'imagen-4.0-ultra-generate-preview-06-06',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                aspectRatio: "1:1"
            }
        });

        if (response.generatedImages && response.generatedImages[0] && response.generatedImages[0].image) {
            const base64Image = response.generatedImages[0].image.imageBytes;
            res.json({ base64: base64Image });
        } else {
            throw new Error('No image data in Imagen response');
        }

    } catch (error) {
        console.error('Imagen 4 Error:', error);
        res.status(500).json({
            error: error.message || 'Failed to generate image with Imagen 4'
        });
    }
});

// === Prompt Enhancement Endpoint ===
app.post('/api/enhance-prompt', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        console.log(`Enhancing prompt: ${prompt}`);

        const systemPrompt = systemPrompts.enhancePrompt;

        const response = await openai.chat.completions.create({
            model: 'gpt-5-2025-08-07',
            messages: [
                {
                    role: 'user',
                    content: `${systemPrompt}\n\nUser scenario: ${prompt}`
                }
            ],
            temperature: 1
        });

        const enhancedContent = response.choices[0].message.content;

        try {
            // Try to parse as JSON first
            const jsonResponse = JSON.parse(enhancedContent);
            // If it's valid JSON, extract the scene for the image prompt
            const enhancedPrompt = jsonResponse.scene || enhancedContent;
            res.json({ enhancedPrompt });
        } catch (parseError) {
            // If not JSON, use the content as is
            res.json({ enhancedPrompt: enhancedContent });
        }

    } catch (error) {
        console.error('Prompt Enhancement Error:', error);
        res.status(500).json({
            error: error.message || 'Failed to enhance prompt'
        });
    }
});

// === Caption Generation Endpoint ===
app.post('/api/generate-caption', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        console.log(`Generating caption for prompt: ${prompt}`);

        const captionPrompt = systemPrompts.captionPrompt.replace('{prompt}', prompt);


        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'user',
                    content: captionPrompt
                }
            ],
            temperature: 0.8
        });

        const content = response.choices[0].message.content;

        try {
            // Try to parse as JSON first
            const jsonResponse = JSON.parse(content);
            res.json({
                caption: jsonResponse.caption || '',
                tags: jsonResponse.tags || ''
            });
        } catch (parseError) {
            // If not JSON, try to extract caption and tags from text
            const lines = content.split('\n').filter(line => line.trim());
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
                caption: caption || 'Transform your precious memories into beautiful keepsakes! ✨ Create lasting treasures that tell your unique story.',
                tags: tags || '#printerpix #memories #photobook #familymoments #personalized #keepsakes #memorymaking #photoprints'
            });
        }

    } catch (error) {
        console.error('Caption Generation Error:', error);
        res.status(500).json({
            error: error.message || 'Failed to generate caption'
        });
    }
});

// Store system prompts in memory (in production, use a database)
let systemPrompts = {
    enhancePrompt: `You are a social-media content strategist for Printerpix, transforming cherished memories into bespoke photobooks, framed prints, wall canvases, mugs and blankets. When the user provides a one-sentence Scenario, answer with one and only one JSON object that guides an AI image generator. The object should be created to make sure the image is perfect for marketing purpose on social media platforms for Printerpix. It should decide tone, colours, aesthetics according to country mentioned. To appeal to target audience in that country. The image should be focused on the marketing product. Aim is to generate prompt for a highly engaging image on social media.

REQUIRED JSON KEYS:
"scene" - A vivid 100-150-word description that: • names the setting and season inside a typical home of mentioned country (think cosy Victorian terrace, modern London flat, or Cotswolds cottage) • introduces each person with clear ages and relationships so family roles are never confused • shows one Printerpix product in natural use (never print any logo or text on the product) • paints lighting, colours, décor and small details inspired by current country interiors: warm neutrals, sage green, blush, terracotta, coastal blues • weaves a marketing-ready emotional hook that invites followers to picture their own memories on display • reads like lifestyle copy, free of camera jargon or AI prompt tokens

"shot_type" - "wide shot", "medium shot" or "close up"

"composition" - Two-to-five words of framing advice (rule of thirds, airy negative space, gentle depth, leading lines)

"colour_palette" - Three-to-four descriptive colour words that echo UK décor trends for 2025 (example: warm oat, sage, blush)

"aspect_ratio" - "1:1" for Instagram or "4:5" for other

STYLE PRINCIPLES:
• Mood radiates nostalgia, joy, love and family bonding.
• Light is always natural: golden hour glow, sunlit bay window, soft candlelight.
• Décor feels authentically British – think herringbone floors, vintage Roberts radio, trailing ivy or biophilic touches.
• Keep the scene focused and uncluttered; every prop supports the story.
• Output nothing outside the JSON object.

QUALITY CHECKLIST (internal):
1 Family roles match the Scenario.
2 No "Printerpix" text printed on the product.
3 Colours and styling align with specified country trends
4 Scene length is between 100 and 160 words.
5 colours and styling should be selected to be Aesthetically pleasing to the eyes
6 image should have context/relatability to mentioned country`,

    captionPrompt: `You are a social media expert for Printerpix, a company that creates personalized photo products like photobooks, framed prints, wall canvases, mugs, and blankets.

Based on the image generation prompt: "{prompt}"

Generate an engaging Instagram post with:

1. A compelling caption (2-3 sentences) that:
   - Connects emotionally with families and memory-making
   - Subtly promotes Printerpix products without being salesy
   - Uses warm, relatable language
   - Includes a call-to-action

2. Relevant hashtags (exactly 5-10 hashtags) that include:
   - Printerpix branded hashtags (#printerpix)
   - Memory and family-related hashtags
   - Product-specific hashtags
   - Trending lifestyle hashtags

IMPORTANT: Use exactly between 5 and 10 hashtags, no more, no less.

Format your response as JSON with "caption" and "tags" fields.`
};

// === System Prompts Management Endpoints ===
app.get('/api/system-prompts', (req, res) => {
    res.json(systemPrompts);
});

app.post('/api/system-prompts', (req, res) => {
    try {
        const { enhancePrompt, captionPrompt } = req.body;

        if (enhancePrompt !== undefined) {
            systemPrompts.enhancePrompt = enhancePrompt;
        }
        if (captionPrompt !== undefined) {
            systemPrompts.captionPrompt = captionPrompt;
        }

        console.log('System prompts updated');
        res.json({ success: true, message: 'System prompts updated successfully' });
    } catch (error) {
        console.error('Error updating system prompts:', error);
        res.status(500).json({ error: 'Failed to update system prompts' });
    }
});

// === Instagram Posting Endpoint ===
app.post('/api/instagram/post', upload.single('image'), async (req, res) => {
    try {
        const { caption, model } = req.body;
        const imageFile = req.file;

        if (!caption) return res.status(400).json({ error: 'Caption is required' });
        if (!imageFile) return res.status(400).json({ error: 'Image is required' });

        console.log(`Posting to Instagram with model: ${model}`);

        // 1. Upload to Cloudinary
        const base64Image = `data:image/png;base64,${imageFile.buffer.toString('base64')}`;
        const cloudinaryRes = await cloudinary.uploader.upload(base64Image, {
            folder: 'ai-instagram-posts',
            public_id: `post_${Date.now()}`,
            resource_type: 'image'
        });

        const imageUrl = cloudinaryRes.secure_url;
        console.log('✅ Uploaded to Cloudinary:', imageUrl);

        // 2. Instagram API: Create media container
        const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
        const igUserId = process.env.IG_USER_ID;

        const mediaRes = await axios.post(
            `https://graph.facebook.com/v20.0/${igUserId}/media`,
            {
                image_url: imageUrl,
                caption: caption,
                access_token: accessToken
            }
        );

        const creationId = mediaRes.data.id;
        console.log('📦 Media container created:', creationId);

        // 3. Instagram API: Publish the post
        const publishRes = await axios.post(
            `https://graph.facebook.com/v20.0/${igUserId}/media_publish`,
            {
                creation_id: creationId,
                access_token: accessToken
            }
        );

        const postId = publishRes.data.id;
        console.log('📤 Post published:', postId);

        // Return success
        res.json({
            success: true,
            postId,
            imageUrl,
            captionLength: caption.length,
            model
        });

    } catch (error) {
        console.error('🔥 Instagram Post Error:', error.response?.data || error.message);
        res.status(500).json({
            error: error.response?.data?.error?.message || error.message || 'Failed to post to Instagram'
        });
    }
});

app.listen(PORT, () => {
    console.log(`\u2728 Server running at http://localhost:${PORT}`);
    console.log('\u2709\uFE0F Ensure your .env file contains:');
    console.log('   OPENAI_API_KEY=your_openai_key');
    console.log('   GEMINI_API_KEY=your_gemini_key');
    console.log('   INSTAGRAM_ACCESS_TOKEN=your_instagram_token (for Instagram posting)');
});
