// Background Music Manager for Game Hub
class MusicManager {
    constructor() {
        this.audio = null;
        this.enabled = false;
        this.volume = 0.3;
        this.currentTrack = null;
        this.tracks = {
            menu: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_2c4d748e05.mp3', // Ambient menu music
            gameplay: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3' // Upbeat gameplay music
        };
        this.init();
    }
    
    init() {
        // Load settings from localStorage
        const settings = JSON.parse(localStorage.getItem('gameHubSettings') || '{}');
        this.enabled = settings.music === true;
        this.volume = settings.musicVolume || 0.3;
        
        // Create audio element
        this.audio = new Audio();
        this.audio.loop = true;
        this.audio.volume = this.volume;
        
        // Add event listeners
        this.audio.addEventListener('ended', () => {
            if (this.enabled) {
                this.audio.play().catch(e => console.log('Music autoplay prevented'));
            }
        });
        
        // Auto-play menu music if enabled
        if (this.enabled) {
            this.play('menu');
        }
    }
    
    play(trackName = 'menu') {
        if (!this.enabled || !this.tracks[trackName]) return;
        
        // If same track is already playing, don't restart
        if (this.currentTrack === trackName && !this.audio.paused) {
            return;
        }
        
        this.currentTrack = trackName;
        this.audio.src = this.tracks[trackName];
        this.audio.volume = this.volume;
        
        // Play with user interaction handling
        const playPromise = this.audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log('Music autoplay prevented. Will play on user interaction.');
                // Add one-time click listener to start music
                document.addEventListener('click', () => {
                    if (this.enabled) {
                        this.audio.play().catch(e => console.log('Music play failed'));
                    }
                }, { once: true });
            });
        }
    }
    
    pause() {
        if (this.audio) {
            this.audio.pause();
        }
    }
    
    resume() {
        if (this.audio && this.enabled) {
            this.audio.play().catch(e => console.log('Music resume failed'));
        }
    }
    
    stop() {
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
        }
    }
    
    setEnabled(enabled) {
        this.enabled = enabled;
        if (enabled) {
            this.play(this.currentTrack || 'menu');
        } else {
            this.pause();
        }
        this.saveSettings();
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.audio) {
            this.audio.volume = this.volume;
        }
        this.saveSettings();
    }
    
    fadeOut(duration = 1000) {
        if (!this.audio) return;
        
        const startVolume = this.audio.volume;
        const fadeStep = startVolume / (duration / 50);
        
        const fadeInterval = setInterval(() => {
            if (this.audio.volume > fadeStep) {
                this.audio.volume -= fadeStep;
            } else {
                this.audio.volume = 0;
                this.pause();
                clearInterval(fadeInterval);
            }
        }, 50);
    }
    
    fadeIn(duration = 1000) {
        if (!this.audio || !this.enabled) return;
        
        this.audio.volume = 0;
        this.resume();
        
        const targetVolume = this.volume;
        const fadeStep = targetVolume / (duration / 50);
        
        const fadeInterval = setInterval(() => {
            if (this.audio.volume < targetVolume - fadeStep) {
                this.audio.volume += fadeStep;
            } else {
                this.audio.volume = targetVolume;
                clearInterval(fadeInterval);
            }
        }, 50);
    }
    
    saveSettings() {
        const settings = JSON.parse(localStorage.getItem('gameHubSettings') || '{}');
        settings.music = this.enabled;
        settings.musicVolume = this.volume;
        localStorage.setItem('gameHubSettings', JSON.stringify(settings));
    }
}

// Initialize music manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.musicManager = new MusicManager();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MusicManager;
}