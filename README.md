# Printerpix AI Studio - Complete Marketing Content Generator

A comprehensive web application that generates marketing images and videos using multiple AI models, with automatic Instagram posting and intelligent content creation for Printerpix brand marketing.

## 🚀 Features

### Multi-Modal Content Generation
- **Image Generation**: Create stunning marketing images using Gemini Imagen 3, Imagen 4, and Imagen 4 Ultra
- **Video Generation**: Generate marketing videos using Runway ML and Google Veo 3
- **Prompt Enhancement**: AI-powered prompt optimization using GPT-4o for both images and videos
- **Visual Selection**: Click to select content with visual feedback and full-screen preview

### Intelligent Content Creation
- **AI Caption Generation**: Automatically generate Instagram-ready captions and hashtags
- **Brand-Optimized Content**: All content specifically tailored for Printerpix marketing
- **Editable Content**: Modify captions, hashtags, and prompts before posting
- **Multi-Format Support**: Optimized for various social media formats

### Instagram Integration
- **Direct Posting**: Post selected images and videos directly to Instagram
- **Cloudinary Integration**: Automatic image processing and cloud storage
- **Meta Graph API**: Full Instagram Business API integration
- **Post Management**: Track posting status and results

### Advanced System Management
- **Dynamic Prompt System**: Edit AI system prompts through intuitive web interface
- **Auto-Commit**: Automatic Git commits when prompts are changed
- **File-Based Configuration**: Prompts stored in markdown files for easy management
- **Real-time Updates**: Changes apply immediately without server restart

## 🛠️ Tech Stack

### Frontend
- **HTML5, CSS3, Vanilla JavaScript**
- **Responsive Design** with mobile optimization
- **Modern UI/UX** with Printerpix branding
- **Component-based Architecture**

### Backend
- **Node.js & Express.js** server
- **Multer** for file upload handling
- **CORS** enabled for cross-origin requests

### AI Services
- **OpenAI GPT-4o**: Prompt enhancement & caption generation
- **Google Gemini Imagen 3/4/Ultra**: Image generation
- **Google Veo 3**: Video generation
- **Runway ML**: Alternative video generation

### Cloud Services
- **Cloudinary**: Image/video storage and processing
- **Meta Graph API**: Instagram posting integration

### Development Tools
- **Git Integration**: Automatic commit system
- **Environment Configuration**: Secure API key management
- **Error Handling**: Comprehensive error management

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd printerpix-ai-studio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # AI Service APIs
   OPENAI_API_KEY=your_openai_api_key
   GEMINI_API_KEY=your_gemini_api_key
   
   # Instagram Integration
   INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token
   IG_USER_ID=your_instagram_business_account_id
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   
   # Supabase Database (Optional)
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the application**
   ```bash
   npm start
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

## 🎯 Usage

### Image Generation Workflow
1. **Enter a basic prompt** describing your desired image
2. **Click "Enhance Prompt"** to generate a detailed, marketing-optimized prompt
3. **Edit the enhanced prompt** if needed
4. **Click "Generate Post"** to create images across all models
5. **Select an image** by clicking on your preferred result
6. **Review and edit** the auto-generated caption and hashtags
7. **Click "Post to Instagram"** to publish

### Video Generation Workflow
1. **Navigate to Videos tab** in the application
2. **Enter a basic video prompt** describing your desired video
3. **Click "Enhance Prompt"** to optimize for video generation
4. **Click "Generate Videos"** to create videos using available models
5. **Select a video** by clicking on your preferred result
6. **Review the auto-generated caption** and hashtags
7. **Post to Instagram** (currently mock implementation)

### System Configuration
1. **Click the gear icon** in the top-right corner
2. **Edit system prompts** for different content types:
   - Image prompt enhancement
   - Image caption generation
   - Video prompt enhancement
   - Video caption generation
3. **Save changes** to apply immediately and auto-commit to Git

## 🔧 Configuration

### Instagram API Setup
1. **Create a Facebook/Meta Developer App**
2. **Set up Instagram Business Account**
3. **Generate Long-lived Access Tokens**
4. **Configure webhook endpoints** (if needed)
5. **Add credentials to `.env` file**

### AI Model Configuration
- **OpenAI**: Requires API key for GPT-4o access
- **Google Gemini**: Requires API key for Imagen and Veo model access
- **Cloudinary**: Required for image/video storage and Instagram posting

## 📁 Project Structure

```
printerpix-ai-studio/
├── 📄 app.html                    # Main image generation interface
├── 📄 videos.html                 # Video generation interface
├── 📄 server.js                   # Express.js backend server
├── 📄 package.json                # Dependencies and scripts
├── 📄 .env                        # Environment variables (not in repo)
├── 📄 .gitignore                  # Git ignore rules
├── 📄 README.md                   # Project documentation
├── 📄 PROMPT_MANAGEMENT.md        # Prompt system documentation
├── 📁 components/
│   └── 📄 navbar.html             # Reusable navigation component
├── � ucss/
│   ├── 📄 main.css                # Main application styles
│   ├── 📄 navbar.css              # Navigation styles
│   └── 📄 settings.css            # Settings modal styles
├── 📁 js/
│   ├── 📄 images.js               # Image generation frontend logic
│   └── 📄 videos.js               # Video generation frontend logic
├── 📁 prompts/
│   ├── 📄 image-enhance-prompt.md # Image prompt enhancement system prompt
│   ├── 📄 image-caption-prompt.md # Image caption generation system prompt
│   ├── 📄 video-enhance-prompt.md # Video prompt enhancement system prompt
│   └── 📄 video-caption-prompt.md # Video caption generation system prompt
├── 📁 utils/
│   └── 📄 promptManager.js        # Prompt management and Git integration
└── 📁 temp/                       # Temporary file storage
```

## 🎨 Features in Detail

### AI Models & Capabilities
- **Gemini Imagen 3**: Fast, standard quality image generation
- **Gemini Imagen 4**: Enhanced quality with better detail
- **Gemini Imagen 4 Ultra**: Premium quality, slower generation
- **Google Veo 3**: Advanced video generation with cinematic quality
- **Runway ML**: Alternative video generation (mock implementation)

### Content Optimization
- **Brand-Specific Prompts**: All content optimized for Printerpix products
- **Marketing Focus**: Prompts designed for high-conversion social media content
- **Multi-Country Support**: Styling rules for different markets
- **Seasonal Adaptation**: Content adapted for different seasons and occasions

### User Experience
- **Dual Interface**: Separate optimized interfaces for images and videos
- **Real-time Feedback**: Loading states, timing information, and error handling
- **Visual Selection**: Click-to-select with visual feedback
- **Full-screen Preview**: Expand content for detailed viewing
- **Responsive Design**: Works seamlessly on desktop and mobile

## 🔒 Security & Best Practices

- **Environment Variables**: All API keys stored securely
- **Input Validation**: Comprehensive validation and sanitization
- **Error Handling**: Graceful error handling with user feedback
- **File Upload Security**: Secure file handling with size limits
- **CORS Configuration**: Proper cross-origin resource sharing setup

## 🚀 Deployment Options

### Cloud Platforms
- **Heroku**: Easy deployment with environment variables
- **Vercel**: Serverless deployment option
- **AWS/GCP**: Full control deployment with scaling
- **Railway**: Modern deployment platform

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 API Endpoints

### Image Generation
- `POST /api/imagen3` - Generate image using Imagen 3
- `POST /api/imagen4` - Generate image using Imagen 4
- `POST /api/imagen4ultra` - Generate image using Imagen 4 Ultra

### Video Generation
- `POST /api/veo/video` - Generate video using Google Veo 3
- `POST /api/runway/video` - Generate video using Runway ML
- `GET /api/veo/proxy/*` - Proxy for Veo video files

### Content Enhancement
- `POST /api/enhance-prompt` - Enhance image prompts
- `POST /api/enhance-video-prompt` - Enhance video prompts
- `POST /api/generate-caption` - Generate image captions
- `POST /api/generate-video-caption` - Generate video captions

### System Management
- `GET /api/system-prompts` - Get current system prompts
- `POST /api/system-prompts` - Update system prompts

### Instagram Integration
- `POST /api/instagram/post` - Post image to Instagram
- `POST /api/instagram/post-video` - Post video to Instagram

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

## 📝 License

This project is proprietary software developed for Printerpix. All rights reserved.

## 📞 Support

For technical support and questions:
- **Create an issue** in the GitHub repository
- **Contact the development team** for urgent matters
- **Check the documentation** for common solutions

---

**Built with ❤️ for Printerpix Marketing Team**