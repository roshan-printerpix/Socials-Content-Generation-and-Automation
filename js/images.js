// Image Generator Class
class ImageGenerator {
    constructor() {
        this.promptInput = document.getElementById('promptInput');
        this.enhancedPrompt = document.getElementById('enhancedPrompt');
        this.enhanceBtn = document.getElementById('enhanceBtn');
        this.generateBtn = document.getElementById('generateBtn');
        this.geminiResult = document.getElementById('geminiResult');
        this.gemini4Result = document.getElementById('gemini4Result');
        this.gemini4UltraResult = document.getElementById('gemini4UltraResult');
        this.postContent = document.getElementById('postContent');
        this.captionTiming = document.getElementById('captionTiming');
        this.enhancedTiming = document.getElementById('enhancedTiming');
        this.postBtn = document.getElementById('postBtn');
        this.promptsBtn = document.getElementById('promptsBtn');
        this.selectedCard = null;

        this.initEventListeners();
    }

    initEventListeners() {
        this.enhanceBtn.addEventListener('click', () => this.enhancePrompt());
        this.generateBtn.addEventListener('click', () => this.generateImages());
        this.postBtn.addEventListener('click', () => this.postToInstagram());
        this.promptsBtn.addEventListener('click', () => this.openSettingsModal());

        // Enable/disable buttons based on input
        this.promptInput.addEventListener('input', () => this.updateButtonStates());
        this.enhancedPrompt.addEventListener('input', () => this.updateButtonStates());

        this.promptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.generateImages();
            }
        });

        // Initial button state
        this.updateButtonStates();
        this.updatePostButtonState();

        // Add click listeners for image selection
        this.initImageSelection();
    }

    updateButtonStates() {
        const hasBasicPrompt = this.promptInput.value.trim().length > 0;
        const hasEnhancedPrompt = this.enhancedPrompt.value.trim().length > 0;

        // Enable enhance button only if basic prompt exists
        this.enhanceBtn.disabled = !hasBasicPrompt;

        // Enable generate button if either basic or enhanced prompt exists
        this.generateBtn.disabled = !hasBasicPrompt && !hasEnhancedPrompt;
    }

    updatePostButtonState() {
        // Enable post button only if an image is selected
        this.postBtn.disabled = !this.selectedCard;
    }

    async enhancePrompt() {
        const basicPrompt = this.promptInput.value.trim();

        if (!basicPrompt) {
            alert('Please enter a basic prompt first!');
            return;
        }

        this.enhanceBtn.disabled = true;
        this.enhanceBtn.textContent = 'Enhancing...';

        const startTime = Date.now();

        try {
            const response = await fetch('/api/enhance-prompt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: basicPrompt
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const endTime = Date.now();
            const duration = Math.round((endTime - startTime) / 1000);

            this.enhancedPrompt.value = data.enhancedPrompt;

            // Show timing
            this.enhancedTiming.textContent = `Enhanced in ${duration}s`;
            this.enhancedTiming.style.display = 'block';

        } catch (error) {
            console.error('Enhance Error:', error);
            alert(`Error enhancing prompt: ${error.message}`);
        } finally {
            this.enhanceBtn.disabled = false;
            this.enhanceBtn.textContent = 'Enhance Prompt';
        }
    }

    async generateImages() {
        const prompt = this.enhancedPrompt.value.trim() || this.promptInput.value.trim();

        if (!prompt) {
            alert('Please enter a prompt first!');
            return;
        }

        this.generateBtn.disabled = true;
        this.generateBtn.textContent = 'Generating...';

        // Show loading states
        this.showLoading(this.geminiResult);
        this.showLoading(this.gemini4Result);
        this.showLoading(this.gemini4UltraResult);

        // Generate images concurrently
        const promises = [
            this.generateGemini(prompt),
            this.generateGemini4(prompt),
            this.generateGemini4Ultra(prompt)
        ];

        try {
            await Promise.allSettled(promises);
        } finally {
            this.generateBtn.disabled = false;
            this.generateBtn.textContent = 'Generate Post';

            // Generate caption and tags
            this.generateCaption(prompt);
        }
    }

    showLoading(element) {
        element.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    }

    showError(element, message) {
        element.innerHTML = `<div class="error">${message}</div>`;
    }

    showImage(element, imageUrl, timing) {
        const timingText = timing ? `Generated in ${timing}` : '';
        // Get the parent card to add timing info outside the image container
        const parentCard = element.parentElement;

        // Update the image container
        element.innerHTML = `<img src="${imageUrl}" alt="Generated image" style="width: 100%; height: 100%; object-fit: cover;">`;

        // Remove any existing timing info
        const existingTiming = parentCard.querySelector('.timing-info');
        if (existingTiming) {
            existingTiming.remove();
        }

        // Add timing info below the image container if timing exists
        if (timingText) {
            const timingDiv = document.createElement('div');
            timingDiv.className = 'timing-info';
            timingDiv.textContent = timingText;
            parentCard.appendChild(timingDiv);
        }
    }

    async generateGemini(prompt) {
        const startTime = Date.now();
        try {
            const response = await fetch('/api/imagen3', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: prompt
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000).toFixed(1);

            if (data.base64) {
                // Gemini returns base64 encoded image
                const imageUrl = `data:image/png;base64,${data.base64}`;
                this.showImage(this.geminiResult, imageUrl, `${duration}s`);
            } else {
                throw new Error('No image data in response');
            }

        } catch (error) {
            console.error('Gemini Error:', error);
            this.showError(this.geminiResult, `Error: ${error.message}`);
        }
    }

    async generateGemini4(prompt) {
        const startTime = Date.now();
        try {
            const response = await fetch('/api/imagen4', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: prompt
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000).toFixed(1);

            if (data.base64) {
                const imageUrl = `data:image/png;base64,${data.base64}`;
                this.showImage(this.gemini4Result, imageUrl, `${duration}s`);
            } else {
                throw new Error('No image data in response');
            }

        } catch (error) {
            console.error('Gemini 4 Error:', error);
            this.showError(this.gemini4Result, `Error: ${error.message}`);
        }
    }

    async generateGemini4Ultra(prompt) {
        const startTime = Date.now();
        try {
            const response = await fetch('/api/imagen4ultra', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: prompt
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000).toFixed(1);

            if (data.base64) {
                const imageUrl = `data:image/png;base64,${data.base64}`;
                this.showImage(this.gemini4UltraResult, imageUrl, `${duration}s`);
            } else {
                throw new Error('No image data in response');
            }

        } catch (error) {
            console.error('Gemini 4 Ultra Error:', error);
            this.showError(this.gemini4UltraResult, `Error: ${error.message}`);
        }
    }

    initImageSelection() {
        const cards = document.querySelectorAll('.result-card');
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't trigger selection if clicking on expand icon
                if (e.target.closest('.expand-icon')) {
                    this.expandImage(card);
                    return;
                }

                // Toggle selection
                if (card.classList.contains('selected')) {
                    card.classList.remove('selected');
                    this.selectedCard = null;
                } else {
                    // Remove selection from all cards
                    cards.forEach(c => c.classList.remove('selected'));
                    // Add selection to clicked card
                    card.classList.add('selected');
                    this.selectedCard = card.dataset.model;
                }

                // Update post button state
                this.updatePostButtonState();
            });
        });
    }

    expandImage(card) {
        const imageElement = card.querySelector('img');
        if (!imageElement) return;

        // Create modal overlay
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            cursor: pointer;
        `;

        // Create enlarged image
        const enlargedImg = document.createElement('img');
        enlargedImg.src = imageElement.src;
        enlargedImg.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            border-radius: 10px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        `;

        modal.appendChild(enlargedImg);
        document.body.appendChild(modal);

        // Close modal on click
        modal.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    async generateCaption(prompt) {
        const startTime = Date.now();

        try {
            const response = await fetch('/api/generate-caption', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: prompt
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const endTime = Date.now();
            const duration = Math.round((endTime - startTime) / 1000);

            // Combine caption and hashtags with line break
            const postText = `${data.caption}\n\n${data.tags}`;
            this.postContent.value = postText;

            // Show timing
            this.captionTiming.textContent = `Generated in ${duration}s`;
            this.captionTiming.style.display = 'block';

        } catch (error) {
            console.error('Caption Generation Error:', error);
            // Still show fallback content
            const fallbackPost = `Transform your precious memories into beautiful keepsakes! ✨ Create lasting treasures that tell your unique story.\n\n#printerpix #memories #photobook #familymoments #personalized #keepsakes #memorymaking #photoprints #customgifts #familylove`;
            this.postContent.value = fallbackPost;

            this.captionTiming.textContent = 'Error generating content';
            this.captionTiming.style.display = 'block';
        }
    }

    async postToInstagram() {
        if (!this.selectedCard) {
            alert('Please select an image first!');
            return;
        }

        const caption = this.postContent.value.trim();
        if (!caption) {
            alert('Please add a caption for your post!');
            return;
        }

        // Get the selected image
        const selectedCardElement = document.querySelector(`[data-model="${this.selectedCard}"]`);
        const imageElement = selectedCardElement.querySelector('img');

        if (!imageElement) {
            alert('No image found for the selected model!');
            return;
        }

        this.postBtn.disabled = true;
        this.postBtn.textContent = 'Posting...';

        try {
            // Convert image to blob for upload
            const imageBlob = await this.getImageBlob(imageElement.src);

            const formData = new FormData();
            formData.append('image', imageBlob, 'post-image.png');
            formData.append('caption', caption);
            formData.append('model', this.selectedCard);

            const response = await fetch('/api/instagram/post', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            alert(`Successfully posted to Instagram! Post ID: ${data.postId}`);

        } catch (error) {
            console.error('Instagram Post Error:', error);
            alert(`Error posting to Instagram: ${error.message}`);
        } finally {
            this.postBtn.disabled = false;
            this.postBtn.textContent = 'Post to Instagram';
        }
    }

    async getImageBlob(imageSrc) {
        if (imageSrc.startsWith('data:')) {
            // Convert base64 to blob
            const response = await fetch(imageSrc);
            return await response.blob();
        } else {
            // Fetch image from URL
            const response = await fetch(imageSrc);
            return await response.blob();
        }
    }

    async openSettingsModal() {
        try {
            // Fetch current prompts from server
            const response = await fetch('/api/system-prompts');
            const prompts = await response.json();

            this.showSettingsModal(prompts);
        } catch (error) {
            console.error('Error fetching system prompts:', error);
            alert('Error loading system prompts');
        }
    }

    showSettingsModal(prompts) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h2 class="modal-title">System Prompts Configuration</h2>
                    <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-content">
                    <div class="prompt-section">
                        <label class="prompt-label">Image Prompt Generation:</label>
                        <textarea class="prompt-textarea" id="imageEnhancePrompt">${prompts.imageEnhancePrompt || ''}</textarea>
                    </div>
                    <div class="prompt-section">
                        <label class="prompt-label">Image Caption Generation:</label>
                        <textarea class="prompt-textarea" id="imageCaptionPrompt">${prompts.imageCaptionPrompt || ''}</textarea>
                    </div>
                    <div class="prompt-section">
                        <label class="prompt-label">Video Prompt Generation:</label>
                        <textarea class="prompt-textarea" id="videoEnhancePrompt">${prompts.videoEnhancePrompt || ''}</textarea>
                    </div>
                    <div class="prompt-section">
                        <label class="prompt-label">Video Caption Generation:</label>
                        <textarea class="prompt-textarea" id="videoCaptionPrompt">${prompts.videoCaptionPrompt || ''}</textarea>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="cancel-btn" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button class="save-btn" onclick="window.imageGenerator.saveSystemPrompts()">Save Changes</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    async saveSystemPrompts() {
        const imageEnhancePrompt = document.getElementById('imageEnhancePrompt').value;
        const imageCaptionPrompt = document.getElementById('imageCaptionPrompt').value;
        const videoEnhancePrompt = document.getElementById('videoEnhancePrompt').value;
        const videoCaptionPrompt = document.getElementById('videoCaptionPrompt').value;

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

            alert('System prompts saved successfully!');
            document.querySelector('.modal-overlay').remove();

        } catch (error) {
            console.error('Error saving system prompts:', error);
            alert('Error saving system prompts');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.imageGenerator = new ImageGenerator();
});