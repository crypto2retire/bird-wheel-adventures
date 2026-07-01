import { BIRDS, pickRandom, wait } from '../core/gameData.js';

/**
 * BirdCounter.js - Interactive counting game with birds
 * The child taps birds one by one. Each bird chirps and the TTS counts aloud.
 * No number buttons. No quiz format. Just tap birds and count together.
 */

const NUMBER_WORDS = [
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
  'twenty-one', 'twenty-two', 'twenty-three', 'twenty-four', 'twenty-five', 'twenty-six', 'twenty-seven', 'twenty-eight', 'twenty-nine', 'thirty'
];

// Bird count per level
const LEVELS = [
  { label: '1-5 birds', min: 1, max: 5 },
  { label: '6-10 birds', min: 6, max: 10 },
  { label: '11-15 birds', min: 11, max: 15 },
  { label: '16-20 birds', min: 16, max: 20 },
  { label: '21-25 birds', min: 21, max: 25 },
  { label: '26-30 birds', min: 26, max: 30 }
];

export function init(container, { tts, audio, state }) {
  let currentLevel = 0;
  let stars = 0;
  let totalPlayed = 0;
  let birdCount = 0;
  let currentBirds = [];
  let counted = 0; // how many birds tapped so far
  let isBusy = false;
  let cleanupCallbacks = [];

  const progress = state.getProgress('birdCounter') || {};
  if (progress.level !== undefined) currentLevel = Math.min(progress.level - 1, LEVELS.length - 1);
  if (progress.stars) stars = progress.stars;
  if (progress.totalPlayed) totalPlayed = progress.totalPlayed;

  function saveProgress() {
    state.updateProgress('birdCounter', { level: currentLevel + 1, stars, totalPlayed });
  }

  function generateRound() {
    const level = LEVELS[currentLevel];
    birdCount = Math.floor(Math.random() * (level.max - level.min + 1)) + level.min;
    counted = 0;

    // Pick birds, repeating if needed to fill the count
    const pool = shuffle([...BIRDS]);
    currentBirds = [];
    for (let i = 0; i < birdCount; i++) {
      currentBirds.push({ ...pool[i % pool.length], id: i });
    }
  }

  function clearBoard() {
    container.innerHTML = '';
    cleanupCallbacks.forEach(cb => cb());
    cleanupCallbacks = [];
  }

  function getPosition(index, total) {
    // Distribute birds in a scattered but evenly-spread layout
    // Use a grid-like scatter within a bounded area
    const cols = total <= 5 ? 3 : total <= 10 ? 4 : 5;
    const row = Math.floor(index / cols);
    const col = index % cols;
    const jitterX = (Math.random() - 0.5) * 30; // +/- 15px randomness
    const jitterY = (Math.random() - 0.5) * 30;
    return { x: col * 90 + 40 + jitterX, y: row * 90 + 30 + jitterY };
  }

  function createBirdScene() {
    const scene = document.createElement('div');
    scene.style.position = 'relative';
    scene.style.width = '100%';
    scene.style.maxWidth = '520px';
    scene.style.height = '380px';
    scene.style.background = 'linear-gradient(180deg, #9BB8D3 0%, #E8F0F8 40%, #F5F0E8 40%)';
    scene.style.borderRadius = '20px';
    scene.style.overflow = 'hidden';
    scene.style.margin = '0 auto';
    scene.style.border = '3px solid #7BA598';

    // Add a "wire" line for birds to sit on
    const wire = document.createElement('div');
    wire.style.position = 'absolute';
    wire.style.top = '50%';
    wire.style.left = '0';
    wire.style.width = '100%';
    wire.style.height = '3px';
    wire.style.background = '#8B7355';
    wire.style.zIndex = '1';
    scene.appendChild(wire);

    return scene;
  }

  function createBirdElement(bird, index) {
    const el = document.createElement('div');
    el.className = 'bird-item';
    el.dataset.index = String(index);
    el.style.fontSize = '2.8rem';
    el.style.cursor = 'pointer';
    el.style.position = 'absolute';
    el.style.zIndex = '2';
    el.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    el.style.userSelect = 'none';
    el.style.touchAction = 'manipulation';
    el.textContent = bird.emoji;
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', bird.name);

    const pos = getPosition(index, birdCount);
    el.style.left = `${pos.x}px`;
    el.style.top = `${pos.y}px`;

    // Initial "fly in" animation offset
    el.style.opacity = '0';
    el.style.transform = 'translateY(-30px) scale(0.7)';

    return el;
  }

  async function handleBirdTap(birdEl, bird, index) {
    if (isBusy || birdEl.dataset.tapped === 'true') return;
    isBusy = true;

    audio.playTap();
    audio.playChirp();
    counted++;

    birdEl.dataset.tapped = 'true';
    birdEl.style.transform = 'scale(1.3) translateY(-10px)';
    birdEl.style.opacity = '0.5'; // slightly dim to show it was counted
    birdEl.style.pointerEvents = 'none';

    // Update the counter display
    const counterEl = document.getElementById('bird-counter-display');
    if (counterEl) {
      counterEl.textContent = `${counted} / ${birdCount}`;
    }

    const countWord = NUMBER_WORDS[counted - 1] || counted.toString();
    await tts.speak(`${countWord}!`);

    await wait(300);
    birdEl.style.transform = 'scale(1) translateY(0)';

    if (counted === birdCount) {
      // All birds counted!
      await wait(400);
      audio.playChime();
      await wait(200);
      audio.playCelebrate();
      await tts.speak(`You counted ${birdCount} birds! Great counting!`);
      stars++;
      totalPlayed++;
      saveProgress();
      await wait(1000);
      showRewardScreen();
    } else {
      // Show prompt for next bird
      await tts.speak('Tap the next bird!');
      isBusy = false;
    }
  }

  async function showRewardScreen() {
    clearBoard();
    const board = document.createElement('div');
    board.className = 'game-board';

    const reward = document.createElement('div');
    reward.className = 'reward-screen fade-in';

    const bigEmoji = document.createElement('div');
    bigEmoji.className = 'big-emoji';
    bigEmoji.textContent = '⭐';

    const praise = document.createElement('div');
    praise.className = 'reward-text';
    praise.textContent = `You counted ${birdCount} birds!`;

    const btnRow = document.createElement('div');
    btnRow.style.display = 'flex';
    btnRow.style.gap = '16px';
    btnRow.style.flexWrap = 'wrap';
    btnRow.style.justifyContent = 'center';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn-primary';
    nextBtn.textContent = 'Next Round';
    nextBtn.addEventListener('click', async () => {
      audio.playTap();
      nextBtn.disabled = true;
      await wait(300);
      startRound();
    });

    const moreBtn = document.createElement('button');
    moreBtn.className = 'btn-secondary';
    moreBtn.textContent = 'More Birds!';
    moreBtn.addEventListener('click', async () => {
      audio.playTap();
      moreBtn.disabled = true;
      // Increase level (more birds next round)
      if (currentLevel < LEVELS.length - 1) {
        currentLevel++;
      }
      await wait(300);
      startRound();
    });

    btnRow.appendChild(nextBtn);
    btnRow.appendChild(moreBtn);

    reward.appendChild(bigEmoji);
    reward.appendChild(praise);
    reward.appendChild(btnRow);
    board.appendChild(reward);
    container.appendChild(board);

    await wait(500);
  }

  async function startRound() {
    isBusy = false;
    generateRound();
    clearBoard();

    const board = document.createElement('div');
    board.className = 'game-board';

    // Level label + counter
    const infoRow = document.createElement('div');
    infoRow.style.textAlign = 'center';
    infoRow.style.marginBottom = '0.5rem';
    infoRow.innerHTML = `<div style="font-size:1rem;color:#666;">Level ${currentLevel + 1} • ${LEVELS[currentLevel].label}</div>`;
    board.appendChild(infoRow);

    const counter = document.createElement('div');
    counter.id = 'bird-counter-display';
    counter.style.fontSize = '1.8rem';
    counter.style.fontWeight = '800';
    counter.style.color = '#7BA598';
    counter.style.textAlign = 'center';
    counter.style.marginBottom = '0.5rem';
    counter.textContent = '0 / ' + birdCount;
    board.appendChild(counter);

    const prompt = document.createElement('div');
    prompt.className = 'game-prompt';
    prompt.style.fontSize = '1.3rem';
    prompt.textContent = 'Tap the birds to count them!';
    board.appendChild(prompt);

    const scene = createBirdScene();

    // Animate birds flying in one by one
    currentBirds.forEach((bird, i) => {
      const birdEl = createBirdElement(bird, i);
      birdEl.addEventListener('click', () => handleBirdTap(birdEl, bird, i));
      scene.appendChild(birdEl);

      // Staggered fly-in animation
      setTimeout(() => {
        birdEl.style.opacity = '1';
        birdEl.style.transform = 'translateY(0) scale(1)';
      }, 150 + i * 120);
    });

    board.appendChild(scene);
    container.appendChild(board);

    await wait(500 + birdCount * 120);
    await tts.speak(`Tap the birds to count them! There are ${birdCount} birds!`);
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
    sub.textContent = 'Tap birds to count them!';
    board.appendChild(sub);

    const emoji = document.createElement('div');
    emoji.style.fontSize = '4rem';
    emoji.style.textAlign = 'center';
    emoji.style.marginBottom = '1rem';
    emoji.textContent = '🐦🐦🐦';
    board.appendChild(emoji);

    const startBtn = document.createElement('button');
    startBtn.className = 'btn-primary';
    startBtn.style.fontSize = '1.4rem';
    startBtn.textContent = 'Start Counting!';
    startBtn.addEventListener('click', async () => {
      audio.playTap();
      startBtn.disabled = true;
      await wait(300);
      startRound();
    });
    board.appendChild(startBtn);

    const levelSelect = document.createElement('div');
    levelSelect.style.marginTop = '1.5rem';
    levelSelect.style.display = 'grid';
    levelSelect.style.gridTemplateColumns = 'repeat(2, 1fr)';
    levelSelect.style.gap = '12px';
    levelSelect.style.maxWidth = '400px';
    levelSelect.style.width = '100%';

    LEVELS.forEach((lvl, idx) => {
      const tile = document.createElement('button');
      tile.className = 'tile';
      tile.style.display = 'flex';
      tile.style.flexDirection = 'column';
      tile.style.alignItems = 'center';
      tile.style.justifyContent = 'center';
      tile.style.gap = '0.5rem';
      tile.style.padding = '0.5rem';
      tile.innerHTML = `<span style="font-size:2rem">🐦</span><span style="font-size:0.9rem;font-weight:bold">${lvl.label}</span>`;
      tile.addEventListener('click', async () => {
        audio.playTap();
        currentLevel = idx;
        await wait(300);
        startRound();
      });
      levelSelect.appendChild(tile);
    });
    board.appendChild(levelSelect);

    container.appendChild(board);
  }

  showLevelSelect();

  return () => {
    clearBoard();
    tts.cancel();
  };
}

// Simple shuffle helper for local use
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
