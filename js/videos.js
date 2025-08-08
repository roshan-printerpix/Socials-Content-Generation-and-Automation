// Video Generator Class
class VideoGenerator {
    constructor() {
        this.videoPromptInput = document.getElementById('videoPromptInput');
        this.videoEnhancedPrompt = document.getElementById('videoEnhancedPrompt');
        this.videoEnhanceBtn = document.getElementById('videoEnhanceBtn');
        this.videoGenerateBtn = document.getElementById('videoGenerateBtn');
        this.runwayResult = document.getElementById('runwayResult');
        this.veoResult = document.getElementById('veoResult');
        this.videoPostContent = document.getElementById('videoPostContent');
        this.videoCaptionTiming = document.getElementById('videoCaptionTiming');
        this.videoEnhancedTiming = document.getElementById('videoEnhancedTiming');
        this.videoPostBtn = document.getElementById('videoPostBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.selectedVideoCard = null;

        this.initVideoEventListeners();
    }

    initVideoEventListeners() {
        this.videoEnhanceBtn.addEventListener('click', () => this.enhanceVideoPrompt());
        this.videoGenerateBtn.addEventListener('click', () => this.generateVideos());
        this.videoPostBtn.addEventListener('click', () => this.postVideoToInstagram());
        this.settingsBtn.addEventListener('click', () => this.openSettingsModal());

        // Enable/disable buttons based on input
        this.videoPromptInput.addEventListener('input', () => this.updateVideoButtonStates());
        this.videoEnhancedPrompt.addEventListener('input', () => this.updateVideoButtonStates());

        // Initial button state
        this.updateVideoButtonStates();
        this.updateVideoPostButtonState();

        // Add click listeners for video selection
        this.initVideoSelection();
    }

    updateVideoButtonStates() {
        const hasBasicPrompt = this.videoPromptInput.value.trim().length > 0;
        const hasEnhancedPrompt = this.videoEnhancedPrompt.value.trim().length > 0;

        this.videoEnhanceBtn.disabled = !hasBasicPrompt;
        this.videoGenerateBtn.disabled = !hasBasicPrompt && !hasEnhancedPrompt;
    }

    updateVideoPostButtonState() {
        this.videoPostBtn.disabled = !this.selectedVideoCard;
    }

    initVideoSelection() {
        const videoCards = document.querySelectorAll('.result-card');
        videoCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.expand-icon')) {
                    this.expandVideo(card);
                    return;
                }

                // Toggle selection
                if (card.classList.contains('selected')) {
                    card.classList.remove('selected');
                    this.selectedVideoCard = null;
                } else {
                    videoCards.forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    this.selectedVideoCard = card.dataset.model;
                }

                this.updateVideoPostButtonState();
            });
        });
    }

    expandVideo(card) {
        const videoElement = card.querySelector('video');
        if (!videoElement) return;

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

        const enlargedVideo = document.createElement('video');
        enlargedVideo.src = videoElement.src;
        enlargedVideo.controls = true;
        enlargedVideo.autoplay = true;
        enlargedVideo.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            border-radius: 10px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        `;

        modal.appendChild(enlargedVideo);
        document.body.appendChild(modal);

        modal.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    async enhanceVideoPrompt() {
        const basicPrompt = this.videoPromptInput.value.trim();

        if (!basicPrompt) {
            alert('Please enter a basic video prompt first!');
            return;
        }

        this.videoEnhanceBtn.disabled = true;
        this.videoEnhanceBtn.textContent = 'Enhancing...';

        const startTime = Date.now();

        try {
            const response = await fetch('/api/enhance-video-prompt', {
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

            this.videoEnhancedPrompt.value = data.enhancedPrompt;

            this.videoEnhancedTiming.textContent = `Enhanced in ${duration}s`;
            this.videoEnhancedTiming.style.display = 'block';

        } catch (error) {
            console.error('Video Enhance Error:', error);
            alert(`Error enhancing video prompt: ${error.message}`);
        } finally {
            this.videoEnhanceBtn.disabled = false;
            this.videoEnhanceBtn.textContent = 'Enhance Prompt';
        }
    }

    async generateVideos() {
        const prompt = this.videoEnhancedPrompt.value.trim() || this.videoPromptInput.value.trim();

        if (!prompt) {
            alert('Please enter a video prompt first!');
            return;
        }

        this.videoGenerateBtn.disabled = true;
        this.videoGenerateBtn.textContent = 'Generating...';

        this.showVideoLoading(this.runwayResult);
        this.showVideoLoading(this.veoResult);

        const promises = [
            this.generateRunway(prompt),
            this.generateVeo(prompt)
        ];

        try {
            await Promise.allSettled(promises);
        } finally {
            this.videoGenerateBtn.disabled = false;
            this.videoGenerateBtn.textContent = 'Generate Videos';

            this.generateVideoCaption(prompt);
        }
    }

    showVideoLoading(element) {
        element.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    }

    showVideoError(element, message) {
        element.innerHTML = `<div class="error">${message}</div>`;
    }

    showVideoMessage(element, message, timing) {
        const timingText = timing ? `Generated in ${timing}` : '';
        const parentCard = element.parentElement;

        element.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; padding: 20px; text-align: center; background: #f9fafb;">
                <div style="color: #e90b75; font-size: 14px; line-height: 1.5;">
                    <div style="font-size: 24px; margin-bottom: 10px;">🎬</div>
                    <div style="font-weight: 600; margin-bottom: 8px;">Video Generated!</div>
                    <div style="font-size: 12px; color: #666;">Cannot display due to API limitations</div>
                </div>
            </div>
        `;

        const existingTiming = parentCard.querySelector('.timing-info');
        if (existingTiming) {
            existingTiming.remove();
        }

        if (timingText) {
            const timingDiv = document.createElement('div');
            timingDiv.className = 'timing-info';
            timingDiv.textContent = timingText;
            parentCard.appendChild(timingDiv);
        }
    }

    showVideo(element, videoUrl, timing) {
        const timingText = timing ? `Generated in ${timing}` : '';
        const parentCard = element.parentElement;

        element.innerHTML = `<video src="${videoUrl}" controls style="width: 100%; height: 100%; object-fit: cover;"></video>`;

        const existingTiming = parentCard.querySelector('.timing-info');
        if (existingTiming) {
            existingTiming.remove();
        }

        if (timingText) {
            const timingDiv = document.createElement('div');
            timingDiv.className = 'timing-info';
            timingDiv.textContent = timingText;
            parentCard.appendChild(timingDiv);
        }
    }

    async generateRunway(prompt) {
        const startTime = Date.now();
        try {
            const response = await fetch('/api/runway/video', {
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

            if (data.videoUrl) {
                this.showVideo(this.runwayResult, data.videoUrl, `${duration}s`);
            } else {
                throw new Error('No video URL in response');
            }

        } catch (error) {
            console.error('Runway Error:', error);
            this.showVideoError(this.runwayResult, `Error: ${error.message}`);
        }
    }

    async generateVeo(prompt) {
        const startTime = Date.now();
        try {
            const response = await fetch('/api/veo/video', {
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

            if (data.isFileReference && data.success) {
                // Handle the special case where video was generated but can't be displayed
                this.showVideoMessage(this.veoResult, data.message, `${duration}s`);
            } else if (data.videoUrl) {
                this.showVideo(this.veoResult, data.videoUrl, `${duration}s`);
            } else {
                throw new Error('No video URL in response');
            }

        } catch (error) {
            console.error('Veo Error:', error);
            this.showVideoError(this.veoResult, `Error: ${error.message}`);
        }
    }

    async generateVideoCaption(prompt) {
        const startTime = Date.now();

        try {
            const response = await fetch('/api/generate-video-caption', {
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

            const postText = `${data.caption}\n\n${data.tags}`;
            this.videoPostContent.value = postText;

            this.videoCaptionTiming.textContent = `Generated in ${duration}s`;
            this.videoCaptionTiming.style.display = 'block';

        } catch (error) {
            console.error('Video Caption Generation Error:', error);
            const fallbackPost = `Bringing memories to life with Printerpix! ✨ Transform your cherished moments into beautiful keepsakes.\n\n#printerpix #memories #videomarketing #familymoments #personalized #keepsakes #memorymaking #videopost`;
            this.videoPostContent.value = fallbackPost;

            this.videoCaptionTiming.textContent = 'Error generating content';
            this.videoCaptionTiming.style.display = 'block';
        }
    }

    async postVideoToInstagram() {
        if (!this.selectedVideoCard) {
            alert('Please select a video first!');
            return;
        }

        const caption = this.videoPostContent.value.trim();
        if (!caption) {
            alert('Please add a caption for your video post!');
            return;
        }

        const selectedCardElement = document.querySelector(`[data-model="${this.selectedVideoCard}"]`);
        const videoElement = selectedCardElement.querySelector('video');

        if (!videoElement) {
            alert('No video found for the selected model!');
            return;
        }

        this.videoPostBtn.disabled = true;
        this.videoPostBtn.textContent = 'Posting...';

        try {
            const videoBlob = await this.getVideoBlob(videoElement.src);

            const formData = new FormData();
            formData.append('video', videoBlob, 'post-video.mp4');
            formData.append('caption', caption);
            formData.append('model', this.selectedVideoCard);

            const response = await fetch('/api/instagram/post-video', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            alert(`Successfully posted video to Instagram! Post ID: ${data.postId}`);

        } catch (error) {
            console.error('Instagram Video Post Error:', error);
            alert(`Error posting video to Instagram: ${error.message}`);
        } finally {
            this.videoPostBtn.disabled = false;
            this.videoPostBtn.textContent = 'Post to Instagram';
        }
    }

    async getVideoBlob(videoSrc) {
        const response = await fetch(videoSrc);
        return await response.blob();
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
                        <label class="prompt-label">Video Prompt Enhancement System Prompt:</label>
                        <textarea class="prompt-textarea" id="enhancePrompt">${prompts.enhancePrompt || ''}</textarea>
                    </div>
                    <div class="prompt-section">
                        <label class="prompt-label">Video Caption Generation System Prompt:</label>
                        <textarea class="prompt-textarea" id="captionPrompt">${prompts.captionPrompt || ''}</textarea>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="cancel-btn" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button class="save-btn" onclick="window.videoGenerator.saveSystemPrompts()">Save Changes</button>
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
        const enhancePrompt = document.getElementById('enhancePrompt').value;
        const captionPrompt = document.getElementById('captionPrompt').value;

        try {
            const response = await fetch('/api/system-prompts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    enhancePrompt,
                    captionPrompt
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
    window.videoGenerator = new VideoGenerator();
});