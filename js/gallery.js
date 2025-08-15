// Gallery functionality
class Gallery {
    constructor() {
        this.images = [];
        this.filteredImages = [];
        this.currentView = 'grid';
        this.selectedModels = ['imagen-3', 'imagen-4', 'imagen-4-ultra', 'veo-3']; // Show all by default
        this.selectedTags = []; // Show all by default (empty array means no tag filter)
        this.selectedImage = null;
        this.availableTags = [];
        
        this.initElements();
        this.initEventListeners();
        this.initializeDropdowns();
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
        
        // Model dropdown elements
        this.modelDropdownTrigger = document.getElementById('modelDropdownTrigger');
        this.modelDropdownLabel = document.getElementById('modelDropdownLabel');
        this.modelDropdownMenu = document.getElementById('modelDropdownMenu');
        this.selectAllModelsBtn = document.getElementById('selectAllModelsBtn');
        this.clearAllModelsBtn = document.getElementById('clearAllModelsBtn');
        this.modelCheckboxes = document.querySelectorAll('#modelDropdownMenu .dropdown-option input[type="checkbox"]');
        
        // Tag dropdown elements
        this.tagDropdownTrigger = document.getElementById('tagDropdownTrigger');
        this.tagDropdownLabel = document.getElementById('tagDropdownLabel');
        this.tagDropdownMenu = document.getElementById('tagDropdownMenu');
        this.selectAllTagsBtn = document.getElementById('selectAllTagsBtn');
        this.clearAllTagsBtn = document.getElementById('clearAllTagsBtn');
        this.tagDropdownOptions = document.getElementById('tagDropdownOptions');
        
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
        
        // Model dropdown event listeners
        this.modelDropdownTrigger.addEventListener('click', () => this.toggleModelDropdown());
        this.selectAllModelsBtn.addEventListener('click', () => this.selectAllModels());
        this.clearAllModelsBtn.addEventListener('click', () => this.clearAllModels());
        
        // Model checkbox change listeners
        this.modelCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateSelectedModels());
        });
        
        // Tag dropdown event listeners
        this.tagDropdownTrigger.addEventListener('click', () => this.toggleTagDropdown());
        this.selectAllTagsBtn.addEventListener('click', () => this.selectAllTags());
        this.clearAllTagsBtn.addEventListener('click', () => this.clearAllTags());
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.modelDropdownTrigger.contains(e.target) && !this.modelDropdownMenu.contains(e.target)) {
                this.closeModelDropdown();
            }
            if (!this.tagDropdownTrigger.contains(e.target) && !this.tagDropdownMenu.contains(e.target)) {
                this.closeTagDropdown();
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
                } else if (this.modelDropdownMenu.classList.contains('show')) {
                    this.closeModelDropdown();
                } else if (this.tagDropdownMenu.classList.contains('show')) {
                    this.closeTagDropdown();
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



    initializeDropdowns() {
        // Set initial checkbox states based on selectedModels
        this.modelCheckboxes.forEach(checkbox => {
            checkbox.checked = this.selectedModels.includes(checkbox.value);
        });
        
        // Update the dropdown labels
        this.updateModelDropdownLabel();
        this.updateTagDropdownLabel();
    }

    applyFilter() {
        if (this.selectedModels.length === 0) {
            // If no models selected, show empty
            this.filteredImages = [];
        } else {
            // Filter images based on selected models
            let filtered = this.images.filter(image => 
                this.selectedModels.includes(image.model)
            );
            
            // Apply tag filter if tags are selected
            if (this.selectedTags.length > 0) {
                filtered = filtered.filter(image => {
                    if (!image.tags || image.tags.length === 0) {
                        return false; // Image has no tags, exclude it
                    }
                    
                    // Check if image has any of the selected tags
                    const imageTagIds = image.tags.map(tag => tag.id);
                    return this.selectedTags.some(tagId => imageTagIds.includes(tagId));
                });
            }
            
            this.filteredImages = filtered;
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

    // Tag dropdown methods
    toggleTagDropdown() {
        const isOpen = this.tagDropdownMenu.classList.contains('show');
        if (isOpen) {
            this.closeTagDropdown();
        } else {
            this.openTagDropdown();
        }
    }

    openTagDropdown() {
        this.tagDropdownTrigger.classList.add('active');
        this.tagDropdownMenu.classList.add('show');
    }

    closeTagDropdown() {
        this.tagDropdownTrigger.classList.remove('active');
        this.tagDropdownMenu.classList.remove('show');
    }

    toggleModelDropdown() {
        const isOpen = this.modelDropdownMenu.classList.contains('show');
        if (isOpen) {
            this.closeModelDropdown();
        } else {
            this.openModelDropdown();
        }
    }

    openModelDropdown() {
        this.modelDropdownTrigger.classList.add('active');
        this.modelDropdownMenu.classList.add('show');
    }

    closeModelDropdown() {
        this.modelDropdownTrigger.classList.remove('active');
        this.modelDropdownMenu.classList.remove('show');
    }

    updateSelectedModels() {
        // Get selected models from checkboxes
        this.selectedModels = Array.from(this.modelCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);
        
        // Update dropdown label
        this.updateModelDropdownLabel();
        
        // Apply filter and re-render
        this.applyFilter();
        this.renderFilteredGallery();
    }

    updateModelDropdownLabel() {
        const selectedCount = this.selectedModels.length;
        const totalCount = this.modelCheckboxes.length;
        
        if (selectedCount === 0) {
            this.modelDropdownLabel.textContent = 'No Models Selected';
        } else if (selectedCount === totalCount) {
            this.modelDropdownLabel.textContent = 'All Models';
        } else if (selectedCount === 1) {
            const modelName = this.formatModelName(this.selectedModels[0]);
            this.modelDropdownLabel.textContent = modelName;
        } else {
            this.modelDropdownLabel.textContent = `${selectedCount} Models Selected`;
        }
    }

    selectAllModels() {
        // Check all checkboxes
        this.modelCheckboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
        
        // Update selected models and apply filter
        this.updateSelectedModels();
    }

    clearAllModels() {
        // Uncheck all checkboxes
        this.modelCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Update selected models and apply filter
        this.updateSelectedModels();
    }

    updateSelectedTags() {
        // Get selected tags from checkboxes
        const tagCheckboxes = document.querySelectorAll('#tagDropdownOptions .dropdown-option input[type="checkbox"]');
        this.selectedTags = Array.from(tagCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => parseInt(checkbox.value));
        
        // Update dropdown label
        this.updateTagDropdownLabel();
        
        // Apply filter and re-render
        this.applyFilter();
        this.renderFilteredGallery();
    }

    updateTagDropdownLabel() {
        const selectedCount = this.selectedTags.length;
        const totalCount = this.availableTags.length;
        
        if (selectedCount === 0) {
            this.tagDropdownLabel.textContent = 'All Tags';
        } else if (selectedCount === totalCount) {
            this.tagDropdownLabel.textContent = 'All Tags';
        } else if (selectedCount === 1) {
            const tag = this.availableTags.find(t => t.id === this.selectedTags[0]);
            this.tagDropdownLabel.textContent = tag ? tag.display_name : 'Unknown Tag';
        } else {
            this.tagDropdownLabel.textContent = `${selectedCount} Tags Selected`;
        }
    }

    selectAllTags() {
        // Check all tag checkboxes
        const tagCheckboxes = document.querySelectorAll('#tagDropdownOptions .dropdown-option input[type="checkbox"]');
        tagCheckboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
        
        // Update selected tags and apply filter
        this.updateSelectedTags();
    }

    clearAllTags() {
        // Uncheck all tag checkboxes
        const tagCheckboxes = document.querySelectorAll('#tagDropdownOptions .dropdown-option input[type="checkbox"]');
        tagCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Update selected tags and apply filter
        this.updateSelectedTags();
    }

    populateTagDropdown() {
        // Clear existing options
        this.tagDropdownOptions.innerHTML = '';
        
        // Add available tags as options
        this.availableTags.forEach(tag => {
            const label = document.createElement('label');
            label.className = 'dropdown-option';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = tag.id;
            checkbox.addEventListener('change', () => this.updateSelectedTags());
            
            const checkmark = document.createElement('span');
            checkmark.className = 'checkmark';
            
            const optionText = document.createElement('span');
            optionText.className = 'option-text';
            optionText.textContent = tag.display_name;
            
            label.appendChild(checkbox);
            label.appendChild(checkmark);
            label.appendChild(optionText);
            
            this.tagDropdownOptions.appendChild(label);
        });
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
            this.populateTagDropdown();
            
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