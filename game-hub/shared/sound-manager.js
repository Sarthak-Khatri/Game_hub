// Sound Manager for Game Hub
class SoundManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.3;
        this.loadSounds();
        this.init();
    }
    
    loadSounds() {
        // Define sound effects (using Web Audio API to generate sounds)
        this.sounds = {
            hover: this.createHoverSound(),
            click: this.createClickSound(),
            success: this.createSuccessSound(),
            error: this.createErrorSound(),
            navigation: this.createNavigationSound()
        };
    }
    
    init() {
        // Load settings from localStorage
        const settings = JSON.parse(localStorage.getItem('gameHubSettings') || '{}');
        this.enabled = settings.sfx !== false;
        this.volume = settings.volume || 0.3;
        
        // Add event listeners to all interactive elements
        this.addSoundEvents();
    }
    
    createHoverSound() {
        // Create a subtle hover sound using Web Audio API
        return () => {
            if (!this.enabled) return;
            
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.1, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
            
            oscillator.type = 'sine';
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        };
    }
    
    createClickSound() {
        // Create a click sound
        return () => {
            if (!this.enabled) return;
            
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.2, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
            
            oscillator.type = 'square';
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        };
    }
    
    createSuccessSound() {
        // Create a success sound
        return () => {
            if (!this.enabled) return;
            
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5
            oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // E5
            oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2); // G5
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
            
            oscillator.type = 'triangle';
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        };
    }
    
    createErrorSound() {
        // Create an error sound
        return () => {
            if (!this.enabled) return;
            
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.2, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
            
            oscillator.type = 'sawtooth';
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        };
    }
    
    createNavigationSound() {
        // Create a navigation sound
        return () => {
            if (!this.enabled) return;
            
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            oscillator.frequency.linearRampToValueAtTime(900, audioContext.currentTime + 0.15);
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.15, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
            
            oscillator.type = 'sine';
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.15);
        };
    }
    
    addSoundEvents() {
        // Add hover sounds to interactive elements
        const hoverElements = document.querySelectorAll(`
            .btn, .menu-option, .game-card, .card, .control-btn, 
            .start-button, .play-button, .back-button, .achievement-card,
            .keyboard-letter, .toggle-switch, select, input[type="range"]
        `);
        
        hoverElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                this.play('hover');
            });
        });
        
        // Add click sounds to clickable elements
        const clickElements = document.querySelectorAll(`
            .btn, .menu-option, .game-card, .control-btn, 
            .start-button, .play-button, .back-button,
            .keyboard-letter, .toggle-switch, button
        `);
        
        clickElements.forEach(element => {
            element.addEventListener('click', () => {
                this.play('click');
            });
        });
        
        // Add navigation sounds to navigation elements
        const navElements = document.querySelectorAll(`
            .menu-option, .back-button, .start-button
        `);
        
        navElements.forEach(element => {
            element.addEventListener('click', () => {
                setTimeout(() => this.play('navigation'), 100);
            });
        });
    }
    
    play(soundName) {
        if (this.sounds[soundName] && this.enabled) {
            try {
                this.sounds[soundName]();
            } catch (error) {
                console.warn('Sound playback failed:', error);
            }
        }
    }
    
    setEnabled(enabled) {
        this.enabled = enabled;
        this.saveSettings();
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
    }
    
    saveSettings() {
        const settings = JSON.parse(localStorage.getItem('gameHubSettings') || '{}');
        settings.sfx = this.enabled;
        settings.volume = this.volume;
        localStorage.setItem('gameHubSettings', JSON.stringify(settings));
    }
    
    // Refresh event listeners (call after dynamic content is added)
    refresh() {
        this.addSoundEvents();
    }
}

// Initialize sound manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure all elements are loaded
    setTimeout(() => {
        window.soundManager = new SoundManager();
    }, 100);
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SoundManager;
}