// Game State
const X_CLASS = 'x';
const O_CLASS = 'o';
let currentClass = X_CLASS;
let gameActive = false;
let difficulty = 'medium';

// Game Stats
let stats = {
    player: 0,
    ai: 0,
    draws: 0
};

// Winning Combinations
const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Line positions for winning animation
const LINE_POSITIONS = {
    '0,1,2': { width: '80%', height: '6px', top: '16.66%', left: '50%', rotate: '0deg' },
    '3,4,5': { width: '80%', height: '6px', top: '50%', left: '50%', rotate: '0deg' },
    '6,7,8': { width: '80%', height: '6px', top: '83.33%', left: '50%', rotate: '0deg' },
    '0,3,6': { width: '6px', height: '80%', top: '50%', left: '16.66%', rotate: '0deg' },
    '1,4,7': { width: '6px', height: '80%', top: '50%', left: '50%', rotate: '0deg' },
    '2,5,8': { width: '6px', height: '80%', top: '50%', left: '83.33%', rotate: '0deg' },
    '0,4,8': { width: '113%', height: '6px', top: '50%', left: '50%', rotate: '45deg' },
    '2,4,6': { width: '113%', height: '6px', top: '50%', left: '50%', rotate: '-45deg' }
};

// DOM Elements
const board = document.getElementById('board');
const cellElements = document.querySelectorAll('[data-cell]');
const statusText = document.getElementById('statusText');
const aiThinking = document.getElementById('aiThinking');
const restartBtn = document.getElementById('restartBtn');
const resetStatsBtn = document.getElementById('resetStatsBtn');
const difficultyBtns = document.querySelectorAll('.diff-btn');
const playerWinsEl = document.getElementById('playerWins');
const aiWinsEl = document.getElementById('aiWins');
const drawsEl = document.getElementById('draws');
const celebration = document.getElementById('celebration');
const winningLine = document.getElementById('winningLine');

// Audio
const audioTurn = new Audio('ting.mp3');
const audioWin = new Audio('gameover.mp3');

// Initialize
loadStats();
updateScoreDisplay();
startGame();

// Event Listeners
restartBtn.addEventListener('click', startGame);
resetStatsBtn.addEventListener('click', resetStats);

difficultyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        difficultyBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        difficulty = btn.dataset.difficulty;
        startGame();
    });
});

// Start Game
function startGame() {
    gameActive = true;
    currentClass = X_CLASS;
    
    cellElements.forEach(cell => {
        cell.classList.remove(X_CLASS);
        cell.classList.remove(O_CLASS);
        cell.removeEventListener('click', handleClick);
        cell.addEventListener('click', handleClick, { once: true });
    });
    
    winningLine.classList.remove('show');
    celebration.classList.remove('show');
    statusText.textContent = 'YOUR MOVE';
    aiThinking.classList.remove('active');
}

// Handle Click
function handleClick(e) {
    if (!gameActive || currentClass === O_CLASS) return;
    
    const cell = e.target;
    placeMark(cell, currentClass);
    playSound(audioTurn);
    
    if (checkWin(currentClass)) {
        endGame(false);
    } else if (isDraw()) {
        endGame(true);
    } else {
        swapTurns();
        aiMove();
    }
}

// Place Mark
function placeMark(cell, currentClass) {
    cell.classList.add(currentClass);
}

// Swap Turns
function swapTurns() {
    currentClass = currentClass === X_CLASS ? O_CLASS : X_CLASS;
}

// AI Move
function aiMove() {
    if (!gameActive) return;
    
    gameActive = false;
    statusText.style.display = 'none';
    aiThinking.classList.add('active');
    
    setTimeout(() => {
        const emptyCells = [...cellElements].filter(cell => 
            !cell.classList.contains(X_CLASS) && !cell.classList.contains(O_CLASS)
        );
        
        if (emptyCells.length === 0) return;
        
        let selectedCell;
        
        if (difficulty === 'easy') {
            selectedCell = getRandomMove(emptyCells);
        } else if (difficulty === 'medium') {
            selectedCell = Math.random() < 0.6 ? getBestMove() : getRandomMove(emptyCells);
        } else {
            selectedCell = getBestMove();
        }
        
        placeMark(selectedCell, O_CLASS);
        playSound(audioTurn);
        
        aiThinking.classList.remove('active');
        statusText.style.display = 'block';
        gameActive = true;
        
        if (checkWin(O_CLASS)) {
            endGame(false);
        } else if (isDraw()) {
            endGame(true);
        } else {
            swapTurns();
            statusText.textContent = 'YOUR MOVE';
        }
    }, 800);
}

// Get Random Move
function getRandomMove(cells) {
    return cells[Math.floor(Math.random() * cells.length)];
}

// Get Best Move using Minimax
function getBestMove() {
    let bestScore = -Infinity;
    let bestCell;
    
    cellElements.forEach((cell, index) => {
        if (!cell.classList.contains(X_CLASS) && !cell.classList.contains(O_CLASS)) {
            cell.classList.add(O_CLASS);
            let score = minimax(false);
            cell.classList.remove(O_CLASS);
            
            if (score > bestScore) {
                bestScore = score;
                bestCell = cell;
            }
        }
    });
    
    return bestCell;
}

// Minimax Algorithm
function minimax(isMaximizing) {
    if (checkWin(O_CLASS)) return 10;
    if (checkWin(X_CLASS)) return -10;
    if (isDraw()) return 0;
    
    if (isMaximizing) {
        let bestScore = -Infinity;
        cellElements.forEach(cell => {
            if (!cell.classList.contains(X_CLASS) && !cell.classList.contains(O_CLASS)) {
                cell.classList.add(O_CLASS);
                let score = minimax(false);
                cell.classList.remove(O_CLASS);
                bestScore = Math.max(score, bestScore);
            }
        });
        return bestScore;
    } else {
        let bestScore = Infinity;
        cellElements.forEach(cell => {
            if (!cell.classList.contains(X_CLASS) && !cell.classList.contains(O_CLASS)) {
                cell.classList.add(X_CLASS);
                let score = minimax(true);
                cell.classList.remove(X_CLASS);
                bestScore = Math.min(score, bestScore);
            }
        });
        return bestScore;
    }
}

// Check Win
function checkWin(currentClass) {
    return WINNING_COMBINATIONS.some(combination => {
        return combination.every(index => {
            return cellElements[index].classList.contains(currentClass);
        });
    });
}

// Get Winning Combination
function getWinningCombination(currentClass) {
    return WINNING_COMBINATIONS.find(combination => {
        return combination.every(index => {
            return cellElements[index].classList.contains(currentClass);
        });
    });
}

// Is Draw
function isDraw() {
    return [...cellElements].every(cell => {
        return cell.classList.contains(X_CLASS) || cell.classList.contains(O_CLASS);
    });
}

// End Game
function endGame(draw) {
    gameActive = false;
    
    if (draw) {
        statusText.textContent = 'DRAW!';
        stats.draws++;
        updateScore('draws');
    } else {
        const winner = currentClass;
        const winCombo = getWinningCombination(winner);
        
        if (winner === X_CLASS) {
            statusText.textContent = 'PLAYER WINS!';
            stats.player++;
            updateScore('player');
            showCelebration();
            playSound(audioWin);
        } else {
            statusText.textContent = 'AI WINS!';
            stats.ai++;
            updateScore('ai');
            playSound(audioWin);
        }
        
        if (winCombo) {
            drawWinningLine(winCombo);
        }
    }
    
    saveStats();
    updateScoreDisplay();
}

// Draw Winning Line
function drawWinningLine(combination) {
    const key = combination.join(',');
    const position = LINE_POSITIONS[key];
    
    if (position) {
        winningLine.style.width = position.width;
        winningLine.style.height = position.height;
        winningLine.style.top = position.top;
        winningLine.style.left = position.left;
        winningLine.style.transform = `translate(-50%, -50%) rotate(${position.rotate})`;
        
        setTimeout(() => {
            winningLine.classList.add('show');
        }, 100);
    }
}

// Show Celebration
function showCelebration() {
    celebration.classList.add('show');
    setTimeout(() => {
        celebration.classList.remove('show');
    }, 3000);
}

// Update Score Display
function updateScoreDisplay() {
    playerWinsEl.textContent = stats.player;
    aiWinsEl.textContent = stats.ai;
    drawsEl.textContent = stats.draws;
}

// Update Score with Animation
function updateScore(type) {
    let element;
    if (type === 'player') element = playerWinsEl;
    else if (type === 'ai') element = aiWinsEl;
    else element = drawsEl;
    
    element.classList.add('score-update');
    setTimeout(() => element.classList.remove('score-update'), 500);
}

// Save Stats
function saveStats() {
    localStorage.setItem('tictactoeNeonStats', JSON.stringify(stats));
}

// Load Stats
function loadStats() {
    const saved = localStorage.getItem('tictactoeNeonStats');
    if (saved) {
        try {
            stats = JSON.parse(saved);
        } catch (e) {
            stats = { player: 0, ai: 0, draws: 0 };
        }
    }
}

// Reset Stats
function resetStats() {
    if (confirm('Reset all statistics?')) {
        stats = { player: 0, ai: 0, draws: 0 };
        saveStats();
        updateScoreDisplay();
    }
}

// Play Sound
function playSound(audio) {
    try {
        audio.currentTime = 0;
        audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (e) {
        console.log('Audio error:', e);
    }
}

// Console message
console.log('%c🎮 TIC TAC TOE - NEON EDITION 🎮', 'color: #ff006e; font-size: 20px; font-weight: bold;');
console.log('%cPlayer vs AI Mode Activated!', 'color: #00f5ff; font-size: 14px;');