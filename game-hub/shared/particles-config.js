// Particles.js Configuration for Game Hub - Snow/Rain Effect
const particlesConfig = {
    "particles": {
        "number": {
            "value": 200,
            "density": {
                "enable": true,
                "value_area": 800
            }
        },
        "color": {
            "value": "#6366f1"
        },
        "shape": {
            "type": "circle",
            "stroke": {
                "width": 0,
                "color": "#000000"
            }
        },
        "opacity": {
            "value": 0.6,
            "random": true,
            "anim": {
                "enable": true,
                "speed": 1,
                "opacity_min": 0.2,
                "sync": false
            }
        },
        "size": {
            "value": 4,
            "random": true,
            "anim": {
                "enable": true,
                "speed": 2,
                "size_min": 1,
                "sync": false
            }
        },
        "line_linked": {
            "enable": false
        },
        "move": {
            "enable": true,
            "speed": 3,
            "direction": "bottom",
            "random": true,
            "straight": false,
            "out_mode": "out",
            "bounce": false,
            "attract": {
                "enable": false,
                "rotateX": 600,
                "rotateY": 1200
            }
        }
    },
    "interactivity": {
        "detect_on": "canvas",
        "events": {
            "onhover": {
                "enable": true,
                "mode": "bubble"
            },
            "onclick": {
                "enable": true,
                "mode": "repulse"
            },
            "resize": true
        },
        "modes": {
            "bubble": {
                "distance": 100,
                "size": 6,
                "duration": 2,
                "opacity": 0.8
            },
            "repulse": {
                "distance": 150,
                "duration": 0.4
            }
        }
    },
    "retina_detect": true
};

// Get theme-aware particle color
function getParticleColor() {
    const theme = document.body.classList.contains('theme-anime') ? 'anime' :
                  document.body.classList.contains('theme-cartoon') ? 'cartoon' : 'dark';
    
    const colors = {
        dark: '#6366f1',
        anime: '#ff006e',
        cartoon: '#ff5722'
    };
    
    return colors[theme];
}

// Update particles color based on theme
function updateParticlesColor() {
    const color = getParticleColor();
    if (window.pJSDom && window.pJSDom[0]) {
        window.pJSDom[0].pJS.particles.color.value = color;
        window.pJSDom[0].pJS.particles.line_linked.color = color;
        window.pJSDom[0].fn.particlesRefresh();
    }
}

// Initialize particles.js
function initParticles() {
    if (typeof particlesJS !== 'undefined') {
        // Update config with current theme color
        particlesConfig.particles.color.value = getParticleColor();
        particlesConfig.particles.line_linked.color = getParticleColor();
        
        particlesJS('particles-js', particlesConfig);
        
        // Listen for theme changes
        document.addEventListener('themeChanged', updateParticlesColor);
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initParticles);
} else {
    initParticles();
}