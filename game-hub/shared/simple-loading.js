// Enhanced Simple Loading Utility with Spinning Controller
// Optimized for performance and smooth animations

class SimpleLoading {
    static show(text = 'Loading...', duration = 600) {
        // Remove existing loading if any
        SimpleLoading.hide();
        
        const loading = document.createElement('div');
        loading.className = 'simple-loading';
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
}

// Make it globally available
window.SimpleLoading = SimpleLoading;