// Video Generator Class
class VideoGenerator {
  constructor() {
    this.videoPromptInput = document.getElementById('videoPromptInput');
    this.videoEnhancedPrompt = document.getElementById('videoEnhancedPrompt');
    this.videoEnhanceBtn = document.getElementById('videoEnhanceBtn');
    this.videoGenerateBtn = document.getElementById('videoGenerateBtn');
    this.veoResult = document.getElementById('veoResult');
    this.videoPostContent = document.getElementById('videoPostContent');
    this.videoCaptionTiming = document.getElementById('videoCaptionTiming');
    this.videoEnhancedTiming = document.getElementById('videoEnhancedTiming');
    this.videoPostBtn = document.getElementById('videoPostBtn');

    this.selectedVideoCard = null;

    this.initVideoEventListeners();
  }

  initVideoEventListeners() {
    this.videoEnhanceBtn.addEventListener('click', () => this.enhanceVideoPrompt());
    this.videoGenerateBtn.addEventListener('click', () => this.generateVideos());
    this.videoPostBtn.addEventListener('click', () => this.postVideoToInstagram());


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
    // Auto-select the Veo card if it has a video
    const veoCard = document.querySelector('[data-model="veo"]');
    const hasVideo = veoCard && veoCard.querySelector('video');
    
    if (hasVideo && !this.selectedVideoCard) {
      veoCard.classList.add('selected');
      this.selectedVideoCard = 'veo';
    }
    
    this.videoPostBtn.disabled = !this.selectedVideoCard;
  }

  initVideoSelection() {
    const videoCard = document.querySelector('.result-card[data-model="veo"]');
    if (videoCard) {
      videoCard.addEventListener('click', (e) => {
        if (e.target.closest('.expand-icon')) {
          this.expandVideo(videoCard);
          return;
        }

        // Toggle selection
        if (videoCard.classList.contains('selected')) {
          videoCard.classList.remove('selected');
          this.selectedVideoCard = null;
        } else {
          videoCard.classList.add('selected');
          this.selectedVideoCard = 'veo';
        }

        this.updateVideoPostButtonState();
      });
    }
  }

  expandVideo(card) {
    const videoElement = card.querySelector('video');
    if (!videoElement) return;

    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.9); display: flex; align-items: center;
        justify-content: center; z-index: 1000; cursor: pointer;
      `;

    const enlargedVideo = document.createElement('video');
    enlargedVideo.src = videoElement.src;
    enlargedVideo.controls = true;
    enlargedVideo.autoplay = true;
    enlargedVideo.style.cssText = `
        max-width: 90%; max-height: 90%; border-radius: 10px;
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
      alert('Please enter a basic video prompt first.');
      return;
    }

    this.videoEnhanceBtn.disabled = true;
    this.videoEnhanceBtn.textContent = 'Enhancing...';

    const startTime = Date.now();

    try {
      const response = await fetch('/api/enhance-video-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: basicPrompt })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);

      this.videoEnhancedPrompt.value = data.enhancedPrompt || '';
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
      alert('Please enter a video prompt first.');
      return;
    }

    this.videoGenerateBtn.disabled = true;
    this.videoGenerateBtn.textContent = 'Generating...';

    this.showVideoLoading(this.veoResult);

    try {
      await this.generateVeo(prompt);
    } finally {
      this.videoGenerateBtn.disabled = false;
      this.videoGenerateBtn.textContent = 'Generate Video';
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
        <div style="display:flex;align-items:center;justify-content:center;height:100%;padding:20px;text-align:center;background:#f9fafb;">
          <div style="color:#e90b75;font-size:14px;line-height:1.5;">
            <div style="font-size:24px;margin-bottom:10px;">🎬</div>
            <div style="font-weight:600;margin-bottom:8px;">Video Generated</div>
            <div style="font-size:12px;color:#666;">${message || ''}</div>
          </div>
        </div>
      `;

    const existingTiming = parentCard.querySelector('.timing-info');
    if (existingTiming) existingTiming.remove();

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

    element.innerHTML = `<video src="${videoUrl}" controls style="width:100%;height:100%;object-fit:cover;"></video>`;

    const existingTiming = parentCard.querySelector('.timing-info');
    if (existingTiming) existingTiming.remove();

    if (timingText) {
      const timingDiv = document.createElement('div');
      timingDiv.className = 'timing-info';
      timingDiv.textContent = timingText;
      parentCard.appendChild(timingDiv);
    }
  }



  async generateVeo(prompt) {
    const startTime = Date.now();
    try {
      const response = await fetch('/api/veo/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);

      // Case A: an actual video URL was returned (unlikely for Veo 3)
      if (data.videoUrl) {
        this.showVideo(this.veoResult, data.videoUrl, `${duration}s`);
        return;
      }

      // Case B: expected for Veo 3 — server returns a file handle, so fetch it via your download proxy
      if (data.file) {
        const dl = await fetch(`/api/veo/video/download?file=${encodeURIComponent(data.file)}`);
        if (!dl.ok) {
          let errorMessage = `HTTP ${dl.status}`;
          try {
            const errorData = await dl.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            const errText = await dl.text().catch(() => '');
            if (errText) errorMessage = errText;
          }
          throw new Error(`Download failed: ${errorMessage}`);
        }

        const blob = await dl.blob();
        const objectUrl = URL.createObjectURL(blob);

        // Display video
        this.showVideo(this.veoResult, objectUrl, `${duration}s`);

        // Auto-select the video card after successful generation
        const veoCard = this.veoResult.parentElement;
        veoCard.classList.add('selected');
        this.selectedVideoCard = 'veo';
        this.updateVideoPostButtonState();

        // Cleanup: revoke previous object URL for this card when replaced or on unload
        const revoke = () => URL.revokeObjectURL(objectUrl);
        if (veoCard._revokePrev) veoCard._revokePrev();
        veoCard._revokePrev = revoke;
        window.addEventListener('beforeunload', revoke, { once: true });

        return;
      }

      // Fallback if neither is present
      this.showVideoMessage(this.veoResult, 'Video generated but no file or URL returned.', `${duration}s`);

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
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
      const fallbackPost = `Bringing memories to life with Printerpix! Transform your cherished moments into beautiful keepsakes.\n\n#printerpix #memories #videomarketing #familymoments #personalized #keepsakes #memorymaking #videopost`;
      this.videoPostContent.value = fallbackPost;
      this.videoCaptionTiming.textContent = 'Error generating content';
      this.videoCaptionTiming.style.display = 'block';
    }
  }

  async postVideoToInstagram() {
    if (!this.selectedVideoCard) {
      alert('Please select a video first.');
      return;
    }

    const caption = this.videoPostContent.value.trim();
    if (!caption) {
      alert('Please add a caption for your video post.');
      return;
    }

    const selectedCardElement = document.querySelector(`[data-model="${this.selectedVideoCard}"]`);
    const videoElement = selectedCardElement.querySelector('video');

    if (!videoElement) {
      alert('No video found for the selected model.');
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      alert(`Successfully posted video to Instagram. Post ID: ${data.postId}`);

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


}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.videoGenerator = new VideoGenerator();
});
