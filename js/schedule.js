// Schedule Page functionality
class ScheduleManager {
    constructor() {
        this.scheduledPosts = [];
        this.filteredPosts = [];
        this.selectedPost = null;
        
        this.initElements();
        this.initEventListeners();
        this.loadScheduledPosts();
    }

    initElements() {
        // Filter elements
        this.statusFilter = document.getElementById('statusFilter');
        this.platformFilter = document.getElementById('platformFilter');
        this.refreshBtn = document.getElementById('refreshBtn');
        
        // Stats elements
        this.totalScheduled = document.getElementById('totalScheduled');
        this.pendingPosts = document.getElementById('pendingPosts');
        this.postedToday = document.getElementById('postedToday');
        this.failedPosts = document.getElementById('failedPosts');
        
        // Content elements
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.errorMessage = document.getElementById('errorMessage');
        this.emptySchedule = document.getElementById('emptySchedule');
        this.scheduleList = document.getElementById('scheduleList');
        this.retryBtn = document.getElementById('retryBtn');
        
        // Modal elements
        this.postModal = document.getElementById('postModal');
        this.postModalClose = document.getElementById('postModalClose');
        this.postTitle = document.getElementById('postTitle');
        this.postImages = document.getElementById('postImages');
        this.postCaption = document.getElementById('postCaption');
        this.postPlatforms = document.getElementById('postPlatforms');
        this.postScheduleTime = document.getElementById('postScheduleTime');
        this.postStatus = document.getElementById('postStatus');
        
        // Action buttons
        this.editPostBtn = document.getElementById('editPostBtn');
        this.postNowBtn = document.getElementById('postNowBtn');
        this.cancelPostBtn = document.getElementById('cancelPostBtn');
        this.deletePostBtn = document.getElementById('deletePostBtn');
    }

    initEventListeners() {
        // Filter listeners
        this.statusFilter.addEventListener('change', () => this.applyFilters());
        this.platformFilter.addEventListener('change', () => this.applyFilters());
        this.refreshBtn.addEventListener('click', () => this.loadScheduledPosts());
        this.retryBtn.addEventListener('click', () => this.loadScheduledPosts());
        
        // Modal listeners
        this.postModalClose.addEventListener('click', () => this.closeModal());
        this.postModal.addEventListener('click', (e) => {
            if (e.target === this.postModal) this.closeModal();
        });
        
        // Action button listeners
        this.editPostBtn.addEventListener('click', () => this.editPost());
        this.postNowBtn.addEventListener('click', () => this.postNow());
        this.cancelPostBtn.addEventListener('click', () => this.cancelPost());
        this.deletePostBtn.addEventListener('click', () => this.deletePost());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.postModal.style.display !== 'none') {
                this.closeModal();
            }
        });
    }

    async loadScheduledPosts() {
        this.showLoading();
        
        try {
            console.log('📅 Loading scheduled posts...');
            const response = await fetch('/api/schedule/posts');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.scheduledPosts = data.posts || [];
            
            console.log('📅 Loaded', this.scheduledPosts.length, 'scheduled posts');
            
            this.updateStats();
            this.applyFilters();
            this.renderScheduledPosts();
            
        } catch (error) {
            console.error('Error loading scheduled posts:', error);
            this.showError();
        }
    }

    showLoading() {
        this.loadingIndicator.style.display = 'flex';
        this.errorMessage.style.display = 'none';
        this.emptySchedule.style.display = 'none';
        this.scheduleList.style.display = 'none';
    }

    showError() {
        this.loadingIndicator.style.display = 'none';
        this.errorMessage.style.display = 'block';
        this.emptySchedule.style.display = 'none';
        this.scheduleList.style.display = 'none';
    }

    showEmpty() {
        this.loadingIndicator.style.display = 'none';
        this.errorMessage.style.display = 'none';
        this.emptySchedule.style.display = 'block';
        this.scheduleList.style.display = 'none';
    }

    showSchedule() {
        this.loadingIndicator.style.display = 'none';
        this.errorMessage.style.display = 'none';
        this.emptySchedule.style.display = 'none';
        this.scheduleList.style.display = 'block';
    }

    updateStats() {
        const total = this.scheduledPosts.length;
        const pending = this.scheduledPosts.filter(p => p.status === 'scheduled').length;
        const failed = this.scheduledPosts.filter(p => p.status === 'failed').length;
        
        // Posted today
        const today = new Date().toDateString();
        const postedToday = this.scheduledPosts.filter(p => 
            p.status === 'posted' && 
            p.posted_at && 
            new Date(p.posted_at).toDateString() === today
        ).length;
        
        this.totalScheduled.textContent = total;
        this.pendingPosts.textContent = pending;
        this.postedToday.textContent = postedToday;
        this.failedPosts.textContent = failed;
    }

    applyFilters() {
        const statusFilter = this.statusFilter.value;
        const platformFilter = this.platformFilter.value;
        
        this.filteredPosts = this.scheduledPosts.filter(post => {
            // Status filter
            if (statusFilter && post.status !== statusFilter) {
                return false;
            }
            
            // Platform filter
            if (platformFilter && !post.social_platforms.includes(platformFilter)) {
                return false;
            }
            
            return true;
        });
        
        console.log('📅 Filtered posts:', this.filteredPosts.length);
    }

    renderScheduledPosts() {
        if (this.filteredPosts.length === 0) {
            this.showEmpty();
            return;
        }
        
        this.showSchedule();
        this.scheduleList.innerHTML = '';
        
        // Sort by scheduled time (upcoming first)
        const sortedPosts = [...this.filteredPosts].sort((a, b) => 
            new Date(a.scheduled_for) - new Date(b.scheduled_for)
        );
        
        sortedPosts.forEach(post => {
            const postElement = this.createScheduleItem(post);
            this.scheduleList.appendChild(postElement);
        });
    }

    createScheduleItem(post) {
        const item = document.createElement('div');
        item.className = 'schedule-item';
        item.addEventListener('click', () => this.openModal(post));
        
        const scheduledTime = new Date(post.scheduled_for);
        const timeString = this.formatDateTime(scheduledTime);
        const relativeTime = this.getRelativeTime(scheduledTime);
        
        item.innerHTML = `
            <div class="schedule-item-header">
                <div>
                    <h3 class="schedule-title">${post.title}</h3>
                    <div class="schedule-time">${timeString} (${relativeTime})</div>
                </div>
                <div class="schedule-status status-${post.status}">${post.status}</div>
            </div>
            <div class="schedule-item-body">
                <div class="schedule-images">
                    ${post.image_paths.slice(0, 3).map(path => `
                        <img src="/api/gallery/image/${encodeURIComponent(path)}" alt="Scheduled image" class="schedule-image">
                    `).join('')}
                    ${post.image_paths.length > 3 ? `<div class="more-images">+${post.image_paths.length - 3}</div>` : ''}
                </div>
                <div class="schedule-caption">${post.caption}</div>
            </div>
            <div class="schedule-item-footer">
                <div class="schedule-platforms">
                    ${post.social_platforms.map(platform => `
                        <span class="platform-badge platform-${platform}">${platform}</span>
                    `).join('')}
                </div>
                <div class="schedule-actions" onclick="event.stopPropagation()">
                    ${post.status === 'scheduled' ? `
                        <button class="quick-action-btn" onclick="scheduleManager.postNow('${post.id}')">Post Now</button>
                        <button class="quick-action-btn danger" onclick="scheduleManager.cancelPost('${post.id}')">Cancel</button>
                    ` : ''}
                    ${post.status === 'failed' ? `
                        <button class="quick-action-btn" onclick="scheduleManager.retryPost('${post.id}')">Retry</button>
                    ` : ''}
                </div>
            </div>
        `;
        
        return item;
    }

    openModal(post) {
        this.selectedPost = post;
        
        this.postTitle.textContent = post.title;
        
        // Display images
        this.postImages.innerHTML = post.image_paths.map(path => `
            <img src="/api/gallery/image/${encodeURIComponent(path)}" alt="Post image" class="post-image">
        `).join('');
        
        // Display caption
        this.postCaption.textContent = post.caption;
        
        // Display platforms
        this.postPlatforms.innerHTML = post.social_platforms.map(platform => `
            <span class="platform-badge platform-${platform}">${platform}</span>
        `).join('');
        
        // Display schedule time
        const scheduledTime = new Date(post.scheduled_for);
        this.postScheduleTime.textContent = this.formatDateTime(scheduledTime);
        
        // Display status
        this.postStatus.innerHTML = `<span class="schedule-status status-${post.status}">${post.status}</span>`;
        
        // Show/hide action buttons based on status
        this.editPostBtn.style.display = post.status === 'scheduled' ? 'inline-block' : 'none';
        this.postNowBtn.style.display = post.status === 'scheduled' ? 'inline-block' : 'none';
        this.cancelPostBtn.style.display = post.status === 'scheduled' ? 'inline-block' : 'none';
        
        this.postModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.postModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.selectedPost = null;
    }

    async editPost() {
        if (!this.selectedPost) return;
        
        // TODO: Implement edit functionality
        alert('Edit functionality coming soon!');
    }

    async postNow(postId = null) {
        const id = postId || this.selectedPost?.id;
        if (!id) return;
        
        const confirmed = confirm('Are you sure you want to post this now?');
        if (!confirmed) return;
        
        try {
            const response = await fetch(`/api/schedule/posts/${id}/post-now`, {
                method: 'POST'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            alert('Post published successfully!');
            
            this.closeModal();
            this.loadScheduledPosts();
            
        } catch (error) {
            console.error('Error posting now:', error);
            alert('Failed to post. Please try again.');
        }
    }

    async cancelPost(postId = null) {
        const id = postId || this.selectedPost?.id;
        if (!id) return;
        
        const confirmed = confirm('Are you sure you want to cancel this scheduled post?');
        if (!confirmed) return;
        
        try {
            const response = await fetch(`/api/schedule/posts/${id}/cancel`, {
                method: 'POST'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            alert('Post cancelled successfully!');
            
            this.closeModal();
            this.loadScheduledPosts();
            
        } catch (error) {
            console.error('Error cancelling post:', error);
            alert('Failed to cancel post. Please try again.');
        }
    }

    async deletePost() {
        if (!this.selectedPost) return;
        
        const confirmed = confirm('Are you sure you want to delete this scheduled post? This action cannot be undone.');
        if (!confirmed) return;
        
        try {
            const response = await fetch(`/api/schedule/posts/${this.selectedPost.id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            alert('Post deleted successfully!');
            
            this.closeModal();
            this.loadScheduledPosts();
            
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post. Please try again.');
        }
    }

    async retryPost(postId) {
        try {
            const response = await fetch(`/api/schedule/posts/${postId}/retry`, {
                method: 'POST'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            alert('Post retry scheduled successfully!');
            this.loadScheduledPosts();
            
        } catch (error) {
            console.error('Error retrying post:', error);
            alert('Failed to retry post. Please try again.');
        }
    }

    formatDateTime(date) {
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getRelativeTime(date) {
        const now = new Date();
        const diffMs = date - now;
        const diffHours = Math.round(diffMs / (1000 * 60 * 60));
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffMs < 0) {
            const pastHours = Math.abs(diffHours);
            const pastDays = Math.abs(diffDays);
            
            if (pastDays > 0) {
                return `${pastDays} day${pastDays > 1 ? 's' : ''} ago`;
            } else if (pastHours > 0) {
                return `${pastHours} hour${pastHours > 1 ? 's' : ''} ago`;
            } else {
                return 'Just now';
            }
        } else {
            if (diffDays > 0) {
                return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
            } else if (diffHours > 0) {
                return `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
            } else {
                return 'Soon';
            }
        }
    }
}

// Initialize schedule manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.scheduleManager = new ScheduleManager();
});
