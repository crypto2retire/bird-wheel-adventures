import { VEHICLES, shuffle, pickRandom, wait } from '../core/gameData.js';

/**
 * VehicleABC.js - Alphabet game with vehicles
 * Two modes: Explore (free tap) and Find the Letter (guided)
 */

export function init(container, { tts, audio, state }) {
  let mode = 'explore'; // 'explore' or 'find'
  let level = 1;
  let lettersUnlocked = 0;
  let totalPlayed = 0;
  let currentTarget = null;
  let isWaiting = false;
  let cleanupCallbacks = [];

  const progress = state.getProgress('vehicleABC') || {};
  if (progress.level) level = progress.level;
  if (progress.lettersUnlocked) lettersUnlocked = progress.lettersUnlocked;
  if (progress.totalPlayed) totalPlayed = progress.totalPlayed;

  function saveProgress() {
    state.updateProgress('vehicleABC', { level, lettersUnlocked, totalPlayed });
  }

  function clearBoard() {
    container.innerHTML = '';
    cleanupCallbacks.forEach(cb => cb());
    cleanupCallbacks = [];
  }

  function createLetterTile(vehicle, showVehicle = true) {
    const tile = document.createElement('button');
    tile.className = 'tile';
    tile.style.display = 'flex';
    tile.style.flexDirection = 'column';
    tile.style.alignItems = 'center';
    tile.style.justifyContent = 'center';
    tile.style.gap = '0.3rem';
    tile.setAttribute('aria-label', `Letter ${vehicle.letter}`);

    const letterEl = document.createElement('span');
    letterEl.style.fontSize = '2.5rem';
    letterEl.style.fontWeight = 'bold';
    letterEl.textContent = vehicle.letter;

    const vehicleEl = document.createElement('span');
    vehicleEl.style.fontSize = '1.5rem';
    vehicleEl.textContent = vehicle.emoji;
    vehicleEl.setAttribute('role', 'img');
    vehicleEl.setAttribute('aria-label', vehicle.name);

    tile.appendChild(letterEl);
    if (showVehicle) {
      tile.appendChild(vehicleEl);
    }

    return tile;
  }

  function createModeToggle() {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.gap = '0.5rem';
    wrapper.style.marginBottom = '0.5rem';

    const exploreBtn = document.createElement('button');
    exploreBtn.className = mode === 'explore' ? 'btn-primary' : 'btn-secondary';
    exploreBtn.textContent = 'Explore';
    exploreBtn.addEventListener('click', async () => {
      if (mode === 'explore') return;
      audio.playTap();
      mode = 'explore';
      await wait(300);
      startExploreMode();
    });

    const findBtn = document.createElement('button');
    findBtn.className = mode === 'find' ? 'btn-primary' : 'btn-secondary';
    findBtn.textContent = 'Find the Letter';
    findBtn.addEventListener('click', async () => {
      if (mode === 'find') return;
      audio.playTap();
      mode = 'find';
      await wait(300);
      startFindMode();
    });

    wrapper.appendChild(exploreBtn);
    wrapper.appendChild(findBtn);
    return wrapper;
  }

  // ─── Explore Mode ─────────────────────────────────────────────────────

  async function startExploreMode() {
    isWaiting = false;
    clearBoard();

    const board = document.createElement('div');
    board.className = 'game-board';

    board.appendChild(createModeToggle());

    const prompt = document.createElement('div');
    prompt.className = 'game-prompt';
    prompt.textContent = 'Tap a letter!';
    board.appendChild(prompt);

    const grid = document.createElement('div');
    grid.className = 'tile-grid cols-4';

    VEHICLES.forEach(vehicle => {
      const tile = createLetterTile(vehicle, true);
      tile.addEventListener('click', async () => {
        if (isWaiting) return;
        isWaiting = true;
        audio.playTap();

        // Highlight the tile
        tile.classList.add('selected');
        await wait(200);
        tile.classList.remove('selected');

        // Play vehicle sound based on type
        if (vehicle.name.toLowerCase().includes('boat') || vehicle.name.toLowerCase().includes('ship')) {
          audio.playBeep(); // boats
        } else if (vehicle.name.toLowerCase().includes('car') || vehicle.name.toLowerCase().includes('truck') || vehicle.name.toLowerCase().includes('bus')) {
          audio.playBeep(); // cars
        } else {
          audio.playChirp(); // flying things
        }

        await tts.speak(`${vehicle.letter} is for ${vehicle.name}!`);

        // Show large vehicle emoji
        const bigEmoji = document.createElement('div');
        bigEmoji.className = 'speech-bubble fade-in';
        bigEmoji.style.fontSize = '4rem';
        bigEmoji.style.textAlign = 'center';
        bigEmoji.style.marginTop = '1rem';
        bigEmoji.textContent = vehicle.emoji;
        bigEmoji.setAttribute('role', 'img');
        bigEmoji.setAttribute('aria-label', vehicle.name);
        board.appendChild(bigEmoji);

        await wait(1500);
        bigEmoji.remove();
        isWaiting = false;

        totalPlayed++;
        const idx = VEHICLES.indexOf(vehicle);
        if (idx > lettersUnlocked) {
          lettersUnlocked = idx;
        }
        saveProgress();
      });
      grid.appendChild(tile);
    });

    board.appendChild(grid);
    container.appendChild(board);

    await wait(500);
    await tts.speak('Tap a letter!');
  }

  // ─── Find the Letter Mode ─────────────────────────────────────────────

  async function startFindMode() {
    isWaiting = false;
    clearBoard();

    const board = document.createElement('div');
    board.className = 'game-board';

    board.appendChild(createModeToggle());

    // Pick target letter
    currentTarget = VEHICLES[Math.floor(Math.random() * VEHICLES.length)];

    const prompt = document.createElement('div');
    prompt.className = 'game-prompt';
    prompt.textContent = `Can you find the letter ${currentTarget.letter}?`;
    board.appendChild(prompt);

    // Build pool of 4-6 options including target
    const optionCount = Math.min(4 + Math.floor(Math.random() * 3), 6); // 4-6
    const otherVehicles = VEHICLES.filter(v => v.letter !== currentTarget.letter);
    const distractors = pickRandom(otherVehicles, optionCount - 1);
    const options = shuffle([currentTarget, ...distractors]);

    const colsClass = options.length <= 4 ? 'cols-2' : 'cols-3';
    const grid = document.createElement('div');
    grid.className = `tile-grid ${colsClass}`;

    options.forEach(vehicle => {
      const tile = createLetterTile(vehicle, true);
      tile.addEventListener('click', async () => {
        if (isWaiting) return;
        await handleFindTap(vehicle, tile, board);
      });
      grid.appendChild(tile);
    });

    board.appendChild(grid);
    container.appendChild(board);

    await wait(500);
    await tts.speak(`Can you find the letter ${currentTarget.letter}?`);
  }

  async function handleFindTap(vehicle, tile, board) {
    audio.playTap();

    if (vehicle.letter === currentTarget.letter) {
      isWaiting = true;
      tile.classList.add('correct');
      audio.playChime();
      await wait(300);
      audio.playCelebrate();

      await tts.speak(`${vehicle.letter}! ${vehicle.letter} is for ${vehicle.name}!`);
      totalPlayed++;
      const idx = VEHICLES.indexOf(vehicle);
      if (idx > lettersUnlocked) {
        lettersUnlocked = idx;
      }
      saveProgress();

      await wait(800);
      showFindReward(board);
    } else {
      tile.classList.add('wrong');
      await wait(300);
      tile.classList.remove('wrong');
      audio.playHmm();

      await tts.speak(`That's ${vehicle.letter}. Try again! Find ${currentTarget.letter}!`);
      // They can try again, tile stays available
    }
  }

  async function showFindReward(board) {
    const existingReward = board.querySelector('.reward-screen');
    if (existingReward) existingReward.remove();

    const reward = document.createElement('div');
    reward.className = 'reward-screen fade-in';

    const star = document.createElement('div');
    star.style.fontSize = '5rem';
    star.textContent = '⭐';
    star.setAttribute('role', 'img');
    star.setAttribute('aria-label', 'Star');

    const praise = document.createElement('div');
    praise.className = 'game-prompt';
    praise.textContent = 'Great job!';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn-primary';
    nextBtn.textContent = 'Next Letter';
    nextBtn.addEventListener('click', async () => {
      audio.playTap();
      await wait(300);
      startFindMode();
    });

    reward.appendChild(star);
    reward.appendChild(praise);
    reward.appendChild(nextBtn);
    board.appendChild(reward);

    await tts.speak('Great job!');
  }

  // ─── Start ────────────────────────────────────────────────────────────

  startExploreMode();

  return () => {
    clearBoard();
    tts.cancel();
  };
}
