// Game state
let score = 0;
let timeLeft = 60;
let highScore = localStorage.getItem('whackHighScore') || 0;
let streak = 0;
let bestStreak = 0;
let molesWhacked = 0;
let isPlaying = false;
let gameTimer = null;
let moleTimer = null;
let currentMole = null;
let difficulty = 'medium';

// Difficulty settings
const difficultySettings = {
    easy: { minTime: 1000, maxTime: 2000, showTime: 1500, points: 10 },
    medium: { minTime: 700, maxTime: 1500, showTime: 1200, points: 15 },
    hard: { minTime: 500, maxTime: 1000, showTime: 900, points: 20 },
    insane: { minTime: 300, maxTime: 700, showTime: 600, points: 30 }
};

// Audio
const smashSound = new Audio('assets/smash.mp3');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    updateDisplay();
    setupCustomCursor();
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('resetBtn').addEventListener('click', resetStats);
    document.getElementById('playAgainBtn').addEventListener('click', () => {
        hideModal();
        startGame();
    });
    document.getElementById('difficulty').addEventListener('change', (e) => {
        difficulty = e.target.value;
    });

    // Hole click handlers
    const holes = document.querySelectorAll('.hole');
    holes.forEach((hole, index) => {
        hole.addEventListener('click', () => whackMole(index));
        // Add touch support for mobile
        hole.addEventListener('touchstart', (e) => {
            e.preventDefault();
            whackMole(index);
        });
    });
}

// Custom cursor
function setupCustomCursor() {
    const cursor = document.querySelector('.cursor');
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    document.addEventListener('mousedown', () => {
        cursor.classList.add('active');
    });

    document.addEventListener('mouseup', () => {
        cursor.classList.remove('active');
    });
}

// Start game
function startGame() {
    if (isPlaying) return;
    
    isPlaying = true;
    score = 0;
    timeLeft = 60;
    streak = 0;
    bestStreak = 0;
    molesWhacked = 0;
    
    updateDisplay();
    document.getElementById('startBtn').textContent = 'Playing...';
    document.getElementById('startBtn').disabled = true;
    
    gameTimer = setInterval(() => {
        timeLeft--;
        updateDisplay();
        
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
    
    popUpMole();
}

// Pop up mole
function popUpMole() {
    if (!isPlaying) return;
    
    const settings = difficultySettings[difficulty];
    const holes = document.querySelectorAll('.hole');
    
    // Remove previous mole
    if (currentMole !== null) {
        const prevHole = holes[currentMole];
        const prevMoleImg = prevHole.querySelector('.mole');
        if (prevMoleImg) {
            prevMoleImg.remove();
        }
    }
    
    // Random hole
    const randomHole = Math.floor(Math.random() * holes.length);
    currentMole = randomHole;
    
    // Create mole
    const mole = document.createElement('img');
    mole.src = 'assets/mole.png';
    mole.classList.add('mole');
    mole.dataset.whacked = 'false';
    holes[randomHole].appendChild(mole);
    
    // Auto hide mole
    const hideTime = settings.showTime;
    setTimeout(() => {
        if (mole.dataset.whacked === 'false' && isPlaying) {
            mole.remove();
            streak = 0;
            updateDisplay();
            
            // Next mole
            const nextTime = Math.random() * (settings.maxTime - settings.minTime) + settings.minTime;
            moleTimer = setTimeout(popUpMole, nextTime);
        }
    }, hideTime);
}

// Whack mole
function whackMole(index) {
    if (!isPlaying) return;
    
    const hole = document.querySelectorAll('.hole')[index];
    const mole = hole.querySelector('.mole');
    
    if (mole && mole.dataset.whacked === 'false') {
        mole.dataset.whacked = 'true';
        
        // Change to whacked image
        mole.src = 'assets/mole-whacked.png';
        mole.classList.add('whacked');
        
        // Play sound
        playSound();
        
        // Update score
        const settings = difficultySettings[difficulty];
        const points = settings.points + (streak * 5);
        score += points;
        streak++;
        molesWhacked++;
        
        if (streak > bestStreak) {
            bestStreak = streak;
        }
        
        updateDisplay();
        showScorePopup(hole, `+${points}`);
        
        // Remove mole
        setTimeout(() => {
            mole.remove();
            
            // Next mole
            const nextTime = Math.random() * (settings.maxTime - settings.minTime) + settings.minTime;
            moleTimer = setTimeout(popUpMole, nextTime);
        }, 300);
    }
}

// Play sound
function playSound() {
    try {
        smashSound.currentTime = 0;
        smashSound.play().catch(e => console.log('Audio play failed:', e));
    } catch (e) {
        console.log('Audio error:', e);
    }
}

// Show score popup
function showScorePopup(hole, text) {
    const popup = document.createElement('div');
    popup.classList.add('score-popup');
    popup.textContent = text;
    
    const rect = hole.getBoundingClientRect();
    popup.style.left = rect.left + rect.width / 2 + 'px';
    popup.style.top = rect.top + 'px';
    
    document.body.appendChild(popup);
    
    setTimeout(() => {
        popup.remove();
    }, 1000);
}

// End game
function endGame() {
    isPlaying = false;
    clearInterval(gameTimer);
    clearTimeout(moleTimer);
    
    // Remove any remaining moles
    document.querySelectorAll('.mole').forEach(mole => mole.remove());
    currentMole = null;
    
    // Check for new high score
    const isNewHighScore = score > highScore;
    
    // Update high score
    if (isNewHighScore) {
        highScore = score;
        localStorage.setItem('whackHighScore', highScore);
    }
    
    // Show modal
    document.getElementById('finalScore').textContent = score;
    document.getElementById('modalHighScore').textContent = highScore;
    document.getElementById('molesWhacked').textContent = molesWhacked;
    document.getElementById('bestStreak').textContent = bestStreak;
    
    const modal = document.getElementById('gameOverModal');
    const message = document.getElementById('modalMessage');
    
    if (isNewHighScore && score > 0) {
        message.textContent = '🏆 NEW HIGH SCORE! You\'re a Champion!';
        message.style.color = '#ffd700';
        message.style.fontSize = '1.5rem';
    } else if (score >= 500) {
        message.textContent = '🎉 Amazing! You\'re a Whack-a-Mole Master!';
        message.style.color = '';
        message.style.fontSize = '';
    } else if (score >= 300) {
        message.textContent = '🌟 Great job! Keep it up!';
        message.style.color = '';
        message.style.fontSize = '';
    } else if (score >= 150) {
        message.textContent = '👍 Not bad! Try again for a higher score!';
        message.style.color = '';
        message.style.fontSize = '';
    } else {
        message.textContent = '💪 Keep practicing! You\'ll get better!';
        message.style.color = '';
        message.style.fontSize = '';
    }
    
    modal.classList.add('show');
    
    // Reset button
    document.getElementById('startBtn').textContent = 'Start Game';
    document.getElementById('startBtn').disabled = false;
}

// Hide modal
function hideModal() {
    document.getElementById('gameOverModal').classList.remove('show');
}

// Update display
function updateDisplay() {
    document.getElementById('currentScore').textContent = score;
    document.getElementById('timeLeft').textContent = timeLeft;
    document.getElementById('highScore').textContent = highScore;
    document.getElementById('streak').textContent = streak;
}

// Reset stats
function resetStats() {
    if (confirm('Are you sure you want to reset your high score?')) {
        highScore = 0;
        localStorage.removeItem('whackHighScore');
        updateDisplay();
    }
}
