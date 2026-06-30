import { BIRDS, VEHICLES, shuffle, pickRandom, wait } from '../core/gameData.js';

/**
 * BirdCounter.js - Counting game with birds
 * Levels: 1-5 (2x2/2x3), 6-10 (2x5), 11-20 (4x5), Groups of 10 up to 100
 */

export function init(container, { tts, audio, state }) {
  let currentLevel = 1;
  let stars = 0;
  let totalPlayed = 0;
  let birdCount = 0;
  let currentBirds = [];
  let isWaiting = false;
  let cleanupCallbacks = [];

  const progress = state.getProgress('birdCounter') || {};
  if (progress.level) currentLevel = progress.level;
  if (progress.stars) stars = progress.stars;
  if (progress.totalPlayed) totalPlayed = progress.totalPlayed;

  function saveProgress() {
    state.updateProgress('birdCounter', { level: currentLevel, stars, totalPlayed });
  }

  function getRangeForLevel(level) {
    switch (level) {
      case 1: return [1, 5];
      case 2: return [6, 10];
      case 3: return [11, 20];
      case 4: return [10, 100]; // multiples of 10
      default: return [1, 5];
    }
  }

  function getColsForLevel(level) {
    switch (level) {
      case 1: return 'cols-3';
      case 2: return 'cols-5';
      case 3: return 'cols-5';
      case 4: return 'cols-5';
      default: return 'cols-3';
    }
  }

  function getNumberPadRange(level) {
    switch (level) {
      case 1: return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      case 2: return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      case 3: return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
      case 4: return [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      default: return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    }
  }

  function generateRound() {
    const [min, max] = getRangeForLevel(currentLevel);
    if (currentLevel === 4) {
      birdCount = (Math.floor(Math.random() * 10) + 1) * 10;
    } else {
      birdCount = Math.floor(Math.random() * (max - min + 1)) + min;
    }
    currentBirds = pickRandom(BIRDS, Math.min(birdCount, BIRDS.length));
    // If we need more birds than unique types, repeat
    while (currentBirds.length < birdCount) {
      currentBirds.push(...pickRandom(BIRDS, Math.min(birdCount - currentBirds.length, BIRDS.length)));
    }
    currentBirds = currentBirds.slice(0, birdCount);
  }

  function renderProgressDots() {
    const dots = document.createElement('div');
    dots.className = 'progress-dots';
    for (let i = 0; i < 5; i++) {
      const dot = document.createElement('div');
      dot.className = 'progress-dot' + (i < stars % 5 ? ' active' : '');
      dots.appendChild(dot);
    }
    return dots;
  }

  function clearBoard() {
    container.innerHTML = '';
    cleanupCallbacks.forEach(cb => cb());
    cleanupCallbacks = [];
  }

  function createBirdTile(bird) {
    const tile = document.createElement('div');
    tile.className = 'tile fade-in';
    tile.style.fontSize = '2.5rem';
    tile.textContent = bird.emoji;
    tile.setAttribute('role', 'img');
    tile.setAttribute('aria-label', bird.name);
    return tile;
  }

  function createNumberPad() {
    const pad = document.createElement('div');
    pad.className = 'number-pad';
    const numbers = getNumberPadRange(currentLevel);
    numbers.forEach(num => {
      const btn = document.createElement('button');
      btn.className = 'number-btn';
      btn.textContent = num;
      btn.setAttribute('aria-label', `Number ${num}`);
      btn.addEventListener('click', () => handleNumberTap(num, btn));
      pad.appendChild(btn);
    });
    return pad;
  }

  async function handleNumberTap(num, btn) {
    if (isWaiting) return;
    audio.playTap();

    if (num === birdCount) {
      isWaiting = true;
      btn.classList.add('correct');
      audio.playChime();
      await wait(300);
      audio.playCelebrate();

      const countWords = currentBirds.map((_, i) => {
        const words = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
          'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
        return words[i] || (i + 1).toString();
      }).join(', ');

      await tts.speak(`Yes! There are ${birdCount} birds! ${countWords}!`);
      stars++;
      totalPlayed++;
      saveProgress();

      await wait(800);
      showRewardScreen();
    } else {
      btn.classList.add('wrong');
      await wait(300);
      btn.classList.remove('wrong');
      audio.playHmm();

      const countWords = currentBirds.map((_, i) => {
        const words = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
          'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
        return words[i] || (i + 1).toString();
      }).join(', ');

      await tts.speak(`Let's count together! ${countWords}!`);
      // Number pad stays, they can try again
    }
  }

  async function showRewardScreen() {
    clearBoard();
    const board = document.createElement('div');
    board.className = 'game-board';

    const reward = document.createElement('div');
    reward.className = 'reward-screen fade-in';

    const star = document.createElement('div');
    star.style.fontSize = '5rem';
    star.textContent = '⭐';
    star.setAttribute('role', 'img');
    star.setAttribute('aria-label', 'Star');

    const praise = document.createElement('div');
    praise.className = 'game-prompt';
    praise.textContent = 'Great counting!';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn-primary';
    nextBtn.textContent = 'Next Round';
    nextBtn.addEventListener('click', async () => {
      audio.playTap();
      await wait(300);
      startRound();
    });

    reward.appendChild(star);
    reward.appendChild(praise);
    reward.appendChild(nextBtn);
    board.appendChild(reward);
    container.appendChild(board);

    await tts.speak('Great counting!');
  }

  async function startRound() {
    isWaiting = false;
    generateRound();
    clearBoard();

    const board = document.createElement('div');
    board.className = 'game-board';

    board.appendChild(renderProgressDots());

    const prompt = document.createElement('div');
    prompt.className = 'game-prompt';
    prompt.textContent = 'How many birds do you see?';
    board.appendChild(prompt);

    const grid = document.createElement('div');
    grid.className = `tile-grid ${getColsForLevel(currentLevel)}`;
    currentBirds.forEach(bird => {
      grid.appendChild(createBirdTile(bird));
    });
    board.appendChild(grid);

    const numberPad = createNumberPad();
    board.appendChild(numberPad);

    container.appendChild(board);

    await wait(500);
    await tts.speak('How many birds do you see?');
  }

  function showLevelSelect() {
    clearBoard();
    const board = document.createElement('div');
    board.className = 'game-board';

    const title = document.createElement('div');
    title.className = 'game-prompt';
    title.textContent = 'Bird Counter';
    board.appendChild(title);

    const sub = document.createElement('div');
    sub.className = 'game-subprompt';
    sub.textContent = 'Pick a level!';
    board.appendChild(sub);

    const levels = [
      { num: 1, label: '1-5 birds', emoji: '🐦' },
      { num: 2, label: '6-10 birds', emoji: '🐤' },
      { num: 3, label: '11-20 birds', emoji: '🦜' },
      { num: 4, label: 'Groups of 10', emoji: '🦅' }
    ];

    const grid = document.createElement('div');
    grid.className = 'tile-grid cols-2';
    levels.forEach(lvl => {
      const tile = document.createElement('button');
      tile.className = 'tile';
      tile.style.display = 'flex';
      tile.style.flexDirection = 'column';
      tile.style.alignItems = 'center';
      tile.style.justifyContent = 'center';
      tile.style.gap = '0.5rem';
      tile.innerHTML = `<span style="font-size:2.5rem">${lvl.emoji}</span><span style="font-size:1rem;font-weight:bold">${lvl.label}</span>`;
      tile.addEventListener('click', async () => {
        audio.playTap();
        currentLevel = lvl.num;
        await wait(300);
        startRound();
      });
      grid.appendChild(tile);
    });
    board.appendChild(grid);

    container.appendChild(board);
  }

  showLevelSelect();

  return () => {
    clearBoard();
    tts.cancel();
  };
}
