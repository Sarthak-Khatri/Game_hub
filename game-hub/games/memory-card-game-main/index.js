const gridContainer = document.querySelector(".grid-container");
let cards = [];
let firstCard, secondCard;
let lockBoard = false;
let score = 0;
let matches = 0;
let totalPairs = 0;
let timer = 0;
let timerInterval;
let currentDifficulty = 'easy';
let gameStarted = false;
let confettiAnimationId = null;

// Difficulty configurations
const difficultyConfig = {
  easy: { pairs: 6, gridClass: 'grid-easy' },
  medium: { pairs: 8, gridClass: 'grid-medium' },
  hard: { pairs: 12, gridClass: 'grid-hard' }
};

// Confetti Particle System
class Confetti {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e'];
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticle() {
    return {
      x: Math.random() * this.canvas.width,
      y: -10,
      size: Math.random() * 8 + 4,
      speedY: Math.random() * 3 + 2,
      speedX: Math.random() * 2 - 1,
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 10 - 5,
      opacity: 1
    };
  }

  start() {
    // Create initial burst of particles
    for (let i = 0; i < 150; i++) {
      this.particles.push(this.createParticle());
    }
    this.animate();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Add new particles occasionally
    if (Math.random() < 0.1 && this.particles.length < 200) {
      this.particles.push(this.createParticle());
    }

    this.particles.forEach((particle, index) => {
      particle.y += particle.speedY;
      particle.x += particle.speedX;
      particle.rotation += particle.rotationSpeed;
      particle.speedY += 0.1; // Gravity

      // Fade out as it falls
      if (particle.y > this.canvas.height * 0.7) {
        particle.opacity -= 0.02;
      }

      // Remove if off screen or fully transparent
      if (particle.y > this.canvas.height || particle.opacity <= 0) {
        this.particles.splice(index, 1);
        return;
      }

      // Draw particle
      this.ctx.save();
      this.ctx.translate(particle.x, particle.y);
      this.ctx.rotate((particle.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = particle.opacity;
      this.ctx.fillStyle = particle.color;
      
      // Draw as rectangle for confetti effect
      this.ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 1.5);
      
      this.ctx.restore();
    });

    confettiAnimationId = requestAnimationFrame(() => this.animate());
  }

  stop() {
    if (confettiAnimationId) {
      cancelAnimationFrame(confettiAnimationId);
      confettiAnimationId = null;
    }
    this.particles = [];
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

let confettiSystem = null;

// Initialize game
document.addEventListener('DOMContentLoaded', function() {
  updateScore();
  updateTimer();
  updateMatches();
  setupDifficultyButtons();
  loadGame();
  
  // Initialize confetti system
  const canvas = document.getElementById('confetti-canvas');
  if (canvas) {
    confettiSystem = new Confetti(canvas);
  }
});

function setupDifficultyButtons() {
  const difficultyButtons = document.querySelectorAll('.difficulty-btn');
  difficultyButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      // Remove active class from all buttons
      difficultyButtons.forEach(b => b.classList.remove('active'));
      // Add active class to clicked button
      this.classList.add('active');
      // Set difficulty
      currentDifficulty = this.dataset.level;
      // Restart game with new difficulty
      restart();
    });
  });
}

function loadGame() {
  fetch("./data/cards.json")
    .then((res) => {
      if (!res.ok) {
        throw new Error('Failed to load cards');
      }
      return res.json();
    })
    .then((data) => {
      const config = difficultyConfig[currentDifficulty];
      totalPairs = config.pairs;
      
      // Select cards based on difficulty
      const selectedCards = data.slice(0, totalPairs);
      cards = [...selectedCards, ...selectedCards];
      
      shuffleCards();
      generateCards();
      setupGrid();
    })
    .catch(error => {
      console.error('Error loading cards:', error);
      // Show error message to user
      gridContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: white;">
          <h3>⚠️ Error Loading Game</h3>
          <p>Unable to load card data. Please refresh the page.</p>
        </div>
      `;
    });
}

function setupGrid() {
  const config = difficultyConfig[currentDifficulty];
  gridContainer.className = `grid-container ${config.gridClass}`;
}

function shuffleCards() {
  let currentIndex = cards.length;
  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    const temporaryValue = cards[currentIndex];
    cards[currentIndex] = cards[randomIndex];
    cards[randomIndex] = temporaryValue;
  }
}

function generateCards() {
  gridContainer.innerHTML = "";
  for (let card of cards) {
    const cardElement = document.createElement("div");
    cardElement.classList.add("card");
    cardElement.setAttribute("data-name", card.name);
    
    cardElement.innerHTML = `
      <div class="front">
        <img class="front-image" src="${card.image}" alt="${card.name}" />
      </div>
      <div class="back">
        <div class="back-icon">?</div>
      </div>
    `;
    gridContainer.appendChild(cardElement);
    cardElement.addEventListener("click", flipCard);
  }
}

function flipCard() {
  if (lockBoard) return;
  if (this === firstCard) return;
  if (this.classList.contains('matched')) return;

  // Start timer on first card flip
  if (!gameStarted) {
    startTimer();
    gameStarted = true;
  }

  this.classList.add("flipped");

  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;
  score++;
  updateScore();
  lockBoard = true;

  checkForMatch();
}

function checkForMatch() {
  let isMatch = firstCard.dataset.name === secondCard.dataset.name;
  isMatch ? disableCards() : unflipCards();
}

function disableCards() {
  // Add success animation
  firstCard.classList.add('match-success');
  secondCard.classList.add('match-success');
  
  setTimeout(() => {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    firstCard.removeEventListener("click", flipCard);
    secondCard.removeEventListener("click", flipCard);
    
    matches++;
    updateMatches();
    
    resetBoard();
    
    // Check if game is complete
    if (matches === totalPairs) {
      setTimeout(() => {
        gameComplete();
      }, 500);
    }
  }, 600);
}

function unflipCards() {
  setTimeout(() => {
    firstCard.classList.add('shake');
    secondCard.classList.add('shake');
    
    setTimeout(() => {
      firstCard.classList.remove("flipped", "shake");
      secondCard.classList.remove("flipped", "shake");
      resetBoard();
    }, 300);
  }, 800);
}

function resetBoard() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

function startTimer() {
  timerInterval = setInterval(() => {
    timer++;
    updateTimer();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function updateScore() {
  const scoreElement = document.querySelector(".score");
  scoreElement.textContent = score;
  scoreElement.classList.add('pulse');
  setTimeout(() => scoreElement.classList.remove('pulse'), 300);
}

function updateTimer() {
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  document.querySelector(".timer").textContent = 
    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateMatches() {
  const matchesElement = document.querySelector(".matches");
  matchesElement.textContent = `${matches}/${totalPairs}`;
  if (matches > 0) {
    matchesElement.classList.add('pulse');
    setTimeout(() => matchesElement.classList.remove('pulse'), 300);
  }
}

function gameComplete() {
  stopTimer();
  
  // Save best time for current difficulty
  const currentTime = timer;
  const timeKey = `memoryBestTime_${totalPairs}`;
  const savedTime = localStorage.getItem(timeKey);
  
  if (!savedTime || currentTime < parseInt(savedTime)) {
    localStorage.setItem(timeKey, currentTime.toString());
  }
  
  // Update modal with final stats
  document.getElementById('finalScore').textContent = score;
  document.getElementById('finalTime').textContent = document.querySelector('.timer').textContent;
  document.getElementById('finalDifficulty').textContent = 
    currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1);
  
  // Show modal with animation
  const modal = document.getElementById('gameOverModal');
  modal.style.display = 'flex';
  
  // Start confetti animation
  if (confettiSystem) {
    confettiSystem.start();
  }
  
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
}

function closeModal() {
  // Stop confetti animation
  if (confettiSystem) {
    confettiSystem.stop();
  }
  
  const modal = document.getElementById('gameOverModal');
  modal.classList.remove('show');
  setTimeout(() => {
    modal.style.display = 'none';
    restart();
  }, 300);
}

function restart() {
  resetBoard();
  stopTimer();
  
  // Reset game state
  score = 0;
  matches = 0;
  timer = 0;
  gameStarted = false;
  
  // Update displays
  updateScore();
  updateTimer();
  updateMatches();
  
  // Fade out cards
  document.querySelectorAll('.card').forEach((card, index) => {
    setTimeout(() => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
    }, index * 20);
  });
  
  // Reload game after animation
  setTimeout(() => {
    loadGame();
  }, 600);
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
  if (e.key === 'r' || e.key === 'R') {
    restart();
  } else if (e.key === 'Escape') {
    const modal = document.getElementById('gameOverModal');
    if (modal.style.display === 'flex') {
      closeModal();
    }
  }
});