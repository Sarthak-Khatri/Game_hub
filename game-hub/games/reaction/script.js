class ReactionGame {
    constructor() {
        // Game states: 'waiting', 'ready', 'go', 'result'
        this.state = 'waiting';
        this.startTime = 0;
        this.bestTime = this.loadFromStorage('reactionBestTime');
        this.gameTimeout = null;
        this.history = this.loadFromStorage('reactionHistory', []);
        this.consecutiveGoodAttempts = 0;
        this.particlesInitialized = false;
        
        this.init();
    }

    init() {
        this.updateStats();
        this.setupEvents();
        this.updateHint();
        this.initParticles();
    }

    loadFromStorage(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            if (value === null) return defaultValue;
            return key === 'reactionHistory' ? JSON.parse(value) : value;
        } catch (e) {
            console.error('Error loading from storage:', e);
            return defaultValue;
        }
    }

    saveToStorage(key, value) {
        try {
            const saveValue = typeof value === 'object' ? JSON.stringify(value) : value;
            localStorage.setItem(key, saveValue);
        } catch (e) {
            console.error('Error saving to storage:', e);
        }
    }

    setupEvents() {
        const circle = document.getElementById('reaction-circle');
        
        // Click event
        circle.addEventListener('click', () => this.handleClick());
        
        // Keyboard support
        circle.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault();
                this.handleClick();
            }
        });
        
        // Global keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault();
                this.handleClick();
            }
        });

        // Reset button
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.reset();
        });

        // Focus management
        circle.addEventListener('focus', () => {
            circle.style.outline = '3px solid var(--primary)';
            circle.style.outlineOffset = '4px';
        });

        circle.addEventListener('blur', () => {
            circle.style.outline = 'none';
        });
    }

    handleClick() {
        switch(this.state) {
            case 'waiting':
                this.startTest();
                break;
            case 'ready':
                this.tooEarly();
                break;
            case 'go':
                this.measureReaction();
                break;
            case 'result':
                this.resetToWaiting();
                break;
        }
    }

    startTest() {
        this.state = 'ready';
        const circle = document.getElementById('reaction-circle');
        const text = document.getElementById('reaction-text');
        const subtext = document.getElementById('reaction-subtext');
        
        circle.className = 'reaction-circle ready';
        text.textContent = 'Wait for Green...';
        subtext.textContent = 'Stay focused!';
        this.updateHint('Get ready...');
        
        // Random delay between 2-6 seconds
        const delay = 2000 + Math.random() * 4000;
        this.gameTimeout = setTimeout(() => {
            if (this.state === 'ready') {
                this.showGreen();
            }
        }, delay);
    }

    showGreen() {
        this.state = 'go';
        this.startTime = performance.now();
        
        const circle = document.getElementById('reaction-circle');
        const text = document.getElementById('reaction-text');
        const subtext = document.getElementById('reaction-subtext');
        
        circle.className = 'reaction-circle go';
        text.textContent = 'CLICK NOW!';
        subtext.textContent = 'Go go go!';
        this.updateHint('Click as fast as you can!');
    }

    measureReaction() {
        const reactionTime = Math.round(performance.now() - this.startTime);
        
        // Add to history
        this.history.push(reactionTime);
        if (this.history.length > 20) {
            this.history.shift();
        }
        
        // Check if new record
        const isNewRecord = !this.bestTime || reactionTime < this.bestTime;
        if (isNewRecord) {
            this.bestTime = reactionTime;
            this.saveToStorage('reactionBestTime', this.bestTime);
        }
        
        // Track consecutive good attempts
        if (reactionTime < 400) {
            this.consecutiveGoodAttempts++;
        } else {
            this.consecutiveGoodAttempts = 0;
        }
        
        this.saveToStorage('reactionHistory', this.history);
        this.showResult(reactionTime, isNewRecord);
    }

    tooEarly() {
        this.state = 'result';
        clearTimeout(this.gameTimeout);
        
        const circle = document.getElementById('reaction-circle');
        const text = document.getElementById('reaction-text');
        const subtext = document.getElementById('reaction-subtext');
        
        circle.className = 'reaction-circle too-early';
        text.textContent = 'Too Early!';
        subtext.textContent = 'Wait for green';
        this.updateHint('Be patient!');
        
        this.consecutiveGoodAttempts = 0;
        
        setTimeout(() => {
            if (this.state === 'result') {
                this.resetToWaiting();
            }
        }, 2000);
    }

    showResult(time, isNewRecord) {
        this.state = 'result';
        const circle = document.getElementById('reaction-circle');
        const text = document.getElementById('reaction-text');
        const subtext = document.getElementById('reaction-subtext');
        
        const performance = this.getPerformance(time);
        
        circle.className = `reaction-circle ${performance.class}`;
        text.textContent = `${time}ms`;
        
        let subtextContent = performance.message;
        if (isNewRecord) {
            subtextContent = '🏆 New Record!';
            // Trigger party popper celebration!
            this.celebrateNewRecord();
        } else if (this.consecutiveGoodAttempts >= 3) {
            subtextContent = '🔥 On Fire!';
        }
        subtext.textContent = subtextContent;
        
        this.updateStats();
        this.updateHint(this.getEncouragement(time, isNewRecord));
        
        setTimeout(() => {
            if (this.state === 'result') {
                this.resetToWaiting();
            }
        }, 3000);
    }

    getPerformance(time) {
        if (time < 200) {
            return { message: '⚡ Lightning!', class: 'result-excellent' };
        } else if (time < 300) {
            return { message: '🚀 Very Fast!', class: 'result-great' };
        } else if (time < 400) {
            return { message: '👍 Good!', class: 'result-good' };
        } else if (time < 500) {
            return { message: '😐 Average', class: 'result-average' };
        } else {
            return { message: '🐌 Keep Trying!', class: 'result-slow' };
        }
    }

    getEncouragement(time, isNewRecord) {
        if (isNewRecord) {
            return 'Amazing! New personal best!';
        }
        if (time < 200) {
            return 'Incredible reflexes!';
        } else if (time < 300) {
            return 'Great job! Very fast!';
        } else if (time < 400) {
            return 'Nice work! Keep it up!';
        } else if (time < 500) {
            return 'Not bad! Try again!';
        } else {
            return 'Keep practicing!';
        }
    }

    resetToWaiting() {
        this.state = 'waiting';
        const circle = document.getElementById('reaction-circle');
        const text = document.getElementById('reaction-text');
        const subtext = document.getElementById('reaction-subtext');
        
        circle.className = 'reaction-circle waiting';
        text.textContent = 'Click to Start';
        subtext.textContent = '';
        this.updateHint('Press Space or Click');
        
        if (this.gameTimeout) {
            clearTimeout(this.gameTimeout);
            this.gameTimeout = null;
        }
    }

    updateStats() {
        // Update best time
        const bestTimeEl = document.getElementById('best-time');
        if (this.bestTime) {
            bestTimeEl.textContent = this.bestTime + 'ms';
            bestTimeEl.style.animation = 'none';
            setTimeout(() => {
                bestTimeEl.style.animation = 'pulse-icon 1s ease-in-out';
            }, 10);
        } else {
            bestTimeEl.textContent = '-';
        }
        
        // Update attempts
        document.getElementById('attempts').textContent = this.history.length;
        
        // Update average time
        const avgTimeEl = document.getElementById('avg-time');
        if (this.history.length > 0) {
            const avgTime = Math.round(
                this.history.reduce((sum, time) => sum + time, 0) / this.history.length
            );
            avgTimeEl.textContent = avgTime + 'ms';
        } else {
            avgTimeEl.textContent = '-';
        }
    }

    updateHint(text) {
        const hint = document.getElementById('reaction-hint');
        if (hint) {
            hint.textContent = text;
        }
    }

    reset() {
        const hasData = this.bestTime || this.history.length > 0;
        
        if (!hasData) {
            this.showNotification('No data to reset!');
            return;
        }
        
        if (confirm('Are you sure you want to reset all your stats and records? This cannot be undone.')) {
            this.bestTime = null;
            this.history = [];
            this.consecutiveGoodAttempts = 0;
            
            localStorage.removeItem('reactionBestTime');
            localStorage.removeItem('reactionHistory');
            
            this.updateStats();
            this.resetToWaiting();
            this.showNotification('Stats reset successfully!');
        }
    }

    showNotification(message) {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.85);
            color: white;
            padding: 12px 24px;
            border-radius: 50px;
            font-weight: 600;
            z-index: 10000;
            animation: slideDown 0.3s ease-out;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }

    initParticles() {
        if (typeof particlesJS === 'undefined') {
            console.warn('Particles.js not loaded');
            return;
        }

        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 150,
                    density: {
                        enable: false
                    }
                },
                color: {
                    value: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE']
                },
                shape: {
                    type: ['circle', 'triangle', 'edge'],
                    stroke: {
                        width: 0,
                        color: '#000000'
                    }
                },
                opacity: {
                    value: 1,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 3,
                        opacity_min: 0,
                        sync: false
                    }
                },
                size: {
                    value: 8,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 4,
                        size_min: 0.1,
                        sync: false
                    }
                },
                line_linked: {
                    enable: false
                },
                move: {
                    enable: true,
                    speed: 8,
                    direction: 'bottom',
                    random: true,
                    straight: false,
                    out_mode: 'out',
                    bounce: false,
                    attract: {
                        enable: false
                    }
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: {
                        enable: false
                    },
                    onclick: {
                        enable: false
                    },
                    resize: true
                }
            },
            retina_detect: true
        });

        this.particlesInitialized = true;
    }

    celebrateNewRecord() {
        const particlesContainer = document.getElementById('particles-js');
        
        if (!particlesContainer || !this.particlesInitialized) {
            console.warn('Particles not ready for celebration');
            return;
        }

        // Show particles
        particlesContainer.classList.add('active');

        // Refresh particles to restart animation
        if (window.pJSDom && window.pJSDom.length > 0) {
            window.pJSDom[0].pJS.particles.array = [];
            window.pJSDom[0].pJS.fn.particlesCreate();
        }

        // Hide particles after 3 seconds
        setTimeout(() => {
            particlesContainer.classList.remove('active');
        }, 3000);
    }
}

// Add notification animations to document
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
    }
`;
document.head.appendChild(style);

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ReactionGame();
});