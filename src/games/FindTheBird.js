/** @file FindTheBird.js - Receptive language / following directions game */

import { BIRDS, VEHICLES, shuffle, pickRandom, wait } from '../core/gameData.js';

const BIG_BIRD_NAMES = new Set(BIRDS.slice(0, 6).map(b => b.name));
const SMALL_BIRD_NAMES = new Set(BIRDS.slice(6).map(b => b.name));

const INSTRUCTION_TYPES = [
  'color_bird',
  'vehicle_name',
  'bird_sound',
  'vehicle_wheels',
  'big_small'
];

export function init(container, { tts, audio, state }) {
  let progress = state.getProgress('findTheBird') || { level: 1, totalPlayed: 0 };
  let isRunning = true;
  let roundsPlayed = 0;
  const MAX_ROUNDS = 5;

  const board = document.createElement('div');
  board.className = 'game-board';
  container.appendChild(board);

  const promptEl = document.createElement('div');
  promptEl.className = 'game-prompt';
  board.appendChild(promptEl);

  const scene = document.createElement('div');
  scene.className = 'scene';
  scene.style.position = 'relative';
  scene.style.display = 'flex';
  scene.style.alignItems = 'center';
  scene.style.justifyContent = 'center';
  scene.style.gap = '24px';
  scene.style.padding = '20px';
  board.appendChild(scene);

  let currentItems = [];
  let correctItem = null;
  let instructionText = '';
  let isRoundActive = false;

  function buildScene() {
    scene.innerHTML = '';
    currentItems = [];

    // 2 birds + 1 vehicle = 3 items max
    const birds = pickRandom(BIRDS, 2);
    const vehicle = pickRandom(VEHICLES, 1)[0];
    const mixed = shuffle([...birds, vehicle]);

    // Pick instruction type
    const type = pickRandom(INSTRUCTION_TYPES, 1)[0];

    // Determine correct answer and instruction text
    switch (type) {
      case 'color_bird': {
        const target = birds[0]; // first bird is the target
        correctItem = target;
        instructionText = `Find the ${target.color} bird!`;
        // Ensure at least one other bird with different color exists
        if (birds[1].color === target.color) {
          // Try to find a different-colored bird
          const alt = BIRDS.find(b => b.color !== target.color && b.name !== birds[1].name);
          if (alt) mixed[1] = alt;
        }
        break;
      }
      case 'vehicle_name': {
        correctItem = vehicle;
        instructionText = `Find the ${vehicle.name}!`;
        break;
      }
      case 'bird_sound': {
        correctItem = birds[0];
        instructionText = `Find the bird that says chirp!`;
        break;
      }
      case 'vehicle_wheels': {
        // Target a vehicle with wheels > 0
        const wheeled = VEHICLES.filter(v => v.wheels > 0);
        const target = pickRandom(wheeled, 1)[0];
        correctItem = target;
        instructionText = `Find the vehicle with wheels!`;
        // Replace the vehicle in mixed with this target
        mixed[2] = target;
        // Make sure another item is a no-wheel vehicle (helicopter or yacht)
        const noWheel = VEHICLES.filter(v => v.wheels === 0);
        const distractor = pickRandom(noWheel, 1)[0];
        // Replace one bird with the distractor vehicle to keep 3 items
        mixed[1] = distractor;
        shuffle(mixed);
        break;
      }
      case 'big_small': {
        // 50/50 chance big or small
        const wantBig = Math.random() < 0.5;
        // Choose from birds only for simplicity, or mix vehicles
        const birdPool = wantBig
          ? BIRDS.filter(b => BIG_BIRD_NAMES.has(b.name))
          : BIRDS.filter(b => SMALL_BIRD_NAMES.has(b.name));
        const target = pickRandom(birdPool, 1)[0];
        correctItem = target;
        const sizeWord = wantBig ? 'big' : 'small';
        instructionText = `Find the ${sizeWord} ${target.name.toLowerCase()}!`;
        // Ensure distractor is opposite size
        const oppPool = wantBig
          ? BIRDS.filter(b => SMALL_BIRD_NAMES.has(b.name))
          : BIRDS.filter(b => BIG_BIRD_NAMES.has(b.name));
        const distractor = pickRandom(oppPool, 1)[0];
        mixed[0] = target;
        mixed[1] = distractor;
        mixed[2] = vehicle; // third item is neutral vehicle
        shuffle(mixed);
        break;
      }
    }

    // Re-establish correctItem reference after any shuffling/replacement
    correctItem = mixed.find(it => it.name === correctItem.name) || mixed[0];

    promptEl.textContent = instructionText;

    for (const item of mixed) {
      const el = document.createElement('div');
      el.className = 'scene-item fade-in';
      el.style.position = 'relative';
      el.style.fontSize = '4rem';
      el.style.cursor = 'pointer';
      el.style.transition = 'transform 0.3s ease';
      el.style.minWidth = '80px';
      el.style.minHeight = '80px';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.textContent = item.emoji;
      el.dataset.name = item.name;

      el.addEventListener('click', () => onTap(el, item));
      el.addEventListener('touchstart', (e) => { e.preventDefault(); onTap(el, item); }, { passive: false });

      scene.appendChild(el);
      currentItems.push({ el, item });
    }

    isRoundActive = true;
    wait(500).then(() => { if (isRunning && isRoundActive) tts.speak(instructionText); });
  }

  async function onTap(el, item) {
    if (!isRunning || !isRoundActive) return;
    audio.playTap();

    const isCorrect = item.name === correctItem.name;

    if (isCorrect) {
      isRoundActive = false;
      el.classList.add('correct');
      // Gentle pulse animation
      el.style.transform = 'scale(1.2)';
      await wait(200);
      el.style.transform = 'scale(1.0)';
      await wait(200);
      el.style.transform = 'scale(1.1)';
      await wait(200);
      el.style.transform = 'scale(1.0)';

      audio.playChime();
      await wait(200);
      audio.playCelebrate();
      tts.speak(`Yes! The ${item.name}!`);

      roundsPlayed++;
      progress.totalPlayed = (progress.totalPlayed || 0) + 1;
      state.updateProgress('findTheBird', progress);

      await wait(1500);
      if (roundsPlayed >= MAX_ROUNDS) {
        showReward();
      } else {
        buildScene();
      }
    } else {
      // Gentle shake + redirect
      el.style.animation = 'shake 0.4s ease';
      await wait(400);
      el.style.animation = '';
      audio.playHmm();
      tts.speak(`That's a ${item.name}. ${instructionText}`);
      // Item stays, child can try again
    }
  }

  async function showReward() {
    board.innerHTML = '';
    const reward = document.createElement('div');
    reward.className = 'reward-screen fade-in';
    reward.innerHTML = `
      <div style="font-size:5rem;">🌟</div>
      <div class="game-prompt" style="margin-top:16px;">You found them all!</div>
      <div style="font-size:3rem;margin-top:12px;">Amazing!</div>
    `;
    board.appendChild(reward);
    audio.playCelebrate();
    tts.speak('Amazing! You found them all!');
  }

  buildScene();

  return () => {
    isRunning = false;
    container.innerHTML = '';
  };
}

// Add shake keyframes if not present
if (!document.getElementById('find-bird-anim')) {
  const style = document.createElement('style');
  style.id = 'find-bird-anim';
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-6px); }
      75% { transform: translateX(6px); }
    }
  `;
  document.head.appendChild(style);
}
