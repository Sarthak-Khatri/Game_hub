// Game State Variables
let userScore = 0;
let compScore = 0;
let currentRound = 1;
let roundHistory = [];
let gameStats = {
    wins: 0,
    losses: 0,
    ties: 0,
    totalRounds: 0
};
let gameInProgress = true;

// Image URLs for choices
const images = {
    rock: 'images/rock.png',
    paper: 'images/paper.png',
    scissors: 'images/scissors.png'
};

// ========================================
// INITIALIZATION FUNCTIONS
// ========================================

/**
 * Create floating particles in the background
 */
function createParticles() {
    const particles = document.getElementById('particles');
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
        particles.appendChild(particle);
    }
}

/**
 * Load saved statistics from localStorage
 */
function loadStats() {
    const saved = localStorage.getItem('rpsStats');
    if (saved) {
        try {
            gameStats = JSON.parse(saved);
            updateStatsDisplay();
        } catch (e) {
            console.error('Error loading stats:', e);
            gameStats = { wins: 0, losses: 0, ties: 0, totalRounds: 0 };
        }
    }
}

/**
 * Save current statistics to localStorage
 */
function saveStats() {
    localStorage.setItem('rpsStats', JSON.stringify(gameStats));
}

// ========================================
// DISPLAY UPDATE FUNCTIONS
// ========================================

/**
 * Update the statistics display on screen
 */
function updateStatsDisplay() {
    document.getElementById('matches-won').textContent = gameStats.wins;
    document.getElementById('matches-lost').textContent = gameStats.losses;
    document.getElementById('total-rounds').textContent = gameStats.totalRounds;
}

/**
 * Update the round display with current round number and dots
 */
function updateRoundDisplay() {
    document.getElementById('round-text').textContent = `Round ${currentRound}`;
    
    const dots = document.querySelectorAll('.round-dot');
    dots.forEach((dot, index) => {
        dot.className = 'round-dot';
        if (roundHistory[index]) {
            dot.classList.add(roundHistory[index]);
        }
    });
}

/**
 * Update the message display with text and styling
 * @param {string} text - The message to display
 * @param {string} type - The type of message (win, lose, draw)
 */
function updateMessage(text, type) {
    const message = document.getElementById('message');
    message.textContent = text;
    message.className = 'message ' + type;
}

/**
 * Update score with animation
 * @param {HTMLElement} element - The score element to update
 * @param {number} value - The new score value
 */
function updateScore(element, value) {
    element.textContent = value;
    element.classList.add('score-up');
    setTimeout(() => {
        element.classList.remove('score-up');
    }, 500);
}

// ========================================
// GAME LOGIC FUNCTIONS
// ========================================

/**
 * Generate a random computer choice
 * @returns {string} - 'rock', 'paper', or 'scissors'
 */
function genCompChoice() {
    const options = ["rock", "paper", "scissors"];
    return options[Math.floor(Math.random() * 3)];
}

/**
 * Determine the winner of a round
 * @param {string} userChoice - User's choice
 * @param {string} compChoice - Computer's choice
 * @returns {string} - 'user', 'comp', or 'draw'
 */
function determineWinner(userChoice, compChoice) {
    if (userChoice === compChoice) {
        return 'draw';
    }
    
    if (
        (userChoice === "rock" && compChoice === "scissors") ||
        (userChoice === "paper" && compChoice === "rock") ||
        (userChoice === "scissors" && compChoice === "paper")
    ) {
        return 'user';
    }
    
    return 'comp';
}

/**
 * Enable or disable the choice buttons
 * @param {boolean} enabled - Whether to enable or disable choices
 */
function setChoicesEnabled(enabled) {
    const choices = document.querySelectorAll('.choice');
    choices.forEach(choice => {
        if (enabled) {
            choice.classList.remove('disabled');
        } else {
            choice.classList.add('disabled');
        }
    });
}

// ========================================
// ANIMATION FUNCTIONS
// ========================================

/**
 * Create confetti particles for celebration (party popper style)
 */
function createConfetti() {
    const colors = ['#FF6B9D', '#A78BFA', '#60A5FA', '#34D399', '#FBBF24', '#F472B6', '#FB923C', '#EC4899', '#8B5CF6'];
    const shapes = ['circle', 'square', 'triangle'];
    const overlay = document.getElementById('victory-overlay');
    
    // Create multiple bursts from different positions
    const burstPositions = [
        { x: 20, y: 30 },
        { x: 80, y: 30 },
        { x: 50, y: 20 },
        { x: 35, y: 40 },
        { x: 65, y: 40 }
    ];
    
    burstPositions.forEach((pos, index) => {
        setTimeout(() => {
            for (let i = 0; i < 30; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                
                const shape = shapes[Math.floor(Math.random() * shapes.length)];
                const size = Math.random() * 12 + 6;
                const color = colors[Math.floor(Math.random() * colors.length)];
                
                confetti.style.left = pos.x + '%';
                confetti.style.top = pos.y + '%';
                confetti.style.width = size + 'px';
                confetti.style.height = size + 'px';
                confetti.style.background = color;
                
                // Random direction and distance
                const angle = (Math.random() * 360) * (Math.PI / 180);
                const velocity = Math.random() * 300 + 200;
                const tx = Math.cos(angle) * velocity;
                const ty = Math.sin(angle) * velocity;
                const rotation = Math.random() * 720 - 360;
                
                confetti.style.setProperty('--tx', tx + 'px');
                confetti.style.setProperty('--ty', ty + 'px');
                confetti.style.setProperty('--rotation', rotation + 'deg');
                
                // Shape variations
                if (shape === 'circle') {
                    confetti.style.borderRadius = '50%';
                } else if (shape === 'triangle') {
                    confetti.style.width = '0';
                    confetti.style.height = '0';
                    confetti.style.background = 'transparent';
                    confetti.style.borderLeft = size/2 + 'px solid transparent';
                    confetti.style.borderRight = size/2 + 'px solid transparent';
                    confetti.style.borderBottom = size + 'px solid ' + color;
                }
                
                confetti.style.animationDelay = Math.random() * 0.1 + 's';
                confetti.style.animationDuration = (Math.random() * 1 + 2) + 's';
                
                overlay.appendChild(confetti);
                
                setTimeout(() => confetti.remove(), 4000);
            }
        }, index * 100);
    });
}

/**
 * Show the battle animation overlay
 * @param {string} userChoice - User's choice
 * @param {string} compChoice - Computer's choice
 */
function showBattleAnimation(userChoice, compChoice) {
    const overlay = document.getElementById('battle-overlay');
    const battleChoices = document.getElementById('battle-choices');
    
    battleChoices.innerHTML = `
        <div style="position: relative; text-align: center;">
            <div class="battle-choice">
                <img src="${images[userChoice]}" alt="${userChoice}">
            </div>
            <div class="battle-label">YOU</div>
        </div>
        <div style="position: relative; text-align: center;">
            <div class="battle-choice">
                <img src="${images[compChoice]}" alt="${compChoice}">
            </div>
            <div class="battle-label">COMPUTER</div>
        </div>
    `;
    
    overlay.classList.add('active');
    
    setTimeout(() => {
        overlay.classList.remove('active');
    }, 2000);
}

/**
 * Show the victory screen
 * @param {string} winner - 'user' or 'comp'
 */
function showVictoryScreen(winner) {
    const overlay = document.getElementById('victory-overlay');
    const title = document.getElementById('victory-title');
    const subtitle = document.getElementById('victory-subtitle');
    
    overlay.classList.add('active');
    
    if (winner === 'user') {
        title.textContent = '🎉 YOU WIN! 🎉';
        title.style.color = '#22c55e';
        subtitle.textContent = `You won the match with ${userScore} rounds!`;
        // Delay confetti slightly for overlay to appear
        setTimeout(() => createConfetti(), 300);
    } else {
        title.textContent = '💔 YOU LOSE! 💔';
        title.style.color = '#ef4444';
        subtitle.textContent = `Computer won the match with ${compScore} rounds!`;
    }
}

// ========================================
// GAME CONTROL FUNCTIONS
// ========================================

/**
 * Start a new match, resetting all round data
 */
function startNewMatch() {
    userScore = 0;
    compScore = 0;
    currentRound = 1;
    roundHistory = [];
    gameInProgress = true;
    
    document.getElementById('user-score').textContent = '0';
    document.getElementById('comp-score').textContent = '0';
    updateRoundDisplay();
    updateMessage('Choose your weapon! ⚔️', '');
    
    const victoryOverlay = document.getElementById('victory-overlay');
    victoryOverlay.classList.remove('active');
    
    setChoicesEnabled(true);
}

/**
 * Play a round of the game
 * @param {string} userChoice - The user's choice ('rock', 'paper', or 'scissors')
 */
function playGame(userChoice) {
    if (!gameInProgress) return;
    
    setChoicesEnabled(false);
    const compChoice = genCompChoice();
    
    // Add selected animation to clicked choice
    const selectedChoice = document.querySelector(`[data-choice="${userChoice}"]`);
    selectedChoice.classList.add('selected');
    setTimeout(() => selectedChoice.classList.remove('selected'), 600);
    
    showBattleAnimation(userChoice, compChoice);

    setTimeout(() => {
        gameStats.totalRounds++;
        
        const winner = determineWinner(userChoice, compChoice);
        
        if (winner === 'draw') {
            // Draw
            roundHistory.push('draw');
            updateMessage(`🤝 Round ${currentRound}: Draw! You both chose ${userChoice}!`, 'draw');
        } else if (winner === 'user') {
            // User wins
            userScore++;
            roundHistory.push('win');
            updateScore(document.getElementById('user-score'), userScore);
            updateMessage(`🎉 Round ${currentRound}: You Win! ${userChoice} beats ${compChoice}!`, 'win');
            
            if (userScore === 3) {
                gameStats.wins++;
                gameInProgress = false;
                setTimeout(() => {
                    showVictoryScreen('user');
                }, 2000);
            }
        } else {
            // Computer wins
            compScore++;
            roundHistory.push('lose');
            updateScore(document.getElementById('comp-score'), compScore);
            updateMessage(`💔 Round ${currentRound}: You Lose! ${compChoice} beats ${userChoice}!`, 'lose');
            
            if (compScore === 3) {
                gameStats.losses++;
                gameInProgress = false;
                setTimeout(() => {
                    showVictoryScreen('comp');
                }, 2000);
            }
        }

        updateRoundDisplay();
        updateStatsDisplay();
        saveStats();
        
        if (gameInProgress) {
            currentRound++;
            setTimeout(() => {
                setChoicesEnabled(true);
            }, 1500);
        }
    }, 2000);
}

// ========================================
// EVENT LISTENERS
// ========================================

/**
 * Add click event listeners to all choice buttons
 */
function initializeChoiceListeners() {
    document.querySelectorAll('.choice').forEach(choice => {
        choice.addEventListener('click', () => {
            const userChoice = choice.getAttribute('data-choice');
            playGame(userChoice);
        });
    });
}

/**
 * Initialize new match button
 */
function initializeNewMatchButton() {
    document.getElementById('new-match').addEventListener('click', () => {
        startNewMatch();
    });
}

/**
 * Initialize reset stats button
 */
function initializeResetButton() {
    document.getElementById('reset').addEventListener('click', () => {
        if (confirm('🤔 Are you sure you want to reset all statistics?')) {
            gameStats = { wins: 0, losses: 0, ties: 0, totalRounds: 0 };
            updateStatsDisplay();
            saveStats();
            startNewMatch();
        }
    });
}

// ========================================
// INITIALIZATION ON PAGE LOAD
// ========================================

/**
 * Initialize the game when the page loads
 */
function init() {
    createParticles();
    loadStats();
    initializeChoiceListeners();
    initializeNewMatchButton();
    initializeResetButton();
}

// Start the game when DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}