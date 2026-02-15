document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const wordDisplay = document.getElementById('word-display');
  const keyboard = document.getElementById('keyboard');
  const gameMessageEl = document.getElementById('game-message');
  const resetBtn = document.getElementById('reset-btn');
  const hintBtn = document.getElementById('hint-btn');
  const hintBtnMobile = document.getElementById('hint-btn-mobile');
  const hintText = document.getElementById('hint-text');
  
  // Hangman SVG parts
  const hangmanParts = {
    head: document.getElementById('head'),
    body: document.getElementById('body'),
    leftArm: document.getElementById('left-arm'),
    rightArm: document.getElementById('right-arm'),
    leftLeg: document.getElementById('left-leg'),
    rightLeg: document.getElementById('right-leg'),
    face: document.getElementById('face')
  };
  
  // Game variables
  let selectedWord = '';
  let selectedCategory = '';
  let correctLetters = [];
  let wrongLetters = [];
  let remainingGuesses = 6;
  let gameOver = false;
  let hintUsed = false;
  
  // Game statistics with enhanced scoring
  let gameStats = {
    wins: 0,
    losses: 0,
    totalGames: 0,
    bestStreak: 0,
    currentStreak: 0,
    totalScore: 0,
    averageScore: 0,
    perfectGames: 0, // Games won without wrong guesses
    hintsUsed: 0,
    categoriesPlayed: {
      animals: 0,
      countries: 0,
      fruits: 0,
      technology: 0,
      sports: 0,
      food: 0
    },
    categoryWins: {
      animals: 0,
      countries: 0,
      fruits: 0,
      technology: 0,
      sports: 0,
      food: 0
    }
  };
  
  let currentGameScore = 0;
  
  // Load saved stats with backward compatibility
  function loadStats() {
    const saved = localStorage.getItem('hangmanStats');
    if (saved) {
      try {
        const loadedStats = JSON.parse(saved);
        // Merge with default structure to handle new properties
        gameStats = {
          wins: loadedStats.wins || 0,
          losses: loadedStats.losses || 0,
          totalGames: loadedStats.totalGames || 0,
          bestStreak: loadedStats.bestStreak || 0,
          currentStreak: loadedStats.currentStreak || 0,
          totalScore: loadedStats.totalScore || 0,
          averageScore: loadedStats.averageScore || 0,
          perfectGames: loadedStats.perfectGames || 0,
          hintsUsed: loadedStats.hintsUsed || 0,
          categoriesPlayed: loadedStats.categoriesPlayed || {
            animals: 0, countries: 0, fruits: 0, technology: 0, sports: 0, food: 0
          },
          categoryWins: loadedStats.categoryWins || {
            animals: 0, countries: 0, fruits: 0, technology: 0, sports: 0, food: 0
          }
        };
      } catch (e) {
        gameStats = {
          wins: 0, losses: 0, totalGames: 0, bestStreak: 0, currentStreak: 0,
          totalScore: 0, averageScore: 0, perfectGames: 0, hintsUsed: 0,
          categoriesPlayed: { animals: 0, countries: 0, fruits: 0, technology: 0, sports: 0, food: 0 },
          categoryWins: { animals: 0, countries: 0, fruits: 0, technology: 0, sports: 0, food: 0 }
        };
      }
    }
  }
  
  // Save stats to localStorage
  function saveStats() {
    localStorage.setItem('hangmanStats', JSON.stringify(gameStats));
  }
  
  // Calculate score based on performance
  function calculateScore() {
    let score = 0;
    const wordLength = selectedWord.length;
    const wrongGuesses = wrongLetters.length;
    
    // Base score for word length
    score += wordLength * 10;
    
    // Bonus for remaining guesses
    score += remainingGuesses * 20;
    
    // Penalty for wrong guesses
    score -= wrongGuesses * 5;
    
    // Bonus for not using hint
    if (!hintUsed) {
      score += 50;
    }
    
    // Bonus for perfect game (no wrong guesses)
    if (wrongGuesses === 0) {
      score += 100;
    }
    
    // Category difficulty multiplier
    const difficultyMultipliers = {
      animals: 1.0,
      countries: 1.2,
      fruits: 1.0,
      technology: 1.5,
      sports: 1.3,
      food: 1.1
    };
    
    score = Math.floor(score * (difficultyMultipliers[selectedCategory] || 1.0));
    
    return Math.max(score, 0); // Ensure score is never negative
  }
  
  // Initialize current game score
  function initGameScore() {
    currentGameScore = 0;
    updateScoreDisplay();
  }
  
  // Update current score display (now shown in stats bar)
  function updateScoreDisplay() {
    // Current score is now displayed in the live stats bar
    // This function kept for compatibility
  }
  
  // Update live stats display
  function updateLiveStats() {
    const winRate = gameStats.totalGames > 0 ? Math.round((gameStats.wins / gameStats.totalGames) * 100) : 0;
    
    const totalWinsEl = document.getElementById('total-wins');
    const currentStreakEl = document.getElementById('current-streak');
    const totalScoreEl = document.getElementById('total-score');
    const winRateEl = document.getElementById('win-rate');
    
    if (totalWinsEl) totalWinsEl.textContent = gameStats.wins;
    if (currentStreakEl) currentStreakEl.textContent = gameStats.currentStreak;
    if (totalScoreEl) totalScoreEl.textContent = gameStats.totalScore;
    if (winRateEl) winRateEl.textContent = `${winRate}%`;
  }
  
  // Update statistics display
  function updateStatsDisplay() {
    const statsContainer = document.getElementById('stats-display');
    if (statsContainer) {
      const winRate = gameStats.totalGames > 0 ? Math.round((gameStats.wins / gameStats.totalGames) * 100) : 0;
      
      statsContainer.innerHTML = `
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">${gameStats.totalScore}</div>
            <div class="stat-label">Total Score</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${gameStats.averageScore}</div>
            <div class="stat-label">Avg Score</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${gameStats.wins}</div>
            <div class="stat-label">Wins</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${winRate}%</div>
            <div class="stat-label">Win Rate</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${gameStats.currentStreak}</div>
            <div class="stat-label">Current Streak</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${gameStats.bestStreak}</div>
            <div class="stat-label">Best Streak</div>
          </div>
        </div>
      `;
    }
  }
  
  // Show detailed statistics modal
  function showDetailedStats() {
    const modal = document.createElement('div');
    modal.className = 'stats-modal';
    modal.innerHTML = `
      <div class="stats-modal-content">
        <div class="stats-modal-header">
          <h2>📊 Detailed Statistics</h2>
          <button class="close-modal" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
        </div>
        <div class="stats-modal-body">
          <div class="stats-section">
            <h3>🏆 Overall Performance</h3>
            <div class="stats-row">
              <span>Total Score:</span>
              <span class="stat-highlight">${gameStats.totalScore}</span>
            </div>
            <div class="stats-row">
              <span>Average Score:</span>
              <span class="stat-highlight">${gameStats.averageScore}</span>
            </div>
            <div class="stats-row">
              <span>Games Played:</span>
              <span>${gameStats.totalGames}</span>
            </div>
            <div class="stats-row">
              <span>Win Rate:</span>
              <span class="stat-highlight">${gameStats.totalGames > 0 ? Math.round((gameStats.wins / gameStats.totalGames) * 100) : 0}%</span>
            </div>
            <div class="stats-row">
              <span>Perfect Games:</span>
              <span class="stat-highlight">${gameStats.perfectGames}</span>
            </div>
            <div class="stats-row">
              <span>Hints Used:</span>
              <span>${gameStats.hintsUsed}</span>
            </div>
          </div>
          
          <div class="stats-section">
            <h3>🎯 Category Performance</h3>
            ${Object.keys(gameStats.categoriesPlayed).map(category => {
              const played = gameStats.categoriesPlayed[category];
              const wins = gameStats.categoryWins[category];
              const winRate = played > 0 ? Math.round((wins / played) * 100) : 0;
              return `
                <div class="category-stats">
                  <div class="category-name">${category.charAt(0).toUpperCase() + category.slice(1)}</div>
                  <div class="category-details">
                    <span>Played: ${played}</span>
                    <span>Won: ${wins}</span>
                    <span>Rate: ${winRate}%</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  
  // Categories and words with hints
  const wordCategories = {
    animals: {
      'ELEPHANT': 'Large mammal with a trunk and big ears',
      'GIRAFFE': 'Tallest animal in the world with a long neck',
      'KANGAROO': 'Australian marsupial that hops and has a pouch',
      'DOLPHIN': 'Intelligent marine mammal that loves to play',
      'CHEETAH': 'Fastest land animal with spotted fur',
      'PENGUIN': 'Black and white bird that cannot fly but swims well',
      'OCTOPUS': 'Sea creature with eight arms and three hearts',
      'BUTTERFLY': 'Colorful insect that starts as a caterpillar',
      'RHINOCEROS': 'Large gray animal with one or two horns on its nose',
      'HIPPOPOTAMUS': 'Large African mammal that spends time in water',
      'CROCODILE': 'Large reptile with powerful jaws and sharp teeth',
      'FLAMINGO': 'Pink bird that stands on one leg',
      'ZEBRA': 'African animal with black and white stripes',
      'LEOPARD': 'Spotted big cat that climbs trees',
      'GORILLA': 'Largest primate that beats its chest',
      'PEACOCK': 'Colorful bird with beautiful tail feathers',
      'MONGOOSE': 'Small mammal known for fighting snakes',
      'CHAMELEON': 'Lizard that changes colors to blend in',
      'PLATYPUS': 'Unusual mammal with a duck bill and beaver tail',
      'ARMADILLO': 'Mammal with a hard shell that rolls into a ball'
    },
    countries: {
      'CANADA': 'North American country famous for maple syrup',
      'BRAZIL': 'South American country known for carnival and soccer',
      'JAPAN': 'Island nation famous for sushi and technology',
      'GERMANY': 'European country known for beer and cars',
      'AUSTRALIA': 'Continent and country with unique wildlife',
      'FRANCE': 'European country famous for the Eiffel Tower',
      'EGYPT': 'African country home to ancient pyramids',
      'MEXICO': 'North American country known for tacos and sombreros',
      'ITALY': 'European country shaped like a boot, famous for pasta',
      'SPAIN': 'European country known for flamenco and bullfighting',
      'CHINA': 'Most populous country in the world with the Great Wall',
      'INDIA': 'South Asian country famous for spices and Bollywood',
      'RUSSIA': 'Largest country in the world spanning two continents',
      'NORWAY': 'Scandinavian country known for fjords and northern lights',
      'THAILAND': 'Southeast Asian country known as the Land of Smiles',
      'ARGENTINA': 'South American country famous for tango and beef',
      'MOROCCO': 'North African country known for colorful markets',
      'ICELAND': 'Nordic island country with geysers and glaciers',
      'SWITZERLAND': 'European country famous for chocolate and watches',
      'PORTUGAL': 'European country known for port wine and explorers'
    },
    fruits: {
      'BANANA': 'Yellow curved fruit that monkeys love',
      'WATERMELON': 'Large green fruit that is red and juicy inside',
      'PINEAPPLE': 'Tropical fruit with a spiky exterior and crown',
      'STRAWBERRY': 'Small red fruit with seeds on the outside',
      'BLUEBERRY': 'Tiny round fruit that is good for your brain',
      'ORANGE': 'Citrus fruit that shares its name with a color',
      'COCONUT': 'Brown hairy fruit with milk inside',
      'MANGO': 'Sweet tropical fruit that is orange inside',
      'KIWI': 'Small brown fuzzy fruit that is green inside',
      'PAPAYA': 'Large orange tropical fruit with black seeds',
      'POMEGRANATE': 'Red fruit filled with ruby-like seeds',
      'AVOCADO': 'Green fruit used to make guacamole',
      'DRAGONFRUIT': 'Exotic fruit with bright pink skin and white flesh',
      'PASSION': 'Tropical fruit with wrinkled purple skin',
      'LYCHEE': 'Small white fruit with bumpy pink shell',
      'DURIAN': 'Spiky fruit known for its strong smell',
      'RAMBUTAN': 'Hairy red fruit similar to lychee',
      'JACKFRUIT': 'Largest tree fruit with sweet yellow flesh',
      'PERSIMMON': 'Orange fruit that looks like a tomato',
      'STARFRUIT': 'Yellow fruit shaped like a five-pointed star'
    },
    technology: {
      'COMPUTER': 'Electronic device used for processing data',
      'SMARTPHONE': 'Portable device that combines phone and computer',
      'INTERNET': 'Global network connecting millions of computers',
      'BLUETOOTH': 'Wireless technology for short-range communication',
      'ALGORITHM': 'Step-by-step procedure for solving problems',
      'DATABASE': 'Organized collection of structured information',
      'ENCRYPTION': 'Process of encoding information for security',
      'ARTIFICIAL': 'Type of intelligence created by machines',
      'ROBOTICS': 'Technology dealing with robot design and operation',
      'VIRTUAL': 'Computer-generated simulation of reality',
      'CYBERSECURITY': 'Practice of protecting systems from digital attacks',
      'BLOCKCHAIN': 'Distributed ledger technology behind cryptocurrencies',
      'QUANTUM': 'Advanced computing using quantum mechanics',
      'MACHINE': 'Type of learning where computers improve automatically',
      'PROGRAMMING': 'Process of creating computer software',
      'JAVASCRIPT': 'Popular programming language for web development',
      'PYTHON': 'Programming language named after a comedy group',
      'GITHUB': 'Platform for hosting and collaborating on code',
      'OPENSOURCE': 'Software with source code freely available',
      'CLOUDCOMPUTING': 'Delivery of computing services over the internet'
    },
    sports: {
      'BASKETBALL': 'Sport played with hoops and orange ball',
      'FOOTBALL': 'American sport with touchdowns and field goals',
      'BASEBALL': 'Sport with bases, bats, and home runs',
      'TENNIS': 'Racket sport played on a court with a net',
      'SWIMMING': 'Water sport involving different strokes',
      'VOLLEYBALL': 'Sport where teams hit ball over a net',
      'BADMINTON': 'Racket sport played with a shuttlecock',
      'CRICKET': 'Sport popular in England and India with wickets',
      'RUGBY': 'Contact sport similar to American football',
      'HOCKEY': 'Sport played on ice with sticks and a puck',
      'GOLF': 'Sport where players hit ball into holes',
      'BOXING': 'Combat sport fought with gloved fists',
      'WRESTLING': 'Combat sport involving grappling techniques',
      'GYMNASTICS': 'Sport involving strength, flexibility, and agility',
      'ARCHERY': 'Sport of shooting arrows at a target',
      'FENCING': 'Combat sport using swords',
      'MARATHON': 'Long-distance running race of 26.2 miles',
      'TRIATHLON': 'Multi-sport race with swimming, cycling, and running',
      'SKATEBOARDING': 'Sport performed on a board with wheels',
      'SURFING': 'Water sport riding waves on a board'
    },
    food: {
      'PIZZA': 'Italian dish with cheese and toppings on dough',
      'HAMBURGER': 'Sandwich with meat patty between buns',
      'SPAGHETTI': 'Long thin pasta often served with sauce',
      'CHOCOLATE': 'Sweet treat made from cocoa beans',
      'SANDWICH': 'Food item with filling between bread slices',
      'PANCAKES': 'Flat cakes cooked on a griddle, often for breakfast',
      'TACOS': 'Mexican dish with filling in folded tortilla',
      'SUSHI': 'Japanese dish with rice and raw fish',
      'LASAGNA': 'Italian pasta dish with layers and cheese',
      'BURRITO': 'Mexican dish wrapped in a large tortilla',
      'CROISSANT': 'French pastry that is flaky and crescent-shaped',
      'DUMPLINGS': 'Small pieces of dough with filling inside',
      'QUESADILLA': 'Mexican dish with cheese between tortillas',
      'CHEESECAKE': 'Rich dessert made with cream cheese',
      'BARBECUE': 'Method of cooking meat over fire or coals',
      'OMELETTE': 'Dish made from beaten eggs cooked in a pan',
      'PRETZEL': 'Twisted bread snack often sprinkled with salt',
      'WAFFLES': 'Grid-patterned cakes cooked in special iron',
      'NACHOS': 'Mexican snack with chips and melted cheese',
      'SMOOTHIE': 'Thick drink made from blended fruits'
    }
  };
  
  // Initialize game
  function initGame() {
    // Load stats if not already loaded
    loadStats();
    
    // Reset game state
    correctLetters = [];
    wrongLetters = [];
    remainingGuesses = 6;
    gameOver = false;
    hintUsed = false;
    currentGameScore = 0;
    gameMessageEl.textContent = '';
    
    // Select random category and word
    const categories = Object.keys(wordCategories);
    selectedCategory = categories[Math.floor(Math.random() * categories.length)];
    const words = Object.keys(wordCategories[selectedCategory]);
    selectedWord = words[Math.floor(Math.random() * words.length)];
    
    // Update category stats
    gameStats.categoriesPlayed[selectedCategory]++;
    
    // Update UI
    const categoryEl = document.getElementById('category-name');
    if (categoryEl) {
      categoryEl.textContent = selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
    }
    hintText.textContent = 'Click the hint button for a clue!';
    updateScoreDisplay();
    
    // Reset hint button
    hintBtn.disabled = false;
    hintBtnMobile.disabled = false;
    hintBtn.classList.remove('used');
    hintBtnMobile.classList.remove('used');
    
    // Hide all hangman parts
    Object.values(hangmanParts).forEach(part => {
      part.style.display = 'none';
    });
    
    // Create word display
    wordDisplay.innerHTML = '';
    for (let i = 0; i < selectedWord.length; i++) {
      const letterEl = document.createElement('div');
      letterEl.classList.add('word-letter');
      letterEl.dataset.letter = selectedWord[i];
      wordDisplay.appendChild(letterEl);
    }
    
    // Create keyboard
    keyboard.innerHTML = '';
    for (let i = 65; i <= 90; i++) {
      const letter = String.fromCharCode(i);
      const keyEl = document.createElement('button');
      keyEl.classList.add('keyboard-letter');
      keyEl.textContent = letter;
      keyEl.dataset.letter = letter;
      keyEl.addEventListener('click', () => handleGuess(letter));
      keyboard.appendChild(keyEl);
    }
  }
  
  // Handle letter guess
  function handleGuess(letter) {
    if (gameOver || wrongLetters.includes(letter) || correctLetters.includes(letter)) return;
    
    if (selectedWord.includes(letter)) {
      // Correct guess
      correctLetters.push(letter);
      updateWordDisplay();
      
      // Mark keyboard letter as correct
      document.querySelector(`.keyboard-letter[data-letter="${letter}"]`).classList.add('correct', 'used');
      
      // Check if player won
      if (checkWin()) {
        gameOver = true;
        currentGameScore = calculateScore();
        
        // Update stats for win
        gameStats.wins++;
        gameStats.totalGames++;
        gameStats.currentStreak++;
        gameStats.categoryWins[selectedCategory]++;
        gameStats.totalScore += currentGameScore;
        gameStats.averageScore = Math.round(gameStats.totalScore / gameStats.totalGames);
        
        // Check for perfect game
        if (wrongLetters.length === 0) {
          gameStats.perfectGames++;
        }
        
        if (gameStats.currentStreak > gameStats.bestStreak) {
          gameStats.bestStreak = gameStats.currentStreak;
        }
        
        updateScoreDisplay();
        saveStats();
        
        // Show result modal
        setTimeout(() => showResultModal(true), 500);
      }
    } else {
      // Wrong guess
      wrongLetters.push(letter);
      remainingGuesses--;
      
      // Mark keyboard letter as wrong
      document.querySelector(`.keyboard-letter[data-letter="${letter}"]`).classList.add('wrong', 'used');
      
      // Show hangman part
      updateHangmanDrawing();
      
      // Check if player lost
      if (remainingGuesses === 0) {
        gameOver = true;
        currentGameScore = 0;
        
        // Update stats for loss
        gameStats.losses++;
        gameStats.totalGames++;
        gameStats.currentStreak = 0; // Reset streak on loss
        gameStats.averageScore = gameStats.totalGames > 0 ? Math.round(gameStats.totalScore / gameStats.totalGames) : 0;
        
        updateScoreDisplay();
        saveStats();
        
        // Show face
        hangmanParts.face.style.display = 'block';
        
        // Reveal all letters
        document.querySelectorAll('.word-letter').forEach(el => {
          el.textContent = el.dataset.letter;
        });
        
        // Show result modal
        setTimeout(() => showResultModal(false), 500);
      }
    }
  }
  
  // Update hangman drawing
  function updateHangmanDrawing() {
    switch(wrongLetters.length) {
      case 1: hangmanParts.head.style.display = 'block'; break;
      case 2: hangmanParts.body.style.display = 'block'; break;
      case 3: hangmanParts.leftArm.style.display = 'block'; break;
      case 4: hangmanParts.rightArm.style.display = 'block'; break;
      case 5: hangmanParts.leftLeg.style.display = 'block'; break;
      case 6: hangmanParts.rightLeg.style.display = 'block'; break;
    }
  }
  
  // Update word display with correctly guessed letters
  function updateWordDisplay() {
    document.querySelectorAll('.word-letter').forEach(el => {
      const letter = el.dataset.letter;
      if (correctLetters.includes(letter)) {
        el.textContent = letter;
      }
    });
  }
  
  // Show hint function
  function showHint() {
    if (!hintUsed && !gameOver) {
      hintUsed = true;
      gameStats.hintsUsed++;
      const hint = wordCategories[selectedCategory][selectedWord];
      hintText.textContent = `💡 ${hint}`;
      hintBtn.disabled = true;
      hintBtnMobile.disabled = true;
      hintBtn.classList.add('used');
      hintBtnMobile.classList.add('used');
      saveStats();
    }
  }
  
  // Check if player won
  function checkWin() {
    return selectedWord.split('').every(letter => correctLetters.includes(letter));
  }
  
  // Show result modal with particles
  function showResultModal(isWin) {
    const modal = document.getElementById('result-modal');
    const icon = document.getElementById('result-icon');
    const title = document.getElementById('result-title');
    const message = document.getElementById('result-message');
    const scoreEl = document.getElementById('result-score');
    const wordEl = document.getElementById('result-word');
    const streakEl = document.getElementById('result-streak');
    
    // Set modal type
    modal.className = 'result-modal show ' + (isWin ? 'win' : 'loss');
    
    if (isWin) {
      icon.textContent = wrongLetters.length === 0 ? '🌟' : '🎉';
      title.textContent = wrongLetters.length === 0 ? 'PERFECT GAME!' : 'Congratulations!';
      message.textContent = 'You guessed the word correctly!';
      scoreEl.textContent = `+${currentGameScore}`;
      createModalParticles(true);
    } else {
      icon.textContent = '💀';
      title.textContent = 'Game Over!';
      message.textContent = 'Better luck next time!';
      scoreEl.textContent = '0';
      createModalParticles(false);
    }
    
    wordEl.textContent = selectedWord;
    streakEl.textContent = gameStats.currentStreak;
  }
  
  // Create particles in modal
  function createModalParticles(isWin) {
    const container = document.getElementById('particles-container');
    container.innerHTML = '';
    
    const colors = isWin 
      ? ['#667eea', '#764ba2', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6']
      : ['#ef4444', '#dc2626', '#991b1b', '#7f1d1d'];
    
    const particleCount = isWin ? 40 : 20;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.bottom = '0';
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.animationDelay = Math.random() * 0.5 + 's';
      particle.style.animationDuration = (Math.random() * 2 + 2) + 's';
      container.appendChild(particle);
    }
  }
  
  // Close result modal
  function closeResultModal() {
    const modal = document.getElementById('result-modal');
    modal.classList.remove('show');
  }
  
  // Keyboard event listener
  document.addEventListener('keydown', e => {
    if (/^[a-z]$/i.test(e.key)) {
      handleGuess(e.key.toUpperCase());
    }
  });
  
  // Reset button
  resetBtn.addEventListener('click', initGame);
  
  // Hint buttons
  hintBtn.addEventListener('click', showHint);
  hintBtnMobile.addEventListener('click', showHint);
  
  // Reset stats button
  const resetStatsBtn = document.getElementById('reset-stats-btn');
  if (resetStatsBtn) {
    resetStatsBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all statistics? This cannot be undone!')) {
        gameStats = {
          wins: 0,
          losses: 0,
          totalGames: 0,
          bestStreak: 0,
          currentStreak: 0,
          totalScore: 0,
          averageScore: 0,
          perfectGames: 0,
          hintsUsed: 0,
          categoriesPlayed: {
            animals: 0, countries: 0, fruits: 0, technology: 0, sports: 0, food: 0
          },
          categoryWins: {
            animals: 0, countries: 0, fruits: 0, technology: 0, sports: 0, food: 0
          }
        };
        saveStats();
        alert('Statistics have been reset!');
      }
    });
  }
  
  // Modal buttons
  const playAgainBtn = document.getElementById('play-again-btn');
  const closeModalBtn = document.getElementById('close-modal-btn');
  
  if (playAgainBtn) {
    playAgainBtn.addEventListener('click', () => {
      closeResultModal();
      initGame();
    });
  }
  
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeResultModal);
  }
  
  // Close modal on outside click
  const resultModal = document.getElementById('result-modal');
  if (resultModal) {
    resultModal.addEventListener('click', (e) => {
      if (e.target === resultModal) {
        closeResultModal();
      }
    });
  }
  
  // Start the game
  initGame();
});