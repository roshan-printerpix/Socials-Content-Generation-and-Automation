// Navbar Component Loader
class NavbarLoader {
    constructor(currentPage) {
        this.currentPage = currentPage;
        this.loadNavbar();
    }

    async loadNavbar() {
        try {
            // Find the navbar placeholder
            const navbarPlaceholder = document.getElementById('navbar-placeholder');
            if (!navbarPlaceholder) {
                console.error('Navbar placeholder not found');
                return;
            }

            // Fetch the navbar HTML
            const response = await fetch('/components/navbar.html');
            if (!response.ok) {
                throw new Error(`Failed to load navbar: ${response.status}`);
            }

            const navbarHTML = await response.text();
            navbarPlaceholder.innerHTML = navbarHTML;

            // Set the active page
            this.setActivePage();

        } catch (error) {
            console.error('Error loading navbar:', error);
            // Fallback: create a basic navbar
            this.createFallbackNavbar();
        }
    }

    setActivePage() {
        // Remove active class from all nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => link.classList.remove('active'));

        // Add active class to current page
        const currentLink = document.querySelector(`[data-page="${this.currentPage}"]`);
        if (currentLink) {
            currentLink.classList.add('active');
        }
    }

    createFallbackNavbar() {
        const navbarPlaceholder = document.getElementById('navbar-placeholder');
        if (!navbarPlaceholder) return;

        navbarPlaceholder.innerHTML = `
            <nav class="floating-navbar">
                <div class="navbar-content">
                    <div class="navbar-brand">
                        <h2>Printerpix Studio</h2>
                    </div>
                    <div class="navbar-nav">
                        <a href="/" class="nav-link ${this.currentPage === 'images' ? 'active' : ''}">Images</a>
                        <a href="/videos.html" class="nav-link ${this.currentPage === 'videos' ? 'active' : ''}">Videos</a>
                        <a href="/gallery.html" class="nav-link ${this.currentPage === 'gallery' ? 'active' : ''}">Gallery</a>
                        <a href="/prompts.html" class="nav-link ${this.currentPage === 'prompts' ? 'active' : ''}">Prompts</a>
                    </div>
                </div>
            </nav>
        `;
    }
}

// Utility function to initialize navbar
function initNavbar(currentPage) {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new NavbarLoader(currentPage);
        });
    } else {
        new NavbarLoader(currentPage);
    }
}

// Export for use in other files
window.initNavbar = initNavbar;