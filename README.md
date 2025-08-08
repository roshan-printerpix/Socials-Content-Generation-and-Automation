# Printerpix AI Image Generator & Instagram Poster

A powerful web application that generates marketing images using multiple AI models and automatically posts them to Instagram with AI-generated captions.

## 🚀 Features

### Image Generation
- **Multiple AI Models**: Generate images using Gemini Imagen 3, Imagen 4, and Imagen 4 Ultra
- **Prompt Enhancement**: AI-powered prompt enhancement using GPT-4o
- **Visual Selection**: Click to select images with visual feedback
- **Full Screen View**: Expand images for detailed viewing

### Content Creation
- **AI Caption Generation**: Automatically generate Instagram-ready captions and hashtags
- **Editable Content**: Modify captions and hashtags before posting
- **Printerpix Branding**: Optimized for Printerpix marketing content

### Instagram Integration
- **Direct Posting**: Post selected images directly to Instagram
- **Image Upload**: Automatic image processing and upload
- **Post Management**: Track posting status and results

### System Management
- **Dynamic Prompts**: Edit system prompts through a user-friendly interface
- **Real-time Updates**: Changes apply immediately without server restart
- **Settings Modal**: Clean popup interface for configuration

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **AI Services**: 
  - OpenAI GPT-4o (prompt enhancement & caption generation)
  - Google Gemini Imagen (image generation)
- **File Upload**: Multer
- **Instagram API**: Meta Graph API integration

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd <your-repo-name>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key
   GEMINI_API_KEY=your_gemini_api_key
   INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token
   INSTAGRAM_BUSINESS_ACCOUNT_ID=your_business_account_id
   ```

4. **Start the application**
   ```bash
   npm start
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

## 🎯 Usage

### Basic Workflow
1. **Enter a basic prompt** in the first text box
2. **Click "Enhance Prompt"** to generate a detailed, marketing-optimized prompt
3. **Edit the enhanced prompt** if needed
4. **Click "Generate Post"** to create images and caption
5. **Select an image** by clicking on it
6. **Review and edit** the generated caption and hashtags
7. **Click "Post to Instagram"** to publish

### System Prompts Configuration
1. **Click the gear icon** in the top-right corner
2. **Edit the system prompts** for prompt enhancement and caption generation
3. **Save changes** to apply immediately

## 🔧 Configuration

### Instagram API Setup
To enable Instagram posting, you need to:

1. **Create a Facebook/Meta App**
2. **Set up Instagram Business Account**
3. **Generate Access Tokens**
4. **Add credentials to `.env` file**

### AI Model Configuration
- **OpenAI**: Requires API key for GPT-4o access
- **Google Gemini**: Requires API key for Imagen model access

## 📁 Project Structure

```
├── app.html              # Frontend application
├── server.js             # Backend server
├── package.json          # Dependencies and scripts
├── .env                  # Environment variables (not in repo)
├── .gitignore           # Git ignore rules
└── README.md            # Project documentation
```

## 🎨 Features in Detail

### Image Generation Models
- **Gemini Imagen 3**: Standard quality, faster generation
- **Gemini Imagen 4**: Enhanced quality and detail
- **Gemini Imagen 4 Ultra**: Premium quality, slower generation

### AI-Powered Content
- **Prompt Enhancement**: Transforms basic prompts into detailed, marketing-optimized descriptions
- **Caption Generation**: Creates engaging Instagram captions with proper hashtags
- **Printerpix Focus**: All content optimized for Printerpix brand and products

### User Interface
- **Responsive Design**: Works on desktop and mobile devices
- **Printerpix Branding**: Pink color scheme matching brand identity
- **Intuitive Controls**: Easy-to-use interface with visual feedback

## 🔒 Security

- Environment variables for API keys
- Input validation and sanitization
- Error handling and user feedback
- Secure file upload handling

## 🚀 Deployment

The application can be deployed to various platforms:
- **Heroku**: Easy deployment with environment variables
- **Vercel**: Serverless deployment option
- **AWS/GCP**: Full control deployment
- **Docker**: Containerized deployment

## 📝 License

This project is licensed under the terms specified in the LICENSE file.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions, please open an issue in the GitHub repository.

---

**Built with ❤️ for Printerpix**