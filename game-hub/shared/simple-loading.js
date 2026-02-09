// Enhanced Simple Loading Utility with Spinning Controller
// Optimized for performance and smooth animations

class SimpleLoading {
    static show(text = 'Loading...', duration = 600) {
        // Remove existing loading if any
        SimpleLoading.hide();
        
        // Detect current theme
        const currentTheme = SimpleLoading.detectTheme();
        
        const loading = document.createElement('div');
        loading.className = `simple-loading ${currentTheme}`;
        loading.id = 'simple-loading-overlay';
        
        // Optimized controller HTML with better performance
        loading.innerHTML = `
            <div class="loading-content">
                <div class="loading-controller">
                    <div class="controller">
                        <div class="d-pad"></div>
                        <div class="buttons">
                            <div class="button"></div>
                            <div class="button"></div>
                            <div class="button"></div>
                            <div class="button"></div>
                        </div>
                        <div class="analog-sticks">
                            <div class="analog-stick"></div>
                            <div class="analog-stick"></div>
                        </div>
                    </div>
                </div>
                <div class="loading-text">${text}</div>
            </div>
        `;
        
        document.body.appendChild(loading);
        
        // Auto-hide after duration
        if (duration > 0) {
            setTimeout(() => {
                SimpleLoading.hide();
            }, duration);
        }
        
        return loading;
    }
    
    static hide() {
        const existing = document.getElementById('simple-loading-overlay');
        if (existing) {
            // Smooth fade out
            existing.style.opacity = '0';
            existing.style.transform = 'scale(0.95)';
            setTimeout(() => {
                if (existing.parentNode) {
                    existing.remove();
                }
            }, 200);
        }
    }
    
    static showAndNavigate(url, text = 'Loading...', delay = 500) {
        SimpleLoading.show(text, 0); // Don't auto-hide
        
        // Reset scroll position for better UX
        window.scrollTo(0, 0);
        
        setTimeout(() => {
            window.location.href = url;
        }, delay);
    }
    
    // Show loading on page load
    static initPageLoading() {
        // Detect current theme from body class or localStorage
        const currentTheme = SimpleLoading.detectTheme();
        
        // Show loading immediately when page starts loading
        const loadingHTML = `
            <div class="simple-loading ${currentTheme}" id="page-loading-overlay" style="opacity: 1;">
                <div class="loading-content">
                    <div class="loading-controller">
                        <div class="controller">
                            <div class="d-pad"></div>
                            <div class="buttons">
                                <div class="button"></div>
                                <div class="button"></div>
                                <div class="button"></div>
                                <div class="button"></div>
                            </div>
                            <div class="analog-sticks">
                                <div class="analog-stick"></div>
                                <div class="analog-stick"></div>
                            </div>
                        </div>
                    </div>
                    <div class="loading-text">Loading Page...</div>
                </div>
            </div>
        `;
        
        // Insert at the beginning of body
        if (document.body) {
            document.body.insertAdjacentHTML('afterbegin', loadingHTML);
        }
    }
    
    // Detect current theme
    static detectTheme() {
        // Check body class first
        if (document.body) {
            if (document.body.classList.contains('theme-anime')) return 'theme-anime';
            if (document.body.classList.contains('theme-cartoon')) return 'theme-cartoon';
            if (document.body.classList.contains('theme-dark')) return 'theme-dark';
        }
        
        // Check localStorage
        try {
            const savedTheme = localStorage.getItem('gameHubTheme');
            if (savedTheme) {
                return `theme-${savedTheme}`;
            }
            
            const settings = JSON.parse(localStorage.getItem('gameHubSettings') || '{}');
            if (settings.theme) {
                return `theme-${settings.theme}`;
            }
        } catch (e) {
            // Ignore errors
        }
        
        // Default to dark theme
        return 'theme-dark';
    }
    
    // Hide page loading when page is ready
    static hidePageLoading() {
        const pageLoading = document.getElementById('page-loading-overlay');
        if (pageLoading) {
            setTimeout(() => {
                pageLoading.style.opacity = '0';
                pageLoading.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    if (pageLoading.parentNode) {
                        pageLoading.remove();
                    }
                }, 300);
            }, 300); // Small delay to ensure smooth transition
        }
    }
}

// Show loading immediately when script loads
if (document.readyState === 'loading') {
    SimpleLoading.initPageLoading();
}

// Hide loading when page is fully loaded
window.addEventListener('load', () => {
    SimpleLoading.hidePageLoading();
});

// Also hide on DOMContentLoaded as fallback
document.addEventListener('DOMContentLoaded', () => {
    // Give a bit more time for assets to load
    setTimeout(() => {
        SimpleLoading.hidePageLoading();
    }, 100);
});

// Make it globally available
window.SimpleLoading = SimpleLoading;