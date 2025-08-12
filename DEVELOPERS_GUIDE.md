# Printerpix AI Studio - Developer's Guide

A comprehensive technical guide covering the complete architecture, file structure, and functionality of the Printerpix AI Studio application.

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Design Patterns](#architecture--design-patterns)
3. [Complete File Structure](#complete-file-structure)
4. [Core Components](#core-components)
5. [API Architecture](#api-architecture)
6. [Frontend Architecture](#frontend-architecture)
7. [AI Integration](#ai-integration)
8. [Data Flow](#data-flow)
9. [Development Workflow](#development-workflow)
10. [Deployment Guide](#deployment-guide)

## 🎯 Project Overview

Printerpix AI Studio is a full-stack web application designed to generate marketing content (images and videos) using multiple AI models, with automatic Instagram posting capabilities. The application is specifically tailored for Printerpix brand marketing with intelligent prompt optimization and content generation.

### Key Technologies
- **Backend**: Node.js, Express.js
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **AI Services**: OpenAI GPT-4o, Google Gemini (Imagen & Veo)
- **Cloud Services**: Cloudinary, Meta Graph API
- **Development**: Git integration, file-based configuration

## 🏗️ Architecture & Design Patterns

### Application Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   AI Services   │
│   (Browser)     │◄──►│   (Node.js)     │◄──►│   (APIs)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Interface│    │   File System   │    │   Cloud Storage │
│   Components    │    │   & Git         │    │   (Cloudinary)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Design Patterns Used
- **MVC Pattern**: Separation of concerns between frontend, backend, and data
- **Factory Pattern**: AI model generation handlers
- **Observer Pattern**: Real-time UI updates and error handling
- **Strategy Pattern**: Different AI models with unified interface
- **Singleton Pattern**: Prompt manager and configuration

## 📁 Complete File Structure

```
printerpix-ai-studio/
├── 📄 README.md                           # Project documentation and setup guide
├── 📄 DEVELOPERS_GUIDE.md                 # This comprehensive developer guide
├── 📄 PROMPT_MANAGEMENT.md                # Prompt system documentation
├── 📄 package.json                        # Node.js dependencies and scripts
├── 📄 package-lock.json                   # Locked dependency versions
├── 📄 server.js                           # Main Express.js server application
├── 📄 .env                                # Environment variables (not in repo)
├── 📄 .gitignore                          # Git ignore patterns
│
├── 📁 Frontend Pages/
│   ├── 📄 app.html                        # Main image generation interface
│   └── 📄 videos.html                     # Video generation interface
│
├── 📁 components/                         # Reusable UI components
│   └── 📄 navbar.html                     # Navigation bar component
│
├── 📁 css/                                # Stylesheets and design system
│   ├── 📄 main.css                        # Core application styles
│   ├── 📄 navbar.css                      # Navigation component styles
│   └── 📄 settings.css                    # Settings modal styles
│
├── 📁 js/                                 # Frontend JavaScript modules
│   ├── 📄 images.js                       # Image generation logic
│   └── 📄 videos.js                       # Video generation logic
│
├── 📁 prompts/                            # AI system prompts (file-based config)
│   ├── 📄 image-enhance-prompt.md         # Image prompt enhancement system prompt
│   ├── 📄 image-caption-prompt.md         # Image caption generation system prompt
│   ├── 📄 video-enhance-prompt.md         # Video prompt enhancement system prompt
│   └── 📄 video-caption-prompt.md         # Video caption generation system prompt
│
├── 📁 utils/                              # Backend utility modules
│   └── 📄 promptManager.js                # Prompt management and Git integration
│
├── 📁 temp/                               # Temporary file storage
│   └── 📄 veo_video_1754655723545.mp4    # Example generated video file
│
└── 📁 node_modules/                       # NPM dependencies (auto-generated)
```

## 🔧 Core Components

### 1. Server Application (`server.js`)
**Purpose**: Main Express.js server handling all API endpoints and business logic

**Key Responsibilities**:
- API endpoint routing and handling
- AI service integration (OpenAI, Google Gemini)
- File upload processing with Multer
- Instagram API integration
- Prompt management system
- Error handling and logging

**Major Sections**:
```javascript
// Service Initialization
- OpenAI client setup
- Google GenAI initialization
- Cloudinary configuration
- Express middleware setup

// Image Generation Endpoints
- /api/imagen3 - Gemini Imagen 3
- /api/imagen4 - Gemini Imagen 4  
- /api/imagen4ultra - Gemini Imagen 4 Ultra

// Video Generation Endpoints
- /api/veo/video - Google Veo 3
- /api/runway/video - Runway ML (mock)
- /api/veo/proxy/* - Video file proxy

// Content Enhancement
- /api/enhance-prompt - Image prompt enhancement
- /api/enhance-video-prompt - Video prompt enhancement
- /api/generate-caption - Image caption generation
- /api/generate-video-caption - Video caption generation

// System Management
- /api/system-prompts - GET/POST prompt management

// Instagram Integration
- /api/instagram/post - Image posting
- /api/instagram/post-video - Video posting
```

### 2. Frontend Pages

#### `app.html` - Image Generation Interface
**Purpose**: Main user interface for image generation workflow

**Key Features**:
- Prompt input and enhancement
- Three-column image generation display
- Image selection and preview
- Caption editing and Instagram posting
- Settings modal integration

**UI Components**:
- Floating navigation bar
- Settings gear button
- Prompt input sections
- Image result cards with expand functionality
- Caption generation area
- Instagram posting controls

#### `videos.html` - Video Generation Interface  
**Purpose**: Dedicated interface for video content generation

**Key Features**:
- Video prompt input and enhancement
- Two-column video generation display
- Video selection and preview
- Video caption editing
- Instagram video posting (mock)

### 3. JavaScript Modules

#### `js/images.js` - Image Generation Logic
**Purpose**: Frontend logic for image generation workflow

**Key Classes & Methods**:
```javascript
class ImageGenerator {
    // Core Methods
    enhancePrompt()           // Enhance user prompts via OpenAI
    generateImages()          // Generate images from all models
    generateCaption()         // Generate Instagram captions
    postToInstagram()         // Post selected image to Instagram
    
    // UI Management
    updateButtonStates()      // Enable/disable buttons based on state
    initImageSelection()      // Handle image selection logic
    expandImage()             // Full-screen image preview
    
    // Settings Management
    openSettingsModal()       // Open system prompts configuration
    saveSystemPrompts()       // Save and commit prompt changes
    
    // Individual Model Handlers
    generateGemini()          // Imagen 3 generation
    generateGemini4()         // Imagen 4 generation  
    generateGemini4Ultra()    // Imagen 4 Ultra generation
}
```

#### `js/videos.js` - Video Generation Logic
**Purpose**: Frontend logic for video generation workflow

**Key Classes & Methods**:
```javascript
class VideoGenerator {
    // Core Methods
    enhanceVideoPrompt()      // Enhance video prompts
    generateVideos()          // Generate videos from all models
    generateVideoCaption()    // Generate video captions
    postVideoToInstagram()    // Post selected video to Instagram
    
    // UI Management  
    updateVideoButtonStates() // Button state management
    initVideoSelection()      // Video selection logic
    expandVideo()             // Full-screen video preview
    
    // Individual Model Handlers
    generateRunway()          // Runway ML generation (mock)
    generateVeo()             // Google Veo 3 generation
}
```

### 4. Styling System

#### `css/main.css` - Core Application Styles
**Purpose**: Main stylesheet defining the application's visual design

**Key Style Categories**:
```css
/* Layout & Structure */
- Container and grid systems
- Responsive design breakpoints
- Flexbox and CSS Grid layouts

/* Component Styles */
- Input fields and textareas
- Buttons and interactive elements
- Cards and result displays
- Loading states and animations

/* Branding & Theme */
- Printerpix pink color scheme
- Gradient backgrounds
- Typography and font hierarchy
- Box shadows and visual effects

/* Interactive States */
- Hover and focus effects
- Selection and active states
- Transition animations
- Error and success states
```

#### `css/navbar.css` - Navigation Styles
**Purpose**: Floating navigation bar styling

**Features**:
- Glassmorphism effect with backdrop blur
- Responsive positioning and sizing
- Active state indicators
- Smooth transitions

#### `css/settings.css` - Settings Modal Styles
**Purpose**: Configuration modal styling

**Features**:
- Modal overlay and positioning
- Form styling for prompt editing
- Button styling and interactions
- Responsive modal design

### 5. Prompt Management System

#### `utils/promptManager.js` - Prompt Management
**Purpose**: File-based prompt management with Git integration

**Key Features**:
```javascript
class PromptManager {
    loadPrompts()           // Load all prompts from markdown files
    savePrompt()            // Save individual prompt to file
    commitPromptChange()    // Auto-commit changes to Git
    getPromptDisplayName()  // Get human-readable prompt names
}
```

**Prompt Files**:
- `prompts/image-enhance-prompt.md` - Image prompt enhancement system prompt
- `prompts/image-caption-prompt.md` - Image caption generation system prompt  
- `prompts/video-enhance-prompt.md` - Video prompt enhancement system prompt
- `prompts/video-caption-prompt.md` - Video caption generation system prompt

## 🔌 API Architecture

### RESTful Endpoint Design

#### Image Generation Endpoints
```
POST /api/imagen3
├── Request: { prompt: string }
├── Response: { base64: string }
└── Purpose: Generate image using Gemini Imagen 3

POST /api/imagen4  
├── Request: { prompt: string }
├── Response: { base64: string }
└── Purpose: Generate image using Gemini Imagen 4

POST /api/imagen4ultra
├── Request: { prompt: string }
├── Response: { base64: string }
└── Purpose: Generate image using Gemini Imagen 4 Ultra
```

#### Video Generation Endpoints
```
POST /api/veo/video
├── Request: { prompt: string }
├── Response: { success: boolean, videoUrl: string, model: string }
└── Purpose: Generate video using Google Veo 3

POST /api/runway/video
├── Request: { prompt: string }  
├── Response: { videoUrl: string, model: string, duration: string }
└── Purpose: Generate video using Runway ML (mock)

GET /api/veo/proxy/*
├── Purpose: Proxy authenticated video file downloads
└── Response: Video file stream
```

#### Content Enhancement Endpoints
```
POST /api/enhance-prompt
├── Request: { prompt: string }
├── Response: { enhancedPrompt: string }
└── Purpose: Enhance image prompts using GPT-4o

POST /api/enhance-video-prompt
├── Request: { prompt: string }
├── Response: { enhancedPrompt: string }  
└── Purpose: Enhance video prompts using GPT-4o

POST /api/generate-caption
├── Request: { prompt: string }
├── Response: { caption: string, tags: string }
└── Purpose: Generate Instagram captions for images

POST /api/generate-video-caption
├── Request: { prompt: string }
├── Response: { caption: string, tags: string }
└── Purpose: Generate Instagram captions for videos
```

#### System Management Endpoints
```
GET /api/system-prompts
├── Response: { imageEnhancePrompt: string, imageCaptionPrompt: string, ... }
└── Purpose: Retrieve all system prompts

POST /api/system-prompts
├── Request: { imageEnhancePrompt?: string, imageCaptionPrompt?: string, ... }
├── Response: { success: boolean, message: string, updatedPrompts: string[] }
└── Purpose: Update system prompts and auto-commit to Git
```

#### Instagram Integration Endpoints
```
POST /api/instagram/post
├── Request: FormData { image: File, caption: string, model: string }
├── Response: { success: boolean, postId: string, imageUrl: string }
└── Purpose: Post image to Instagram via Meta Graph API

POST /api/instagram/post-video
├── Request: FormData { video: File, caption: string, model: string }
├── Response: { success: boolean, postId: string, message: string }
└── Purpose: Post video to Instagram (mock implementation)
```

## 🎨 Frontend Architecture

### Component-Based Design

#### Page Components
- **Image Generation Page** (`app.html`)
  - Prompt input section
  - Image generation grid (3 columns)
  - Caption editing section
  - Instagram posting controls

- **Video Generation Page** (`videos.html`)
  - Video prompt input section
  - Video generation grid (2 columns)
  - Video caption editing section
  - Video posting controls

#### Shared Components
- **Navigation Bar** (`components/navbar.html`)
  - Brand logo and title
  - Page navigation links
  - Active state management

- **Settings Modal** (dynamically generated)
  - System prompt editing interface
  - Save/cancel actions
  - Real-time validation

### State Management

#### Frontend State
```javascript
// Image Generator State
{
    promptInput: string,
    enhancedPrompt: string,
    selectedCard: string | null,
    generatedImages: {
        imagen3: string | null,
        imagen4: string | null,
        imagen4ultra: string | null
    },
    postContent: string,
    isGenerating: boolean,
    isPosting: boolean
}

// Video Generator State  
{
    videoPromptInput: string,
    videoEnhancedPrompt: string,
    selectedVideoCard: string | null,
    generatedVideos: {
        runway: string | null,
        veo: string | null
    },
    videoPostContent: string,
    isGenerating: boolean,
    isPosting: boolean
}
```

### Event Handling System

#### User Interactions
```javascript
// Button Events
enhanceBtn.click → enhancePrompt()
generateBtn.click → generateImages()
postBtn.click → postToInstagram()
settingsBtn.click → openSettingsModal()

// Input Events
promptInput.input → updateButtonStates()
enhancedPrompt.input → updateButtonStates()

// Card Events
resultCard.click → selectImage() | expandImage()
expandIcon.click → expandImage()

// Keyboard Events
promptInput.keydown(Ctrl+Enter) → generateImages()
```

## 🤖 AI Integration

### OpenAI Integration
```javascript
// GPT-4o for Prompt Enhancement
const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ 
        role: 'user', 
        content: `${systemPrompt}\n\nUser scenario: ${prompt}` 
    }],
    temperature: 1
});

// GPT-4o for Caption Generation
const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ 
        role: 'user', 
        content: captionPrompt.replace('{prompt}', prompt) 
    }],
    temperature: 0.8
});
```

### Google Gemini Integration
```javascript
// Imagen Models for Image Generation
const response = await googleAI.models.generateImages({
    model: 'imagen-3.0-generate-002', // or imagen-4.0-*, imagen-4.0-ultra-*
    prompt,
    config: { numberOfImages: 1, aspectRatio: '1:1' }
});

// Veo 3 for Video Generation
const operation = await googleAI.models.generateVideos({
    model: 'veo-3.0-generate-preview',
    prompt
});

// Polling for Video Completion
while (!operation.done) {
    await new Promise(r => setTimeout(r, 10_000));
    operation = await googleAI.operations.get({ name: operation.name });
}
```

### AI Model Comparison

| Model | Type | Quality | Speed | Use Case |
|-------|------|---------|-------|----------|
| Imagen 3 | Image | Standard | Fast | Quick previews |
| Imagen 4 | Image | High | Medium | Production content |
| Imagen 4 Ultra | Image | Premium | Slow | Hero images |
| Veo 3 | Video | High | Very Slow | Marketing videos |
| Runway ML | Video | High | Medium | Alternative videos (mock) |

## 🔄 Data Flow

### Image Generation Flow
```
User Input → Prompt Enhancement → Image Generation → Caption Generation → Instagram Posting
     ↓              ↓                    ↓                 ↓                ↓
1. Basic prompt  2. GPT-4o         3. Imagen models   4. GPT-4o        5. Meta Graph API
   validation       enhancement       (3 parallel)      captions         + Cloudinary
```

### Video Generation Flow  
```
User Input → Prompt Enhancement → Video Generation → Caption Generation → Instagram Posting
     ↓              ↓                    ↓                 ↓                ↓
1. Basic prompt  2. GPT-4o         3. Veo 3 + Runway  4. GPT-4o        5. Mock API
   validation       enhancement       (2 parallel)      captions         (placeholder)
```

### System Prompt Management Flow
```
UI Settings → Prompt Validation → File System → Git Commit → Memory Update
     ↓              ↓                  ↓           ↓            ↓
1. Modal form   2. Content         3. Write to    4. Auto      5. Reload
   submission      validation        .md files      commit       prompts
```

## 🛠️ Development Workflow

### Local Development Setup
```bash
# 1. Clone and install
git clone <repo-url>
cd printerpix-ai-studio
npm install

# 2. Environment setup
cp .env.example .env
# Edit .env with your API keys

# 3. Start development server
npm run dev
# or
npm start

# 4. Open browser
open http://localhost:3000
```

### Code Organization Principles

#### Backend (`server.js`)
- **Service initialization** at the top
- **Middleware configuration** before routes
- **Route grouping** by functionality
- **Error handling** with try-catch blocks
- **Logging** for debugging and monitoring

#### Frontend (`js/*.js`)
- **Class-based organization** for each page
- **Method grouping** by functionality
- **Event listener setup** in constructor
- **State management** through class properties
- **Error handling** with user feedback

#### Styling (`css/*.css`)
- **Mobile-first** responsive design
- **Component-based** styling approach
- **CSS custom properties** for theming
- **Consistent naming** conventions
- **Performance optimization** with efficient selectors

### Git Workflow

#### Automatic Commits (Prompt Changes)
```bash
# When prompts are updated via UI:
git add prompts/<filename>.md
git commit -m "update: <prompt name> prompt changed"
git push origin main  # (optional, can be enabled)
```

#### Manual Development Commits
```bash
# Feature development
git checkout -b feature/new-feature
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# Bug fixes
git checkout -b fix/bug-description
git add .
git commit -m "fix: resolve bug description"
git push origin fix/bug-description
```

### Testing Strategy

#### Manual Testing Checklist
- [ ] Image generation with all three models
- [ ] Video generation with available models
- [ ] Prompt enhancement functionality
- [ ] Caption generation
- [ ] Image/video selection
- [ ] Instagram posting (with test account)
- [ ] Settings modal and prompt editing
- [ ] Responsive design on mobile
- [ ] Error handling and user feedback

#### API Testing
```bash
# Test image generation
curl -X POST http://localhost:3000/api/imagen3 \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test prompt"}'

# Test prompt enhancement
curl -X POST http://localhost:3000/api/enhance-prompt \
  -H "Content-Type: application/json" \
  -d '{"prompt": "basic prompt"}'

# Test system prompts
curl http://localhost:3000/api/system-prompts
```

## 🚀 Deployment Guide

### Environment Variables Setup
```env
# Required for all deployments
OPENAI_API_KEY=sk-proj-...
GEMINI_API_KEY=AIzaSy...

# Required for Instagram posting
INSTAGRAM_ACCESS_TOKEN=EAAB...
IG_USER_ID=1784...

# Required for image/video storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=your_secret

# Optional: Port configuration
PORT=3000
```

### Heroku Deployment
```bash
# 1. Create Heroku app
heroku create printerpix-ai-studio

# 2. Set environment variables
heroku config:set OPENAI_API_KEY=your_key
heroku config:set GEMINI_API_KEY=your_key
# ... set all required env vars

# 3. Deploy
git push heroku main

# 4. Open app
heroku open
```

### Docker Deployment
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start application
CMD ["npm", "start"]
```

### Production Considerations

#### Performance Optimization
- **Image compression** before Instagram posting
- **Request rate limiting** for AI APIs
- **Caching** for frequently used prompts
- **CDN integration** for static assets
- **Database integration** for user data (future)

#### Security Measures
- **API key rotation** schedule
- **Input sanitization** and validation
- **CORS configuration** for production domains
- **HTTPS enforcement** in production
- **File upload restrictions** and scanning

#### Monitoring & Logging
- **Application performance monitoring** (APM)
- **Error tracking** and alerting
- **API usage monitoring** and quotas
- **User analytics** and behavior tracking
- **System health checks** and uptime monitoring

#### Scaling Considerations
- **Horizontal scaling** with load balancers
- **Database integration** for persistent storage
- **Queue system** for long-running AI operations
- **Microservices architecture** for larger scale
- **CDN integration** for global performance

---

This developer's guide provides a comprehensive overview of the Printerpix AI Studio application architecture, implementation details, and development workflows. For specific implementation questions or contributions, refer to the individual file documentation and code comments.