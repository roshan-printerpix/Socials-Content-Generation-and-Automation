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
        
        // Email notification system
        this.notifyMode = false;
        this.selectedImages = [];
        
        // Scheduling system
        this.scheduleMode = false;
        
        this.initElements();
        this.initEventListeners();
        this.initializeDropdowns();
        
        // Load tags first, then gallery
        this.loadTags().then(() => {
            console.log('🏷️ Tags loaded successfully, now loading gallery...');
            // Ensure selectedTags is properly initialized
            if (this.selectedTags.length === 0 && this.availableTags.length > 0) {
                this.selectedTags = this.availableTags.map(tag => tag.id);
                console.log('🏷️ Initialized selectedTags:', this.selectedTags);
            }
            this.loadGallery();
        }).catch(error => {
            console.error('Failed to load tags:', error);
            this.loadGallery(); // Load gallery even if tags fail
        });


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
        
        // Email notification elements
        this.notifyModeBtn = document.getElementById('notifyModeBtn');
        this.proceedButton = document.getElementById('proceedButton');
        this.selectedCount = document.getElementById('selectedCount');
        this.proceedBtn = document.getElementById('proceedBtn');
        
        // Schedule elements
        this.scheduleModeBtn = document.getElementById('scheduleModeBtn');
        this.scheduleModal = document.getElementById('scheduleModal');
        this.scheduleModalClose = document.getElementById('scheduleModalClose');
        this.postTitle = document.getElementById('postTitle');
        this.postCaption = document.getElementById('postCaption');
        this.scheduleDateTime = document.getElementById('scheduleDateTime');
        this.scheduleImageCount = document.getElementById('scheduleImageCount');
        this.scheduleImageGrid = document.getElementById('scheduleImageGrid');
        this.cancelScheduleBtn = document.getElementById('cancelScheduleBtn');
        this.postNowBtn = document.getElementById('postNowBtn');
        this.schedulePostBtn = document.getElementById('schedulePostBtn');
        this.emailModal = document.getElementById('emailModal');
        this.emailModalClose = document.getElementById('emailModalClose');
        this.recipientEmail = document.getElementById('recipientEmail');
        this.emailSubject = document.getElementById('emailSubject');
        this.emailMessage = document.getElementById('emailMessage');
        this.emailImageCount = document.getElementById('emailImageCount');
        this.emailImageGrid = document.getElementById('emailImageGrid');
        this.cancelEmailBtn = document.getElementById('cancelEmailBtn');
        this.sendEmailBtn = document.getElementById('sendEmailBtn');
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
        
        // Email notification event listeners
        this.notifyModeBtn.addEventListener('click', () => this.toggleNotifyMode());
        this.proceedBtn.addEventListener('click', () => this.handleProceedClick());
        this.emailModalClose.addEventListener('click', () => this.closeEmailModal());
        this.cancelEmailBtn.addEventListener('click', () => this.closeEmailModal());
        this.sendEmailBtn.addEventListener('click', () => this.sendEmail());
        
        // Schedule event listeners
        this.scheduleModeBtn.addEventListener('click', () => this.toggleScheduleMode());
        this.scheduleModalClose.addEventListener('click', () => this.closeScheduleModal());
        this.cancelScheduleBtn.addEventListener('click', () => this.closeScheduleModal());
        this.postNowBtn.addEventListener('click', () => this.postSelectedImagesNow());
        this.schedulePostBtn.addEventListener('click', () => this.scheduleSelectedPosts());
        
        // Close email modal when clicking outside
        this.emailModal.addEventListener('click', (e) => {
            if (e.target === this.emailModal) this.closeEmailModal();
        });
        
        // Close schedule modal when clicking outside
        this.scheduleModal.addEventListener('click', (e) => {
            if (e.target === this.scheduleModal) this.closeScheduleModal();
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.scheduleModal.style.display !== 'none') {
                    this.closeScheduleModal();
                } else if (this.emailModal.style.display !== 'none') {
                    this.closeEmailModal();
                } else if (this.imageModal.style.display !== 'none') {
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
            
            // Wait for tags to be loaded before rendering gallery
            if (this.availableTags.length > 0) {
                console.log('🏷️ Tags already loaded, rendering gallery immediately');
                this.renderGallery();
            } else {
                // If tags aren't loaded yet, wait for them
                console.log('🏷️ Waiting for tags to load before rendering gallery...');
                const checkTags = setInterval(() => {
                    if (this.availableTags.length > 0) {
                        clearInterval(checkTags);
                        console.log('🏷️ Tags loaded, now rendering gallery');
                        this.renderGallery();
                    }
                }, 100);
            }
            
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
        console.log('🎨 Rendering filtered gallery with', this.filteredImages.length, 'images');
        
        if (this.filteredImages.length === 0) {
            console.log('🎨 No filtered images - showing empty state');
            this.showEmpty();
            return;
        }

        this.showGallery();
        this.galleryGrid.innerHTML = '';

        this.filteredImages.forEach((image, index) => {
            const item = this.createGalleryItem(image, index);
            this.galleryGrid.appendChild(item);
        });
        
        console.log('🎨 Gallery rendered successfully');
    }

    createGalleryItem(image, index) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        // Add notify/schedule mode class if in either mode
        if (this.notifyMode || this.scheduleMode) {
            item.classList.add(this.notifyMode ? 'notify-mode' : 'schedule-mode');
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleImageSelection(image);
            });
        } else {
            item.addEventListener('click', () => this.openModal(image, index));
        }

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

        // Check if this image is selected
        if (this.notifyMode && this.selectedImages.some(selected => selected.id === image.id)) {
            item.classList.add('selected');
        }

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

    // Tag dropdown methods
    toggleTagDropdown() {
        console.log('🏷️ Toggling tag dropdown...');
        const isOpen = this.tagDropdownMenu.classList.contains('show');
        console.log('🏷️ Dropdown is currently:', isOpen ? 'open' : 'closed');
        
        if (isOpen) {
            this.closeTagDropdown();
        } else {
            this.openTagDropdown();
        }
    }

    openTagDropdown() {
        this.tagDropdownTrigger.classList.add('active');
        this.tagDropdownMenu.classList.add('show');
        
        // Debug: Check if tag options are properly populated
        const tagCheckboxes = document.querySelectorAll('#tagDropdownOptions .dropdown-option input[type="checkbox"]');
        console.log('🏷️ Tag dropdown opened, found', tagCheckboxes.length, 'checkboxes');
        console.log('🏷️ Current selectedTags:', this.selectedTags);
        console.log('🏷️ Available tags:', this.availableTags);
        
        // Update checkbox states to match selectedTags
        tagCheckboxes.forEach(checkbox => {
            const tagId = checkbox.value; // Keep as string UUID
            const shouldBeChecked = this.selectedTags.includes(tagId);
            checkbox.checked = shouldBeChecked;
            console.log(`🏷️ Checkbox for tag ${tagId}: ${shouldBeChecked ? 'checked' : 'unchecked'}`);
        });
        
        // If no checkboxes found, try to repopulate
        if (tagCheckboxes.length === 0 && this.availableTags.length > 0) {
            console.log('🏷️ No checkboxes found, repopulating dropdown...');
            this.populateTagDropdown();
            
            // After repopulating, update checkbox states again
            setTimeout(() => {
                const newTagCheckboxes = document.querySelectorAll('#tagDropdownOptions .dropdown-option input[type="checkbox"]');
                console.log('🏷️ After repopulation, found', newTagCheckboxes.length, 'checkboxes');
                newTagCheckboxes.forEach(checkbox => {
                    const tagId = checkbox.value; // Keep as string UUID
                    const shouldBeChecked = this.selectedTags.includes(tagId);
                    checkbox.checked = shouldBeChecked;
                });
            }, 100);
        }
    }

    closeTagDropdown() {
        console.log('🏷️ Closing tag dropdown...');
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
        console.log('🏷️ Found', tagCheckboxes.length, 'tag checkboxes');
        
        this.selectedTags = Array.from(tagCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value); // Don't parse as int - keep as string UUID
        
        console.log('🏷️ Selected tags:', this.selectedTags);
        console.log('🏷️ Available tags:', this.availableTags);
        
        // Log the actual checkbox values for debugging
        tagCheckboxes.forEach((checkbox, index) => {
            console.log(`🏷️ Checkbox ${index}: value=${checkbox.value}, checked=${checkbox.checked}`);
        });
        
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
        
        // Set all available tags as selected
        this.selectedTags = this.availableTags.map(tag => tag.id);
        
        // Update dropdown label
        this.updateTagDropdownLabel();
        
        // Apply filter and re-render
        this.applyFilter();
        this.renderFilteredGallery();
    }

    clearAllTags() {
        // Uncheck all tag checkboxes
        const tagCheckboxes = document.querySelectorAll('#tagDropdownOptions .dropdown-option input[type="checkbox"]');
        tagCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Clear selected tags array and update
        this.selectedTags = [];
        
        // Update dropdown label
        this.updateTagDropdownLabel();
        
        // Apply filter and re-render
        this.applyFilter();
        this.renderFilteredGallery();
    }

    populateTagDropdown() {
        // Clear existing options
        this.tagDropdownOptions.innerHTML = '';
        
        console.log('🏷️ Populating tag dropdown with', this.availableTags.length, 'tags');
        console.log('🏷️ Tag dropdown container:', this.tagDropdownOptions);
        
        if (!this.tagDropdownOptions) {
            console.error('❌ Tag dropdown options container not found!');
            return;
        }
        
        // Add available tags as options
        this.availableTags.forEach((tag, index) => {
            console.log(`🏷️ Creating option ${index + 1} for tag:`, tag.display_name, 'ID:', tag.id);
            
            const label = document.createElement('label');
            label.className = 'dropdown-option';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = tag.id;
            checkbox.checked = this.selectedTags.includes(tag.id); // Set initial state
            checkbox.addEventListener('change', () => {
                console.log('🏷️ Tag checkbox changed:', tag.display_name, 'checked:', checkbox.checked);
                this.updateSelectedTags();
            });
            
            const checkmark = document.createElement('span');
            checkmark.className = 'checkmark';
            
            const optionText = document.createElement('span');
            optionText.className = 'option-text';
            optionText.textContent = tag.display_name;
            
            label.appendChild(checkbox);
            label.appendChild(checkmark);
            label.appendChild(optionText);
            
            this.tagDropdownOptions.appendChild(label);
            console.log(`🏷️ Added option for tag: ${tag.display_name}`);
        });
        
        console.log('🏷️ Tag dropdown populated successfully with', this.availableTags.length, 'options');
        
        // Verify the options were added
        const addedOptions = this.tagDropdownOptions.querySelectorAll('.dropdown-option');
        console.log('🏷️ Verified', addedOptions.length, 'options in dropdown');
        
        // Log each option for debugging
        addedOptions.forEach((option, index) => {
            const checkbox = option.querySelector('input[type="checkbox"]');
            const text = option.querySelector('.option-text');
            console.log(`🏷️ Option ${index + 1}:`, {
                text: text?.textContent,
                checkboxValue: checkbox?.value,
                checked: checkbox?.checked
            });
        });
    }

    initializeDropdowns() {
        // Set initial checkbox states based on selectedModels
        this.modelCheckboxes.forEach(checkbox => {
            checkbox.checked = this.selectedModels.includes(checkbox.value);
        });
        
        // Update the dropdown labels
        this.updateModelDropdownLabel();
        this.updateTagDropdownLabel();
        
        console.log('🏷️ Dropdowns initialized');
        console.log('🏷️ Selected models:', this.selectedModels);
        console.log('🏷️ Selected tags:', this.selectedTags);
    }

    applyFilter() {
        console.log('🔍 Applying filter...');
        console.log('📊 Total images:', this.images.length);
        console.log('🤖 Selected models:', this.selectedModels);
        console.log('🏷️ Selected tags:', this.selectedTags);
        console.log('🏷️ Available tags count:', this.availableTags.length);
        
        if (this.selectedModels.length === 0) {
            // If no models selected, show empty
            this.filteredImages = [];
            console.log('❌ No models selected - showing empty');
        } else {
            // Filter images based on selected models
            let filtered = this.images.filter(image => 
                this.selectedModels.includes(image.model)
            );
            
            console.log('📊 After model filter:', filtered.length);
            
            // Apply tag filter if tags are selected
            if (this.selectedTags.length > 0) {
                console.log('🏷️ Applying tag filter...');
                console.log('🏷️ Filtering by tags:', this.selectedTags);
                
                // Log some sample images for debugging
                console.log('🏷️ Sample images with tags:', filtered.slice(0, 3).map(img => ({
                    name: img.name,
                    tags: img.tags?.map(t => t.display_name) || []
                })));
                
                filtered = filtered.filter(image => {
                    // If image has no tags, exclude it when specific tags are selected
                    if (!image.tags || image.tags.length === 0) {
                        console.log('📷 Image has no tags:', image.name, '- excluding it (no tags match)');
                        return false; // Exclude images without tags when filtering by tags
                    }
                    
                    // Check if image has any of the selected tags
                    const imageTagIds = image.tags.map(tag => tag.id);
                    const hasMatchingTag = this.selectedTags.some(tagId => imageTagIds.includes(tagId));
                    
                    console.log(`🏷️ Image "${image.name}" tags:`, imageTagIds, 'matches:', hasMatchingTag);
                    
                    return hasMatchingTag;
                });
                
                console.log('📊 After tag filter:', filtered.length);
            } else {
                console.log('🏷️ No tag filter applied - showing all images');
            }
            
            this.filteredImages = filtered;
        }
        
        console.log('✅ Final filtered images:', this.filteredImages.length);
        
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
            console.log('🏷️ Loading tags...');
            const response = await fetch('/api/tags');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.availableTags = data.tags || [];
            console.log('🏷️ Loaded tags:', this.availableTags);
            
            this.populateTagSelect();
            this.populateTagDropdown();
            
            console.log('🏷️ Tag dropdown populated with', this.availableTags.length, 'tags');
            
            // Initialize with all tags selected by default
            this.selectedTags = this.availableTags.map(tag => tag.id);
            console.log('🏷️ Initial selected tags:', this.selectedTags);
            
            // Update the dropdown label and apply initial filter
            this.updateTagDropdownLabel();
            
        } catch (error) {
            console.error('Error loading tags:', error);
            this.availableTags = [];
            this.selectedTags = [];
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

    // Email Notification System Methods
    toggleNotifyMode() {
        this.notifyMode = !this.notifyMode;
        this.notifyModeBtn.classList.toggle('active', this.notifyMode);
        
        if (this.notifyMode) {
            // Enable notify mode
            this.selectedImages = [];
            this.updateProceedButton();
            this.renderFilteredGallery(); // Re-render to add notify mode classes
        } else {
            // Disable notify mode
            this.selectedImages = [];
            this.proceedButton.style.display = 'none';
            this.renderFilteredGallery(); // Re-render to remove notify mode classes
        }
    }

    toggleImageSelection(image) {
        const existingIndex = this.selectedImages.findIndex(selected => selected.id === image.id);
        
        if (existingIndex !== -1) {
            // Remove from selection
            this.selectedImages.splice(existingIndex, 1);
        } else {
            // Add to selection
            this.selectedImages.push(image);
        }
        
        this.updateProceedButton();
        this.renderFilteredGallery(); // Re-render to update selection states
    }

    updateProceedButton() {
        const count = this.selectedImages.length;
        
        if (count > 0) {
            this.selectedCount.textContent = `${count} image${count > 1 ? 's' : ''} selected`;
            
            // Update proceed button text based on mode
            if (this.scheduleMode) {
                this.proceedBtn.textContent = 'Schedule';
            } else if (this.notifyMode) {
                this.proceedBtn.textContent = 'Proceed';
            }
            
            this.proceedButton.style.display = 'block';
        } else {
            this.proceedButton.style.display = 'none';
        }
    }

    openEmailModal() {
        if (this.selectedImages.length === 0) {
            alert('Please select at least one image to proceed.');
            return;
        }
        
        // Populate email modal with selected images
        this.populateEmailModal();
        this.emailModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeEmailModal() {
        this.emailModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    populateEmailModal() {
        // Update image count
        this.emailImageCount.textContent = this.selectedImages.length;
        
        // Clear and populate image grid
        this.emailImageGrid.innerHTML = '';
        
        this.selectedImages.forEach((image, index) => {
            const imageItem = document.createElement('div');
            imageItem.className = 'email-image-item';
            
            const img = document.createElement('img');
            img.src = image.url;
            img.alt = image.name;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'email-image-remove';
            removeBtn.innerHTML = '×';
            removeBtn.title = 'Remove from selection';
            removeBtn.addEventListener('click', () => {
                this.removeImageFromEmail(index);
            });
            
            imageItem.appendChild(img);
            imageItem.appendChild(removeBtn);
            this.emailImageGrid.appendChild(imageItem);
        });
    }

    removeImageFromEmail(index) {
        this.selectedImages.splice(index, 1);
        this.populateEmailModal();
        this.updateProceedButton();
        
        // If no images left, close modal
        if (this.selectedImages.length === 0) {
            this.closeEmailModal();
        }
    }

    async sendEmail() {
        const recipient = this.recipientEmail.value.trim();
        const subject = this.emailSubject.value.trim();
        const message = this.emailMessage.value.trim();
        
        if (!recipient) {
            alert('Please enter a recipient email address.');
            this.recipientEmail.focus();
            return;
        }
        
        if (!subject) {
            alert('Please enter an email subject.');
            this.emailSubject.focus();
            return;
        }
        
        if (this.selectedImages.length === 0) {
            alert('No images selected to send.');
            return;
        }
        
        this.sendEmailBtn.disabled = true;
        this.sendEmailBtn.textContent = 'Sending...';
        
        try {
            const formData = new FormData();
            formData.append('recipient', recipient);
            formData.append('subject', subject);
            formData.append('message', message);
            
            // Add image URLs and metadata
            const imageData = this.selectedImages.map(image => ({
                url: image.url,
                name: image.name,
                model: image.model,
                size: image.size
            }));
            formData.append('images', JSON.stringify(imageData));
            
            const response = await fetch('/api/email/send-images', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.method === 'mailto') {
                // Handle mailto fallback
                const userConfirmed = confirm(`Email credentials not configured on server.\n\nWould you like to open your email client with pre-filled content?\n\nNote: Configure EMAIL_HOST, EMAIL_USER, and EMAIL_PASS in your .env file for automatic sending.`);
                
                if (userConfirmed && result.mailtoLink) {
                    window.location.href = result.mailtoLink;
                }
                
                alert(`Email client opened with content for ${recipient}!`);
            } else {
                // Handle successful SMTP sending
                alert(`Email sent successfully to ${recipient}!`);
            }
            
            // Reset and close
            this.closeEmailModal();
            this.toggleNotifyMode(); // Exit notify mode
            
        } catch (error) {
            console.error('Error sending email:', error);
            alert(`Failed to send email: ${error.message}`);
        } finally {
            this.sendEmailBtn.disabled = false;
            this.sendEmailBtn.textContent = 'Send Email';
        }
    }

    // Scheduling System Methods
    toggleScheduleMode() {
        this.scheduleMode = !this.scheduleMode;
        this.scheduleModeBtn.classList.toggle('active', this.scheduleMode);
        
        if (this.scheduleMode) {
            // Disable notify mode if it's active
            if (this.notifyMode) {
                this.toggleNotifyMode();
            }
            
            // Enable schedule mode
            this.selectedImages = [];
            this.updateProceedButton();
            this.renderFilteredGallery(); // Re-render to add schedule mode classes
        } else {
            // Disable schedule mode
            this.selectedImages = [];
            this.proceedButton.style.display = 'none';
            this.renderFilteredGallery(); // Re-render to remove schedule mode classes
        }
    }

    handleProceedClick() {
        if (this.notifyMode) {
            this.openEmailModal();
        } else if (this.scheduleMode) {
            this.openScheduleModal();
        }
    }

    openScheduleModal() {
        if (this.selectedImages.length === 0) {
            alert('Please select at least one image to schedule.');
            return;
        }
        
        // Generate a default caption based on first image
        this.generateDefaultCaption();
        
        // Set default schedule time to 1 hour from now
        const defaultTime = new Date();
        defaultTime.setHours(defaultTime.getHours() + 1);
        this.scheduleDateTime.value = defaultTime.toISOString().slice(0, 16);
        
        // Populate schedule modal with selected images
        this.populateScheduleModal();
        this.scheduleModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeScheduleModal() {
        this.scheduleModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    populateScheduleModal() {
        // Update image count
        this.scheduleImageCount.textContent = this.selectedImages.length;
        
        // Clear and populate image grid
        this.scheduleImageGrid.innerHTML = '';
        
        this.selectedImages.forEach((image, index) => {
            const imageItem = document.createElement('div');
            imageItem.className = 'schedule-image-item';
            
            const img = document.createElement('img');
            img.src = image.url;
            img.alt = image.name;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'schedule-image-remove';
            removeBtn.innerHTML = '×';
            removeBtn.title = 'Remove from selection';
            removeBtn.addEventListener('click', () => {
                this.removeImageFromSchedule(index);
            });
            
            imageItem.appendChild(img);
            imageItem.appendChild(removeBtn);
            this.scheduleImageGrid.appendChild(imageItem);
        });
    }

    removeImageFromSchedule(index) {
        this.selectedImages.splice(index, 1);
        this.populateScheduleModal();
        this.updateProceedButton();
        
        // If no images left, close modal
        if (this.selectedImages.length === 0) {
            this.closeScheduleModal();
        }
    }

    generateDefaultCaption() {
        const imageCount = this.selectedImages.length;
        const models = [...new Set(this.selectedImages.map(img => this.formatModelName(img.model)))];
        
        let caption = '';
        if (imageCount === 1) {
            caption = `Transform your precious memories into beautiful keepsakes! ✨ Create lasting treasures that tell your unique story.`;
        } else {
            caption = `Transform your precious memories into beautiful keepsakes! ✨ ${imageCount} stunning images ready to become lasting treasures.`;
        }
        
        this.postTitle.value = `Printerpix Post - ${new Date().toLocaleDateString()}`;
        this.postCaption.value = caption + '\n\n#printerpix #memories #photobook #familymoments #personalized #keepsakes #memorymaking #photoprints';
    }

    async postSelectedImagesNow() {
        const title = this.postTitle.value.trim();
        const caption = this.postCaption.value.trim();
        const platforms = this.getSelectedPlatforms();
        
        if (!title) {
            alert('Please enter a post title.');
            this.postTitle.focus();
            return;
        }
        
        if (!caption) {
            alert('Please enter a caption.');
            this.postCaption.focus();
            return;
        }
        
        if (platforms.length === 0) {
            alert('Please select at least one social media platform.');
            return;
        }
        
        if (this.selectedImages.length === 0) {
            alert('No images selected to post.');
            return;
        }
        
        this.postNowBtn.disabled = true;
        this.postNowBtn.textContent = 'Posting...';
        
        try {
            // For now, just post to Instagram (can be extended later)
            if (platforms.includes('instagram')) {
                await this.postToInstagram(caption);
            }
            
            alert(`Successfully posted to ${platforms.join(', ')}!`);
            
            // Reset and close
            this.closeScheduleModal();
            this.toggleScheduleMode(); // Exit schedule mode
            
        } catch (error) {
            console.error('Error posting now:', error);
            alert(`Failed to post: ${error.message}`);
        } finally {
            this.postNowBtn.disabled = false;
            this.postNowBtn.textContent = 'Post Now';
        }
    }

    async scheduleSelectedPosts() {
        const title = this.postTitle.value.trim();
        const caption = this.postCaption.value.trim();
        const platforms = this.getSelectedPlatforms();
        const scheduleTime = this.scheduleDateTime.value;
        
        if (!title) {
            alert('Please enter a post title.');
            this.postTitle.focus();
            return;
        }
        
        if (!caption) {
            alert('Please enter a caption.');
            this.postCaption.focus();
            return;
        }
        
        if (platforms.length === 0) {
            alert('Please select at least one social media platform.');
            return;
        }
        
        if (!scheduleTime) {
            alert('Please select a schedule time.');
            this.scheduleDateTime.focus();
            return;
        }
        
        // Check if schedule time is in the future
        const scheduleDate = new Date(scheduleTime);
        if (scheduleDate <= new Date()) {
            alert('Please select a future date and time.');
            this.scheduleDateTime.focus();
            return;
        }
        
        if (this.selectedImages.length === 0) {
            alert('No images selected to schedule.');
            return;
        }
        
        this.schedulePostBtn.disabled = true;
        this.schedulePostBtn.textContent = 'Scheduling...';
        
        try {
            const scheduleData = {
                title,
                caption,
                social_platforms: platforms,
                image_paths: this.selectedImages.map(img => img.path),
                scheduled_for: scheduleDate.toISOString()
            };
            
            const response = await fetch('/api/schedule/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(scheduleData)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            alert(`Post scheduled successfully for ${scheduleDate.toLocaleString()}!`);
            
            // Reset and close
            this.closeScheduleModal();
            this.toggleScheduleMode(); // Exit schedule mode
            
        } catch (error) {
            console.error('Error scheduling post:', error);
            alert(`Failed to schedule post: ${error.message}`);
        } finally {
            this.schedulePostBtn.disabled = false;
            this.schedulePostBtn.textContent = 'Schedule Post';
        }
    }

    getSelectedPlatforms() {
        const platformCheckboxes = document.querySelectorAll('.platform-checkbox input[type="checkbox"]');
        return Array.from(platformCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);
    }

    async postToInstagram(caption) {
        // Use the first selected image for Instagram posting
        const firstImage = this.selectedImages[0];
        if (!firstImage) return;
        
        const imageBlob = await this.getImageBlob(firstImage.url);
        
        const formData = new FormData();
        formData.append('image', imageBlob, 'scheduled-post.png');
        formData.append('caption', caption);
        formData.append('model', firstImage.model);
        
        const response = await fetch('/api/instagram/post', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    }

    async getImageBlob(imageSrc) {
        const response = await fetch(imageSrc);
        return await response.blob();
    }
}

// Initialize gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gallery = new Gallery();
});