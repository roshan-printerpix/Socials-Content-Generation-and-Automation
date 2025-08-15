// Gallery functionality
class Gallery {
    constructor() {
        this.images = [];
        this.filteredImages = [];
        this.currentView = 'grid';
        this.selectedModels = ['imagen-3', 'imagen-4', 'imagen-4-ultra', 'veo-3']; // Show all by default
        this.selectedImage = null;
        this.availableTags = [];
        
        this.initElements();
        this.initEventListeners();
        this.initializeDropdown();
        this.loadTags();
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
        
        this.gridViewBtn = document.getElementById('gridViewBtn');
        this.listViewBtn = document.getElementById('listViewBtn');
        this.retryBtn = document.getElementById('retryBtn');
        
        // Custom dropdown elements
        this.dropdownTrigger = document.getElementById('dropdownTrigger');
        this.dropdownLabel = document.getElementById('dropdownLabel');
        this.dropdownMenu = document.getElementById('dropdownMenu');
        this.selectAllBtn = document.getElementById('selectAllBtn');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.checkboxes = document.querySelectorAll('.dropdown-option input[type="checkbox"]');
        
        this.imageModal = document.getElementById('imageModal');
        this.modalClose = document.getElementById('modalClose');
        this.modalImage = document.getElementById('modalImage');
        this.modalFileName = document.getElementById('modalFileName');
        this.modalFileSize = document.getElementById('modalFileSize');
        this.modalCreated = document.getElementById('modalCreated');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.deleteBtn = document.getElementById('deleteBtn');
        
        // Tag management elements
        this.currentTags = document.getElementById('currentTags');
        this.tagSelect = document.getElementById('tagSelect');
        this.addTagBtn = document.getElementById('addTagBtn');
    }

    initEventListeners() {
        this.retryBtn.addEventListener('click', () => this.loadGallery());
        
        this.gridViewBtn.addEventListener('click', () => this.setView('grid'));
        this.listViewBtn.addEventListener('click', () => this.setView('list'));
        
        // Custom dropdown event listeners
        this.dropdownTrigger.addEventListener('click', () => this.toggleDropdown());
        this.selectAllBtn.addEventListener('click', () => this.selectAllModels());
        this.clearAllBtn.addEventListener('click', () => this.clearAllModels());
        
        // Checkbox change listeners
        this.checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateSelectedModels());
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.dropdownTrigger.contains(e.target) && !this.dropdownMenu.contains(e.target)) {
                this.closeDropdown();
            }
        });
        
        this.modalClose.addEventListener('click', () => this.closeModal());
        this.imageModal.addEventListener('click', (e) => {
            if (e.target === this.imageModal) this.closeModal();
        });
        
        this.downloadBtn.addEventListener('click', () => this.downloadImage());
        this.deleteBtn.addEventListener('click', () => this.deleteImage());
        
        // Tag management event listeners
        this.addTagBtn.addEventListener('click', () => this.addTagToImage());
        this.tagSelect.addEventListener('change', () => {
            this.addTagBtn.disabled = !this.tagSelect.value;
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.imageModal.style.display !== 'none') {
                    this.closeModal();
                } else if (this.dropdownMenu.classList.contains('show')) {
                    this.closeDropdown();
                }
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

        // Apply initial filter (show all by default)
        this.applyFilter();
        this.renderFilteredGallery();
    }

    renderFilteredGallery() {
        if (this.filteredImages.length === 0) {
            this.showEmpty();
            return;
        }

        this.showGallery();
        this.galleryGrid.innerHTML = '';

        this.filteredImages.forEach((image, index) => {
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

        // Add tags display
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'gallery-item-tags';
        
        if (image.tags && image.tags.length > 0) {
            // Show up to 3 tags on the gallery item
            const displayTags = image.tags.slice(0, 3);
            displayTags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.className = 'gallery-tag';
                tagElement.textContent = tag.display_name;
                
                if (tag.color && tag.color !== '#e90b75') {
                    tagElement.classList.add('colored');
                    tagElement.style.backgroundColor = tag.color;
                }
                
                tagsContainer.appendChild(tagElement);
            });
            
            // Show "+X more" if there are more than 3 tags
            if (image.tags.length > 3) {
                const moreTag = document.createElement('span');
                moreTag.className = 'gallery-tag';
                moreTag.textContent = `+${image.tags.length - 3} more`;
                moreTag.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                tagsContainer.appendChild(moreTag);
            }
        }

        imageContainer.appendChild(img);
        imageContainer.appendChild(modelBadge);
        imageContainer.appendChild(tagsContainer);

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

    toggleDropdown() {
        const isOpen = this.dropdownMenu.classList.contains('show');
        if (isOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }

    openDropdown() {
        this.dropdownTrigger.classList.add('active');
        this.dropdownMenu.classList.add('show');
    }

    closeDropdown() {
        this.dropdownTrigger.classList.remove('active');
        this.dropdownMenu.classList.remove('show');
    }

    updateSelectedModels() {
        // Get selected models from checkboxes
        this.selectedModels = Array.from(this.checkboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);
        
        // Update dropdown label
        this.updateDropdownLabel();
        
        // Apply filter and re-render
        this.applyFilter();
        this.renderFilteredGallery();
    }

    updateDropdownLabel() {
        const selectedCount = this.selectedModels.length;
        const totalCount = this.checkboxes.length;
        
        if (selectedCount === 0) {
            this.dropdownLabel.textContent = 'No Models Selected';
        } else if (selectedCount === totalCount) {
            this.dropdownLabel.textContent = 'All Models';
        } else if (selectedCount === 1) {
            const modelName = this.formatModelName(this.selectedModels[0]);
            this.dropdownLabel.textContent = modelName;
        } else {
            this.dropdownLabel.textContent = `${selectedCount} Models Selected`;
        }
    }

    selectAllModels() {
        // Check all checkboxes
        this.checkboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
        
        // Update selected models and apply filter
        this.updateSelectedModels();
    }

    clearAllModels() {
        // Uncheck all checkboxes
        this.checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Update selected models and apply filter
        this.updateSelectedModels();
    }

    initializeDropdown() {
        // Set initial checkbox states based on selectedModels
        this.checkboxes.forEach(checkbox => {
            checkbox.checked = this.selectedModels.includes(checkbox.value);
        });
        
        // Update the dropdown label
        this.updateDropdownLabel();
    }

    applyFilter() {
        if (this.selectedModels.length === 0) {
            // If no models selected, show empty
            this.filteredImages = [];
        } else {
            // Filter images based on selected models
            this.filteredImages = this.images.filter(image => 
                this.selectedModels.includes(image.model)
            );
        }
        
        // Update stats to reflect filtered images
        this.updateFilteredStats();
    }

    updateFilteredStats() {
        const totalImages = this.filteredImages.length;
        const totalSize = this.filteredImages.reduce((sum, img) => sum + (img.size || 0), 0);
        
        this.totalImagesEl.textContent = totalImages.toLocaleString();
        this.totalSizeEl.textContent = this.formatFileSize(totalSize);
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
        
        // Display current tags
        this.displayCurrentTags(image.tags || []);
        
        // Reset tag selection
        this.tagSelect.value = '';
        this.addTagBtn.disabled = true;
        
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
            
            // Find and remove from main images array using the image ID
            const imageId = this.selectedImage.id;
            const mainIndex = this.images.findIndex(img => img.id === imageId);
            if (mainIndex !== -1) {
                this.images.splice(mainIndex, 1);
            }
            
            // Update display with current filter
            this.updateStats();
            this.applyFilter();
            this.renderFilteredGallery();
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

    // Tag Management Methods
    async loadTags() {
        try {
            const response = await fetch('/api/tags');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.availableTags = data.tags || [];
            this.populateTagSelect();
            
        } catch (error) {
            console.error('Error loading tags:', error);
            this.availableTags = [];
        }
    }

    populateTagSelect() {
        // Clear existing options except the first one
        this.tagSelect.innerHTML = '<option value="">Add a tag...</option>';
        
        // Add available tags as options
        this.availableTags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag.id;
            option.textContent = tag.display_name;
            option.dataset.color = tag.color;
            this.tagSelect.appendChild(option);
        });
    }

    displayCurrentTags(tags) {
        this.currentTags.innerHTML = '';
        
        if (!tags || tags.length === 0) {
            const noTags = document.createElement('div');
            noTags.className = 'no-tags';
            noTags.textContent = 'No tags assigned';
            this.currentTags.appendChild(noTags);
            return;
        }

        tags.forEach(tag => {
            const tagItem = document.createElement('div');
            tagItem.className = 'tag-item';
            
            if (tag.color && tag.color !== '#e90b75') {
                tagItem.classList.add('colored');
                tagItem.style.backgroundColor = tag.color;
            }

            const tagText = document.createElement('span');
            tagText.textContent = tag.display_name;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'tag-remove';
            removeBtn.innerHTML = '×';
            removeBtn.title = `Remove ${tag.display_name} tag`;
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeTagFromImage(tag.id);
            });

            tagItem.appendChild(tagText);
            tagItem.appendChild(removeBtn);
            this.currentTags.appendChild(tagItem);
        });
    }

    async addTagToImage() {
        if (!this.selectedImage || !this.tagSelect.value) return;

        const tagId = this.tagSelect.value;
        const storagePath = this.selectedImage.path;

        if (!storagePath) {
            alert('Unable to identify image storage path.');
            return;
        }

        try {
            const response = await fetch(`/api/images/${encodeURIComponent(storagePath)}/tags`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tagIds: [tagId] })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            // Refresh the image tags
            await this.refreshImageTags();
            
            // Reset the select
            this.tagSelect.value = '';
            this.addTagBtn.disabled = true;

        } catch (error) {
            console.error('Error adding tag:', error);
            alert(`Failed to add tag: ${error.message}`);
        }
    }

    async removeTagFromImage(tagId) {
        if (!this.selectedImage) return;

        const storagePath = this.selectedImage.path;
        if (!storagePath) return;

        try {
            const response = await fetch(`/api/images/${encodeURIComponent(storagePath)}/tags/${tagId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            // Refresh the image tags
            await this.refreshImageTags();

        } catch (error) {
            console.error('Error removing tag:', error);
            alert(`Failed to remove tag: ${error.message}`);
        }
    }

    async refreshImageTags() {
        if (!this.selectedImage || !this.selectedImage.path) return;

        try {
            const response = await fetch(`/api/images/${encodeURIComponent(this.selectedImage.path)}/tags`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.selectedImage.tags = data.tags || [];
            
            // Update the display
            this.displayCurrentTags(this.selectedImage.tags);
            
            // Update the main images array
            const mainImageIndex = this.images.findIndex(img => img.id === this.selectedImage.id);
            if (mainImageIndex !== -1) {
                this.images[mainImageIndex].tags = this.selectedImage.tags;
            }

        } catch (error) {
            console.error('Error refreshing image tags:', error);
        }
    }
}

// Initialize gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gallery = new Gallery();
});