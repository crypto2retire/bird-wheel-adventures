import { BIRDS, VEHICLES, pickRandom, shuffle, wait } from '../core/gameData.js';

const LEVELS = [
  { name: 1, pairs: 2, cols: 'cols-2' },
  { name: 2, pairs: 3, cols: 'cols-3' },
  { name: 3, pairs: 6, cols: 'cols-4' },
  { name: 4, pairs: 8, cols: 'cols-4' },
];

export function init(container, { tts, audio, state }) {
  const settings = state.getSettings();
  let currentLevel = 0;
  let cards = [];
  let flipped = [];
  let matched = 0;
  let isBusy = false;

  const progress = state.getProgress('memoryMatch') || {};
  currentLevel = Math.min(
    (progress.level || 1) - 1,
    LEVELS.length - 1
  );
  const gamesPlayed = (progress.gamesPlayed || 0);

  function buildBoard(levelIndex) {
    const level = LEVELS[levelIndex];
    const pairCount = level.pairs;
    const birdCount = Math.min(Math.ceil(pairCount / 2), BIRDS.length);
    const vehicleCount = Math.min(pairCount - birdCount, VEHICLES.length);
    const birds = pickRandom(BIRDS, birdCount);
    const vehicles = pickRandom(VEHICLES, vehicleCount);
    const items = [...birds, ...vehicles];
    const pairs = items.flatMap(item => [item, item]);
    const shuffledPairs = shuffle(pairs);

    matched = 0;
    flipped = [];
    isBusy = false;

    cards = shuffledPairs.map((item, index) => {
      const tile = document.createElement('button');
      tile.className = 'tile';
      tile.dataset.index = String(index);
      tile.dataset.name = item.name;
      tile.style.minWidth = '80px';
      tile.style.minHeight = '80px';
      tile.style.fontSize = '2.5rem';
      tile.style.display = 'flex';
      tile.style.alignItems = 'center';
      tile.style.justifyContent = 'center';
      tile.style.position = 'relative';
      tile.style.background = '#ffffff';
      tile.style.border = '3px solid #e0e0e0';
      tile.style.borderRadius = '12px';
      tile.style.padding = '0.5rem';
      tile.style.margin = '0.25rem';
      tile.style.cursor = 'pointer';
      tile.style.transition = 'transform 0.2s ease, border-color 0.2s ease';
      tile.style.overflow = 'hidden';
      tile.setAttribute('aria-label', 'Hidden card');

      tile.innerHTML = `<span style="font-size:2rem;opacity:0.35;">❓</span>`;

      tile.addEventListener('click', () => onCardClick(index));
      return { element: tile, item, flipped: false, matched: false };
    });

    const grid = document.createElement('div');
    grid.className = `tile-grid ${level.cols}`;
    grid.style.maxWidth = '480px';
    grid.style.margin = '0 auto';
    grid.style.padding = '0.5rem';
    cards.forEach(c => grid.appendChild(c.element));

    return grid;
  }

  async function onCardClick(index) {
    if (isBusy) return;
    const card = cards[index];
    if (card.flipped || card.matched) return;

    audio.playTap();
    card.flipped = true;
    card.element.classList.add('flipped');
    card.element.innerHTML = `<span style="font-size:2.5rem;">${card.item.emoji}</span>`;
    card.element.setAttribute('aria-label', card.item.name);

    tts.cancel();
    await wait(100);
    tts.speak(`You found a ${card.item.name}!`);

    flipped.push(index);

    if (flipped.length === 2) {
      isBusy = true;
      const [i1, i2] = flipped;
      const c1 = cards[i1];
      const c2 = cards[i2];

      await wait(600);

      if (c1.item.name === c2.item.name) {
        c1.matched = true;
        c2.matched = true;
        c1.element.classList.add('matched');
        c2.element.classList.add('matched');
        matched += 1;
        audio.playChime();
        await wait(300);
        audio.playCelebrate();
        tts.cancel();
        await wait(100);
        tts.speak(`Match! Two ${c1.item.name}s!`);
        flipped = [];
        isBusy = false;

        if (matched === LEVELS[currentLevel].pairs) {
          await wait(1200);
          await showReward();
        }
      } else {
        await wait(600);
        tts.speak('Not a match. Try again!');
        await wait(1500);
        c1.flipped = false;
        c2.flipped = false;
        c1.element.classList.remove('flipped');
        c2.element.classList.remove('flipped');
        c1.element.innerHTML = `<span style="font-size:2rem;opacity:0.35;">❓</span>`;
        c2.element.innerHTML = `<span style="font-size:2rem;opacity:0.35;">❓</span>`;
        c1.element.setAttribute('aria-label', 'Hidden card');
        c2.element.setAttribute('aria-label', 'Hidden card');
        flipped = [];
        isBusy = false;
      }
    }
  }

  async function showReward() {
    container.innerHTML = '';

    const reward = document.createElement('div');
    reward.className = 'reward-screen fade-in';
    reward.style.display = 'flex';
    reward.style.flexDirection = 'column';
    reward.style.alignItems = 'center';
    reward.style.justifyContent = 'center';
    reward.style.textAlign = 'center';
    reward.style.padding = '2rem';
    reward.style.minHeight = '60vh';

    reward.innerHTML = `
      <div style="font-size:5rem;margin-bottom:1rem;">⭐</div>
      <div class="game-prompt" style="margin-bottom:1.5rem;">Great job!</div>
      <div style="font-size:1.5rem;color:#555;margin-bottom:2rem;">You matched all the cards!</div>
      <button id="mm-replay" class="btn-primary" style="font-size:1.25rem;padding:0.75rem 1.5rem;">Play Again</button>
    `;

    container.appendChild(reward);

    state.updateProgress('memoryMatch', {
      level: currentLevel + 1,
      gamesPlayed: gamesPlayed + 1,
    });

    await wait(500);
    tts.speak('Great job! You matched all the cards!');
    await wait(800);
    audio.playCelebrate();

    const replayBtn = reward.querySelector('#mm-replay');
    replayBtn.addEventListener('click', async () => {
      audio.playTap();
      replayBtn.disabled = true;
      await startLevel();
    });
  }

  async function startLevel() {
    container.innerHTML = '';
    const board = document.createElement('div');
    board.className = 'game-board';

    const header = document.createElement('div');
    header.style.textAlign = 'center';
    header.style.marginBottom = '1rem';
    header.innerHTML = `<div style="font-size:1.1rem;color:#666;">Level ${currentLevel + 1} • Find the pairs!</div>`;
    board.appendChild(header);

    const grid = buildBoard(currentLevel);
    board.appendChild(grid);
    container.appendChild(board);

    await wait(500);
    tts.speak('Find the matching pairs! Tap a card to see what is hidden.');
  }

  startLevel();

  return () => {
    tts.cancel();
    container.innerHTML = '';
  };
}
