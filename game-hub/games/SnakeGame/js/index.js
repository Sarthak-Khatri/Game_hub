// Game Constants & Variables
let inputDir = {x: 0, y: 0}; 
let nextDir = {x: 0, y: 0}; // Buffer for next direction to prevent reverse

// Audio Setup with Error Handling
let foodSound, gameOverSound, moveSound, musicSound;
let soundEnabled = true;

function initAudio() {
    try {
        foodSound = new Audio('music/food.mp3');
        gameOverSound = new Audio('music/gameover.mp3');
        moveSound = new Audio('music/move.mp3');
        musicSound = new Audio('music/music.mp3');
        
        // Set volumes
        foodSound.volume = 0.4;
        gameOverSound.volume = 0.5;
        moveSound.volume = 0.2;
        musicSound.volume = 0.15;
        musicSound.loop = true;
        
        return true;
    } catch (e) {
        console.log('Audio initialization failed:', e);
        return false;
    }
}

// Game state variables
let gameState = 'playing'; // 'playing', 'paused', 'gameOver'
let speeds = [7, 11, 17, 28]; // Different speed levels (frames per second)
let currentSpeedIndex = 1; // Start with normal speed
let speed = speeds[currentSpeedIndex];
let speedNames = ['Easy', 'Normal', 'Hard', 'Insane'];

let score = 0;
let lastPaintTime = 0;
let snakeArr = [{x: 9, y: 9}];
let food = {x: 6, y: 7};

// UI Elements
const board = document.getElementById('board');
const scoreBox = document.getElementById('scoreBox');
const hiscoreBox = document.getElementById('hiscoreBox');
const pauseBtn = document.getElementById('pauseBtn');
const speedBtn = document.getElementById('speedBtn');
const soundBtn = document.getElementById('soundBtn');
const pauseScreen = document.getElementById('pauseScreen');
const gameOverModal = document.getElementById('gameOverModal');
const restartBtn = document.getElementById('restartBtn');
const finalScore = document.getElementById('finalScore');
const highScoreMessage = document.getElementById('highScoreMessage');

// Initialize Audio
const audioInitialized = initAudio();

// Initialize high score
let hiscoreval = 0;
const hiscore = localStorage.getItem("snakeHighScore");
if(hiscore !== null){
    hiscoreval = JSON.parse(hiscore);
    hiscoreBox.textContent = hiscoreval;
}

// Game Loop
function main(ctime) {
    window.requestAnimationFrame(main);
    
    if (gameState !== 'playing') {
        return;
    }
    
    if((ctime - lastPaintTime)/1000 < 1/speed){
        return;
    }
    lastPaintTime = ctime;
    gameEngine();
}

// Collision Detection
function isCollide(snake) {
    // Check if snake hits itself
    for (let i = 1; i < snake.length; i++) {
        if(snake[i].x === snake[0].x && snake[i].y === snake[0].y){
            return true;
        }
    }
    
    // Check if snake hits the wall
    if(snake[0].x >= 18 || snake[0].x <= 0 || snake[0].y >= 18 || snake[0].y <= 0){
        return true;
    }
    
    return false;
}

// Main Game Engine
function gameEngine(){
    // Update direction from buffer to prevent instant reverse
    if (nextDir.x !== 0 || nextDir.y !== 0) {
        // Prevent snake from reversing into itself
        if (snakeArr.length === 1 || !(inputDir.x === -nextDir.x && inputDir.y === -nextDir.y)) {
            inputDir = {...nextDir};
        }
        nextDir = {x: 0, y: 0};
    }

    // Check collision
    if(isCollide(snakeArr)){
        gameOver();
        return;
    }

    // Check if food is eaten
    if(snakeArr[0].y === food.y && snakeArr[0].x === food.x){
        playSound(foodSound);
        
        score += 1;
        
        // Update high score
        if(score > hiscoreval){
            hiscoreval = score;
            localStorage.setItem("snakeHighScore", JSON.stringify(hiscoreval));
            hiscoreBox.textContent = hiscoreval;
        }
        scoreBox.textContent = score;
        
        // Grow snake
        snakeArr.unshift({x: snakeArr[0].x + inputDir.x, y: snakeArr[0].y + inputDir.y});
        
        // Generate new food position
        generateFood();
    }

    // Move the snake
    for (let i = snakeArr.length - 2; i >= 0; i--) { 
        snakeArr[i+1] = {...snakeArr[i]};
    }

    snakeArr[0].x += inputDir.x;
    snakeArr[0].y += inputDir.y;

    // Render the game
    renderGame();
}

// Generate Food Position
function generateFood() {
    let validPosition = false;
    let newFood;
    let attempts = 0;
    const maxAttempts = 100;
    
    while (!validPosition && attempts < maxAttempts) {
        attempts++;
        let a = 2;
        let b = 16;
        newFood = {
            x: Math.round(a + (b-a) * Math.random()), 
            y: Math.round(a + (b-a) * Math.random())
        };
        
        // Check if food position conflicts with snake
        validPosition = !snakeArr.some(segment => 
            segment.x === newFood.x && segment.y === newFood.y
        );
    }
    
    // Fallback if no valid position found after max attempts
    if (!validPosition) {
        // Find any empty position on the board
        for (let x = 2; x <= 16; x++) {
            for (let y = 2; y <= 16; y++) {
                const isEmpty = !snakeArr.some(segment => segment.x === x && segment.y === y);
                if (isEmpty) {
                    newFood = {x, y};
                    validPosition = true;
                    break;
                }
            }
            if (validPosition) break;
        }
    }
    
    food = newFood || {x: 8, y: 8}; // Ultimate fallback
}

// Render Game
function renderGame() {
    // Clear board but keep pause screen element
    const pauseElement = document.getElementById('pauseScreen');
    board.innerHTML = "";
    
    // Re-add pause screen
    board.appendChild(pauseElement);
    
    // Update pause screen visibility
    if (gameState === 'paused') {
        pauseScreen.style.display = 'flex';
    } else {
        pauseScreen.style.display = 'none';
    }
    
    // Display the snake
    snakeArr.forEach((segment, index) => {
        const snakeElement = document.createElement('div');
        snakeElement.style.gridRowStart = segment.y;
        snakeElement.style.gridColumnStart = segment.x;

        if(index === 0){
            snakeElement.classList.add('head');
            
            // Add direction-based rotation for head
            const rotation = getHeadRotation();
            snakeElement.style.transform = `scale(1.15) rotate(${rotation}deg)`;
            
            // Add nostrils
            const nostril1 = document.createElement('span');
            nostril1.className = 'nostril';
            nostril1.style.left = '33%';
            snakeElement.appendChild(nostril1);
            
            const nostril2 = document.createElement('span');
            nostril2.className = 'nostril';
            nostril2.style.left = '57%';
            snakeElement.appendChild(nostril2);
        } else {
            snakeElement.classList.add('snake');
        }
        board.appendChild(snakeElement);
    });
    
    // Display the food
    const foodElement = document.createElement('div');
    foodElement.style.gridRowStart = food.y;
    foodElement.style.gridColumnStart = food.x;
    foodElement.classList.add('food');
    board.appendChild(foodElement);
}

// Get Head Rotation based on direction
function getHeadRotation() {
    if (inputDir.x === 1) return 90;  // Right
    if (inputDir.x === -1) return 270; // Left
    if (inputDir.y === 1) return 180;  // Down
    if (inputDir.y === -1) return 0;   // Up
    return 0;
}

// Confetti Particle System
function createConfetti() {
    const colors = ['#00ff88', '#00ffaa', '#ffdd00', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731', '#ff85a2', '#a8e6cf'];
    const confettiCount = 200;
    const confettiContainer = document.createElement('div');
    confettiContainer.id = 'confetti-container';
    confettiContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
        overflow: hidden;
    `;
    document.body.appendChild(confettiContainer);
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        const size = Math.random() * 12 + 4;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100;
        const animationDuration = Math.random() * 3 + 2;
        const delay = Math.random() * 0.8;
        const rotation = Math.random() * 360;
        const xMovement = (Math.random() - 0.5) * 200;
        
        confetti.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background-color: ${color};
            left: ${left}%;
            top: -10%;
            opacity: 1;
            transform: rotate(${rotation}deg);
            border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
            box-shadow: 0 0 10px ${color};
        `;
        
        // Create animation
        const keyframes = `
            @keyframes confettiFall${i} {
                0% {
                    top: -10%;
                    opacity: 1;
                    transform: translateX(0) rotate(${rotation}deg);
                }
                100% {
                    top: 110%;
                    opacity: 0;
                    transform: translateX(${xMovement}px) rotate(${rotation + 720}deg);
                }
            }
        `;
        
        const style = document.createElement('style');
        style.textContent = keyframes;
        document.head.appendChild(style);
        
        confetti.style.animation = `confettiFall${i} ${animationDuration}s linear ${delay}s forwards`;
        
        confettiContainer.appendChild(confetti);
    }
    
    // Remove confetti after animation
    setTimeout(() => {
        if (confettiContainer && confettiContainer.parentNode) {
            confettiContainer.parentNode.removeChild(confettiContainer);
        }
    }, 6000);
}

// Game Over
function gameOver() {
    gameState = 'gameOver';
    
    stopMusic();
    playSound(gameOverSound);
    
    // Check if new high score
    const isNewHighScore = score > hiscoreval && score > 0;
    
    // Show game over modal
    finalScore.textContent = score;
    if (isNewHighScore) {
        highScoreMessage.innerHTML = "🏆 NEW HIGH SCORE! 🏆";
        highScoreMessage.style.color = "#00ff88";
        highScoreMessage.style.background = "rgba(0, 255, 136, 0.15)";
        highScoreMessage.style.border = "2px solid #00ff88";
        // Trigger confetti animation
        setTimeout(() => createConfetti(), 300);
    } else {
        highScoreMessage.innerHTML = `High Score: ${hiscoreval}`;
        highScoreMessage.style.color = "#ffffff";
        highScoreMessage.style.background = "rgba(255, 255, 255, 0.05)";
        highScoreMessage.style.border = "2px solid rgba(255, 255, 255, 0.2)";
    }
    
    gameOverModal.style.display = 'flex';
}

// Start Game
function startGame() {
    gameState = 'playing';
    inputDir = {x: 0, y: 0};
    nextDir = {x: 0, y: 0};
    snakeArr = [{x: 9, y: 9}];
    score = 0;
    scoreBox.textContent = '0';
    generateFood();
    gameOverModal.style.display = 'none';
    
    playMusic();
    renderGame();
}

// Restart Game
function restartGame() {
    startGame();
}

// Toggle Pause
function togglePause() {
    if (gameState === 'playing') {
        gameState = 'paused';
        pauseBtn.innerHTML = '<span class="icon">▶</span> Resume';
        pauseScreen.style.display = 'flex';
        stopMusic();
    } else if (gameState === 'paused') {
        gameState = 'playing';
        pauseBtn.innerHTML = '<span class="icon">⏸</span> Pause';
        pauseScreen.style.display = 'none';
        playMusic();
    }
}

// Change Speed
function changeSpeed() {
    currentSpeedIndex = (currentSpeedIndex + 1) % speeds.length;
    speed = speeds[currentSpeedIndex];
    speedBtn.innerHTML = `<span class="icon">⚡</span> ${speedNames[currentSpeedIndex]}`;
}

// Toggle Sound
function toggleSound() {
    soundEnabled = !soundEnabled;
    soundBtn.innerHTML = soundEnabled ? '<span class="icon">🔊</span>' : '<span class="icon">🔇</span>';
    
    if (!soundEnabled) {
        stopMusic();
    } else if (gameState === 'playing') {
        playMusic();
    }
}

// Sound Helper Functions
function playSound(sound) {
    if (!soundEnabled || !audioInitialized || !sound) return;
    try {
        sound.currentTime = 0;
        sound.play().catch(e => {});
    } catch (e) {}
}

function playMusic() {
    if (!soundEnabled || !audioInitialized || !musicSound) return;
    try {
        musicSound.currentTime = 0;
        musicSound.play().catch(e => {
            console.log('Music autoplay prevented');
        });
    } catch (e) {}
}

function stopMusic() {
    if (!audioInitialized || !musicSound) return;
    try {
        musicSound.pause();
    } catch (e) {}
}

// Event Listeners
pauseBtn.addEventListener('click', togglePause);
speedBtn.addEventListener('click', changeSpeed);
soundBtn.addEventListener('click', toggleSound);
restartBtn.addEventListener('click', restartGame);

// Keyboard controls
window.addEventListener('keydown', e => {
    
    if (gameState === 'gameOver') return;
    
    // Handle pause/resume
    if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        if (gameState === 'playing' || gameState === 'paused') {
            togglePause();
        }
        return;
    }
    
    // Handle restart/game over
    if (e.key === 'Escape') {
        e.preventDefault();
        if (gameState === 'playing' || gameState === 'paused') {
            gameOver();
        }
        return;
    }
    
    if (gameState !== 'playing') return;
    
    // Play move sound
    playSound(moveSound);
    
    // Buffer the next direction to prevent rapid key presses causing issues
    switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
            e.preventDefault();
            if (inputDir.y === 0) { // Only change if not moving vertically
                nextDir = {x: 0, y: -1};
            }
            break;
        case "ArrowDown":
        case "s":
        case "S":
            e.preventDefault();
            if (inputDir.y === 0) {
                nextDir = {x: 0, y: 1};
            }
            break;
        case "ArrowLeft":
        case "a":
        case "A":
            e.preventDefault();
            if (inputDir.x === 0) { // Only change if not moving horizontally
                nextDir = {x: -1, y: 0};
            }
            break;
        case "ArrowRight":
        case "d":
        case "D":
            e.preventDefault();
            if (inputDir.x === 0) {
                nextDir = {x: 1, y: 0};
            }
            break;
    }
});

// Touch controls for mobile
let touchStartX = 0;
let touchStartY = 0;

board.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

board.addEventListener('touchend', e => {
    if (gameState !== 'playing') return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    // Minimum swipe distance
    const minSwipe = 30;
    
    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipe && inputDir.x === 0) {
            if (deltaX > 0) {
                nextDir = {x: 1, y: 0}; // Right
            } else {
                nextDir = {x: -1, y: 0}; // Left
            }
            playSound(moveSound);
        }
    } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipe && inputDir.y === 0) {
            if (deltaY > 0) {
                nextDir = {x: 0, y: 1}; // Down
            } else {
                nextDir = {x: 0, y: -1}; // Up
            }
            playSound(moveSound);
        }
    }
}, { passive: true });

// Prevent default touch behavior on game board
board.addEventListener('touchmove', e => {
    e.preventDefault();
}, { passive: false });

// Initialize game
generateFood();
renderGame();

// Initialize speed display
speedBtn.innerHTML = `<span class="icon">⚡</span> ${speedNames[currentSpeedIndex]}`;

// Auto-start the game
playMusic();

// Start game loop
window.requestAnimationFrame(main);

// Log game ready
console.log('🐍 Snake Mania Enhanced Edition loaded!');
console.log('Features: 3D Snake Model, Touch Controls, Sound Effects, Confetti Particles');
console.log('Controls: Arrow Keys or WASD | SPACE to pause | ESC to restart');
console.log('Game started automatically!');