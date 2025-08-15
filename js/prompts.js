// System Prompts Configuration
class PromptsManager {
    constructor() {
        this.initElements();
        this.initEventListeners();
        this.loadPrompts();
    }

    initElements() {
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.errorMessage = document.getElementById('errorMessage');
        this.promptsForm = document.getElementById('promptsForm');
        this.retryBtn = document.getElementById('retryBtn');
        this.saveBtn = document.getElementById('saveBtn');

        
        // Prompt textareas
        this.imageEnhancePrompt = document.getElementById('imageEnhancePrompt');
        this.imageCaptionPrompt = document.getElementById('imageCaptionPrompt');
        this.videoEnhancePrompt = document.getElementById('videoEnhancePrompt');
        this.videoCaptionPrompt = document.getElementById('videoCaptionPrompt');
    }

    initEventListeners() {
        this.retryBtn.addEventListener('click', () => this.loadPrompts());
        this.saveBtn.addEventListener('click', () => this.savePrompts());
        
        // Auto-save indicator (optional)
        const textareas = [this.imageEnhancePrompt, this.imageCaptionPrompt, this.videoEnhancePrompt, this.videoCaptionPrompt];
        textareas.forEach(textarea => {
            textarea.addEventListener('input', () => this.markAsModified());
        });
    }

    async loadPrompts() {
        this.showLoading();
        
        try {
            const response = await fetch('/api/system-prompts');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const prompts = await response.json();
            this.populatePrompts(prompts);
            this.showForm();
            
        } catch (error) {
            console.error('Error loading system prompts:', error);
            this.showError();
        }
    }

    populatePrompts(prompts) {
        this.imageEnhancePrompt.value = prompts.imageEnhancePrompt || '';
        this.imageCaptionPrompt.value = prompts.imageCaptionPrompt || '';
        this.videoEnhancePrompt.value = prompts.videoEnhancePrompt || '';
        this.videoCaptionPrompt.value = prompts.videoCaptionPrompt || '';
        
        // Reset modified state
        this.markAsSaved();
    }

    async savePrompts() {
        const imageEnhancePrompt = this.imageEnhancePrompt.value.trim();
        const imageCaptionPrompt = this.imageCaptionPrompt.value.trim();
        const videoEnhancePrompt = this.videoEnhancePrompt.value.trim();
        const videoCaptionPrompt = this.videoCaptionPrompt.value.trim();

        // Disable save button and show loading state
        this.saveBtn.disabled = true;
        this.saveBtn.textContent = 'Saving...';

        try {
            const response = await fetch('/api/system-prompts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    imageEnhancePrompt,
                    imageCaptionPrompt,
                    videoEnhancePrompt,
                    videoCaptionPrompt
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save prompts');
            }

            // Show success message
            this.showSuccessMessage('System prompts saved successfully!');
            this.markAsSaved();

        } catch (error) {
            console.error('Error saving system prompts:', error);
            this.showErrorMessage('Error saving system prompts. Please try again.');
        } finally {
            this.saveBtn.disabled = false;
            this.saveBtn.textContent = 'Save Changes';
        }
    }

    async resetToDefaults() {
        const confirmed = confirm('Are you sure you want to reset all prompts to their default values? This action cannot be undone.');
        
        if (!confirmed) return;

        // Reset to default prompts (you can customize these)
        const defaultPrompts = {
            imageEnhancePrompt: 'You are an expert AI prompt engineer. Take the basic prompt provided and enhance it with detailed descriptions, artistic style, lighting, composition, and technical specifications to create a comprehensive prompt for AI image generation. Keep the core concept but make it more vivid and specific.',
            imageCaptionPrompt: 'Create an engaging Instagram caption for this AI-generated image. Include relevant hashtags, a compelling description, and call-to-action. Keep it authentic and engaging while highlighting the creative aspect of AI-generated content.',
            videoEnhancePrompt: 'You are an expert AI prompt engineer for video generation. Take the basic prompt and enhance it with detailed scene descriptions, camera movements, lighting, mood, and technical specifications to create a comprehensive prompt for AI video generation.',
            videoCaptionPrompt: 'Create an engaging Instagram caption for this AI-generated video. Include relevant hashtags, a compelling description about the video content, and call-to-action. Emphasize the innovative nature of AI-generated video content.'
        };

        this.populatePrompts(defaultPrompts);
        this.markAsModified();
    }

    showLoading() {
        this.loadingIndicator.style.display = 'flex';
        this.errorMessage.style.display = 'none';
        this.promptsForm.style.display = 'none';
    }

    showError() {
        this.loadingIndicator.style.display = 'none';
        this.errorMessage.style.display = 'block';
        this.promptsForm.style.display = 'none';
    }

    showForm() {
        this.loadingIndicator.style.display = 'none';
        this.errorMessage.style.display = 'none';
        this.promptsForm.style.display = 'block';
    }

    markAsModified() {
        this.saveBtn.classList.add('modified');
        this.saveBtn.textContent = 'Save Changes *';
    }

    markAsSaved() {
        this.saveBtn.classList.remove('modified');
        this.saveBtn.textContent = 'Save Changes';
    }

    showSuccessMessage(message) {
        // Create temporary success message
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(successDiv);

        // Remove after 3 seconds
        setTimeout(() => {
            successDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (successDiv.parentNode) {
                    successDiv.parentNode.removeChild(successDiv);
                }
            }, 300);
        }, 3000);
    }

    showErrorMessage(message) {
        // Create temporary error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message-toast';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc2626;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(errorDiv);

        // Remove after 4 seconds
        setTimeout(() => {
            errorDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 300);
        }, 4000);
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the prompts manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.promptsManager = new PromptsManager();
});