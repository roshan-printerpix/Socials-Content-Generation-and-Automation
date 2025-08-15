// Gallery functionality
class Gallery {
    constructor() {
        this.images = [];
        this.currentView = 'grid';
        this.selectedImage = null;
        
        this.initElements();
        this.initEventListeners();
        this.loadGallery();
    }

    initElements() {
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.errorMessage = document.getElementById('errorMessage');
        this.emptyGallery = document.getElementById('emptyGallery');
        this.galleryGrid = document.getElementById('galleryGrid');
        this.galleryStats = document.getElementById('galleryStats');
        
        this.totalImagesEl = document.getElementById('totalImages');
        this.totalSizeEl = document.getElementById('totalSize');
        
        this.refreshBtn = document.getElementById('refreshBtn');
        this.gridViewBtn = document.getElementById('gridViewBtn');
        this.listViewBtn = document.getElementById('listViewBtn');
        this.retryBtn = document.getElementById('retryBtn');
        
        this.imageModal = document.getElementById('imageModal');
        this.modalClose = document.getElementById('modalClose');
        this.modalImage = document.getElementById('modalImage');
        this.modalFileName = document.getElementById('modalFileName');
        this.modalFileSize = document.getElementById('modalFileSize');
        this.modalCreated = document.getElementById('modalCreated');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.deleteBtn = document.getElementById('deleteBtn');
    }

    initEventListeners() {
        this.refreshBtn.addEventListener('click', () => this.loadGallery());
        this.retryBtn.addEventListener('click', () => this.loadGallery());
        
        this.gridViewBtn.addEventListener('click', () => this.setView('grid'));
        this.listViewBtn.addEventListener('click', () => this.setView('list'));
        
        this.modalClose.addEventListener('click', () => this.closeModal());
        this.imageModal.addEventListener('click', (e) => {
            if (e.target === this.imageModal) this.closeModal();
        });
        
        this.downloadBtn.addEventListener('click', () => this.downloadImage());
        this.deleteBtn.addEventListener('click', () => this.deleteImage());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.imageModal.style.display !== 'none') {
                this.closeModal();
            }
        });
    }

    async loadGallery() {
        this.showLoading();
        
        try {
            const response = await fetch('/api/gallery/images');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.images = data.images || [];
            
            this.updateStats();
            this.renderGallery();
            
        } catch (error) {
            console.error('Error loading gallery:', error);
            this.showError();
        }
    }

    showLoading() {
        this.loadingIndicator.style.display = 'flex';
        this.errorMessage.style.display = 'none';
        this.emptyGallery.style.display = 'none';
        this.galleryGrid.style.display = 'none';
    }

    showError() {
        this.loadingIndicator.style.display = 'none';
        this.errorMessage.style.display = 'block';
        this.emptyGallery.style.display = 'none';
        this.galleryGrid.style.display = 'none';
    }

    showEmpty() {
        this.loadingIndicator.style.display = 'none';
        this.errorMessage.style.display = 'none';
        this.emptyGallery.style.display = 'block';
        this.galleryGrid.style.display = 'none';
    }

    showGallery() {
        this.loadingIndicator.style.display = 'none';
        this.errorMessage.style.display = 'none';
        this.emptyGallery.style.display = 'none';
        this.galleryGrid.style.display = 'grid';
    }

    updateStats() {
        const totalImages = this.images.length;
        const totalSize = this.images.reduce((sum, img) => sum + (img.size || 0), 0);
        
        this.totalImagesEl.textContent = totalImages.toLocaleString();
        this.totalSizeEl.textContent = this.formatFileSize(totalSize);
    }

    renderGallery() {
        if (this.images.length === 0) {
            this.showEmpty();
            return;
        }

        this.showGallery();
        this.galleryGrid.innerHTML = '';

        this.images.forEach((image, index) => {
            const item = this.createGalleryItem(image, index);
            this.galleryGrid.appendChild(item);
        });
    }

    createGalleryItem(image, index) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.addEventListener('click', () => this.openModal(image, index));

        const imageContainer = document.createElement('div');
        imageContainer.className = 'gallery-item-image-container';

        const img = document.createElement('img');
        img.className = 'gallery-item-image';
        img.src = image.url;
        img.alt = image.name;
        img.loading = 'lazy';
        
        // Handle image load errors
        img.onerror = () => {
            img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBMMTMwIDEwMEgxMTVWMTMwSDg1VjEwMEg3MEwxMDAgNzBaIiBmaWxsPSIjOUI5QkEwIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5QkEwIiBmb250LXNpemU9IjEyIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+Cjwvc3ZnPg==';
        };

        // Add model badge
        const modelBadge = document.createElement('div');
        modelBadge.className = 'gallery-item-model-badge';
        modelBadge.textContent = this.formatModelName(image.model);

        imageContainer.appendChild(img);
        imageContainer.appendChild(modelBadge);

        const info = document.createElement('div');
        info.className = 'gallery-item-info';

        const name = document.createElement('div');
        name.className = 'gallery-item-name';
        name.textContent = image.name;

        const meta = document.createElement('div');
        meta.className = 'gallery-item-meta';

        const date = document.createElement('span');
        date.textContent = this.formatDate(image.created_at);

        const size = document.createElement('span');
        size.className = 'gallery-item-size';
        size.textContent = this.formatFileSize(image.size);

        meta.appendChild(date);
        meta.appendChild(size);

        info.appendChild(name);
        info.appendChild(meta);

        item.appendChild(imageContainer);
        item.appendChild(info);

        return item;
    }

    setView(view) {
        this.currentView = view;
        
        // Update button states
        this.gridViewBtn.classList.toggle('active', view === 'grid');
        this.listViewBtn.classList.toggle('active', view === 'list');
        
        // Update gallery class
        this.galleryGrid.classList.toggle('list-view', view === 'list');
    }

    openModal(image, index) {
        this.selectedImage = { ...image, index };
        
        this.modalImage.src = image.url;
        this.modalFileName.textContent = image.name;
        this.modalFileSize.textContent = this.formatFileSize(image.size);
        this.modalCreated.textContent = this.formatDate(image.created_at);
        
        // Update modal title to include model name
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) {
            modalTitle.textContent = `${this.formatModelName(image.model)} - Image Details`;
        }
        
        this.imageModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.imageModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.selectedImage = null;
    }

    async downloadImage() {
        if (!this.selectedImage) return;
        
        try {
            const response = await fetch(this.selectedImage.url);
            const blob = await response.blob();
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = this.selectedImage.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Error downloading image:', error);
            alert('Failed to download image. Please try again.');
        }
    }

    async deleteImage() {
        if (!this.selectedImage) return;
        
        const confirmed = confirm(`Are you sure you want to delete "${this.selectedImage.name}"? This action cannot be undone.`);
        if (!confirmed) return;
        
        try {
            // Use the full path (e.g., "imagen-3/2025-08-13T14-06-20-447...") for deletion
            const filePath = this.selectedImage.path || `${this.selectedImage.model}/${this.selectedImage.name}`;
            const response = await fetch(`/api/gallery/images/${encodeURIComponent(filePath)}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            // Remove from local array
            this.images.splice(this.selectedImage.index, 1);
            
            // Update display
            this.updateStats();
            this.renderGallery();
            this.closeModal();
            
            alert('Image deleted successfully.');
            
        } catch (error) {
            console.error('Error deleting image:', error);
            alert(`Failed to delete image: ${error.message}`);
        }
    }

    formatFileSize(bytes) {
        if (!bytes || bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    formatDate(dateString) {
        if (!dateString) return 'Unknown';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            return 'Today';
        } else if (diffDays === 2) {
            return 'Yesterday';
        } else if (diffDays <= 7) {
            return `${diffDays - 1} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    formatModelName(model) {
        if (!model) return 'Unknown';
        
        const modelMap = {
            'imagen-3': 'Imagen 3',
            'imagen-4': 'Imagen 4',
            'imagen-4-ultra': 'Imagen 4 Ultra',
            'veo-3': 'Veo 3'
        };
        
        return modelMap[model] || model.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
}

// Initialize gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gallery = new Gallery();
});