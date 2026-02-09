// Theme Management System for Game Hub

class ThemeManager {
    constructor() {
        // Check both locations for theme setting (for backward compatibility)
        this.currentTheme = this.getSavedTheme() || 'dark';
        this.init();
    }
    
    getSavedTheme() {
        // First check the dedicated theme storage
        let theme = localStorage.getItem('gameHubTheme');
        
        // If not found, check the settings object
        if (!theme) {
            try {
                const settings = JSON.parse(localStorage.getItem('gameHubSettings') || '{}');
                theme = settings.theme;
            } catch (e) {
                // Ignore parsing errors
            }
        }
        
        return theme;
    }
    
    init() {
        // Apply saved theme on load
        this.applyTheme(this.currentTheme);
    }
    
    switchTheme(themeName) {
        if (!['dark', 'anime', 'cartoon'].includes(themeName)) {
            console.warn('Invalid theme:', themeName);
            return;
        }
        
        this.currentTheme = themeName;
        this.applyTheme(themeName);
        this.saveTheme(themeName);
        
        // Trigger theme change event
        document.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: themeName }
        }));
    }
    
    applyTheme(themeName) {
        // Remove all theme classes
        document.body.classList.remove('theme-dark', 'theme-anime', 'theme-cartoon');
        
        // Add current theme class
        document.body.classList.add(`theme-${themeName}`);
        
        // Update background video based on theme
        this.updateBackgroundVideo(themeName);
        
        // Update theme buttons if they exist
        this.updateThemeButtons(themeName);
    }
    
    updateBackgroundVideo(themeName) {
        const videoElement = document.querySelector('.video-background');
        if (!videoElement) return;
        
        // Define background videos for each theme
        const backgroundVideos = {
            'dark': '../assets/videos/bg2.mp4',     // Dark theme uses bg2.mp4
            'anime': '../assets/videos/bgimg.mp4',  // Anime/neon theme uses bgimg.mp4  
            'cartoon': '../assets/videos/bg.mp4'    // Cartoon/toon theme uses bg.mp4
        };
        
        // Get the appropriate video for the theme
        let videoSrc = backgroundVideos[themeName] || backgroundVideos['dark'];
        
        // Adjust path based on current page location
        const currentPath = window.location.pathname;
        if (currentPath.includes('/games/') && !videoSrc.startsWith('../')) {
            // For game pages, need to go up two levels
            videoSrc = '../../' + videoSrc;
        } else if (currentPath.includes('/game-hub/') && videoSrc.startsWith('../')) {
            // For hub pages, remove the ../ prefix
            videoSrc = videoSrc.replace('../', '');
        } else if (!currentPath.includes('/game-hub/') && !videoSrc.startsWith('../')) {
            // For root level pages, add game-hub/ prefix
            videoSrc = 'game-hub/' + videoSrc;
        }
        
        // Update video source with smooth transition
        const sourceElement = videoElement.querySelector('source');
        const currentSrc = sourceElement?.src || '';
        
        // Only update if the source is different
        if (!currentSrc.endsWith(videoSrc)) {
            console.log(`Switching background video from ${currentSrc} to ${videoSrc} for theme: ${themeName}`);
            
            // Fade out current video
            videoElement.style.opacity = '0.3';
            
            // Change source after brief delay
            setTimeout(() => {
                if (sourceElement) {
                    sourceElement.src = videoSrc;
                    videoElement.load(); // Reload video with new source
                    
                    // Fade back in when new video is ready
                    const handleLoadedData = () => {
                        videoElement.style.opacity = '1';
                        videoElement.removeEventListener('loadeddata', handleLoadedData);
                    };
                    
                    videoElement.addEventListener('loadeddata', handleLoadedData);
                    
                    // Fallback: fade back in after 1 second even if video doesn't load
                    setTimeout(() => {
                        videoElement.style.opacity = '1';
                    }, 1000);
                }
            }, 200);
        }
    }
    
    updateThemeButtons(themeName) {
        const themeButtons = document.querySelectorAll('[data-theme]');
        themeButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.theme === themeName) {
                btn.classList.add('active');
            }
        });
    }
    
    saveTheme(themeName) {
        // Save to dedicated theme storage
        localStorage.setItem('gameHubTheme', themeName);
        
        // Also update the settings object if it exists
        try {
            const settings = JSON.parse(localStorage.getItem('gameHubSettings') || '{}');
            settings.theme = themeName;
            localStorage.setItem('gameHubSettings', JSON.stringify(settings));
        } catch (e) {
            // If settings object doesn't exist or is corrupted, create a new one
            const settings = { theme: themeName };
            localStorage.setItem('gameHubSettings', JSON.stringify(settings));
        }
    }
    
    getCurrentTheme() {
        return this.currentTheme;
    }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
    
    // Add event listeners to theme buttons
    document.querySelectorAll('[data-theme]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const theme = e.target.dataset.theme;
            window.themeManager.switchTheme(theme);
        });
    });
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}