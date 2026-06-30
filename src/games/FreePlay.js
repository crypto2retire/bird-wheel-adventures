import { BIRDS, VEHICLES, pickRandom, shuffle, wait } from '../core/gameData.js';

// ── FreePlay: open-ended exploration scene ─────────────────────────────────────

export function init(container, { tts, audio, state }) {
  const settings = state.getSettings();
  const progress = state.getProgress('freePlay') || { minutesPlayed: 0 };

  let currentScene = 'both'; // 'sky', 'road', or 'both'
  let cleanupFns = [];
  let minutesInterval = null;

  // ── Build DOM ──
  const board = document.createElement('div');
  board.className = 'game-board';
  board.style.position = 'relative';
  board.style.width = '100%';
  board.style.maxWidth = '600px';
  board.style.margin = '0 auto';

  const prompt = document.createElement('div');
  prompt.className = 'game-prompt';
  prompt.style.textAlign = 'center';
  prompt.style.marginBottom = '8px';

  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'btn-primary';
  toggleBtn.textContent = 'Switch Scene';
  toggleBtn.style.marginBottom = '12px';
  toggleBtn.style.fontSize = '1.2rem';
  toggleBtn.style.padding = '12px 24px';
  toggleBtn.style.minHeight = '60px';
  toggleBtn.style.cursor = 'pointer';
  toggleBtn.style.userSelect = 'none';
  toggleBtn.style.touchAction = 'manipulation';
  toggleBtn.setAttribute('aria-label', 'Switch between sky and road scenes');

  const scene = document.createElement('div');
  scene.className = 'scene';
  scene.style.position = 'relative';
  scene.style.width = '100%';
  scene.style.minHeight = '400px';
  scene.style.overflow = 'hidden';
  scene.style.borderRadius = '16px';
  scene.style.background = 'linear-gradient(to bottom, #87CEEB 0%, #87CEEB 50%, #90EE90 50%, #228B22 100%)';

  board.appendChild(prompt);
  board.appendChild(toggleBtn);
  board.appendChild(scene);
  container.appendChild(board);

  // ── Inline animation styles ──
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    @keyframes flyUpLoop {
      0%   { transform: translateY(0) scale(1); }
      30%  { transform: translateY(-30px) scale(1.1); }
      60%  { transform: translateY(-15px) scale(1.05); }
      100% { transform: translateY(0) scale(1); }
    }
    @keyframes driveAcross {
      0%   { transform: translateX(0); }
      25%  { transform: translateX(20px) scale(1.05); }
      50%  { transform: translateX(-20px) scale(1.05); }
      75%  { transform: translateX(10px) scale(1.02); }
      100% { transform: translateX(0); }
    }
    .anim-fly { animation: flyUpLoop 1.2s ease-in-out; }
    .anim-drive { animation: driveAcross 1s ease-in-out; }
  `;
  document.head.appendChild(styleEl);
  cleanupFns.push(() => styleEl.remove());

  // ── Helpers ──

  function speak(text) {
    if (settings.ttsEnabled !== false) {
      tts.speak(text);
    }
  }

  function randomPercent(min, max) {
    return Math.floor(min + Math.random() * (max - min));
  }

  function createSceneItem(item, type, leftPct, topPct) {
    const el = document.createElement('div');
    el.className = 'scene-item';
    el.style.position = 'absolute';
    el.style.left = `${leftPct}%`;
    el.style.top = `${topPct}%`;
    el.style.fontSize = '64px';
    el.style.cursor = 'pointer';
    el.style.userSelect = 'none';
    el.style.touchAction = 'manipulation';
    el.style.transition = 'transform 0.2s';
    el.style.zIndex = '10';
    el.style.padding = '8px';
    el.textContent = item.emoji;
    el.dataset.name = item.name;
    el.dataset.type = type;

    // Tap feedback (quick scale)
    el.addEventListener('pointerdown', () => {
      el.style.transform = 'scale(0.9)';
    });
    el.addEventListener('pointerup', () => {
      el.style.transform = 'scale(1)';
    });
    el.addEventListener('pointerleave', () => {
      el.style.transform = 'scale(1)';
    });

    el.addEventListener('click', (e) => {
      e.preventDefault();
      handleItemTap(el, item, type);
    });
    el.addEventListener('touchend', (e) => {
      e.preventDefault();
      handleItemTap(el, item, type);
    });

    return el;
  }

  function handleItemTap(el, item, type) {
    audio.playTap();

    // Remove any existing animation class, force reflow, then re-add
    el.classList.remove('anim-fly', 'anim-drive');
    void el.offsetWidth; // force reflow

    if (type === 'bird') {
      el.classList.add('anim-fly');
      audio.playChirp();

      const phrases = [
        `The ${item.name} is flying!`,
        `The ${item.name} says chirp chirp!`,
        `Look, the ${item.name} is in the sky!`,
        `The ${item.name} goes tweet tweet!`,
      ];
      speak(pickRandom(phrases, 1)[0]);
    } else {
      el.classList.add('anim-drive');
      audio.playBeep();

      const phrases = [
        `The ${item.name} is going fast!`,
        `Beep beep! Here comes the ${item.name}!`,
        `The ${item.name} is driving!`,
        `Vroom vroom! It's the ${item.name}!`,
      ];
      speak(pickRandom(phrases, 1)[0]);
    }

    // Remove animation class after it finishes
    setTimeout(() => {
      el.classList.remove('anim-fly', 'anim-drive');
    }, 1300);
  }

  function populateScene() {
    scene.innerHTML = '';

    const selectedBirds = pickRandom(BIRDS, Math.min(6, BIRDS.length));
    const selectedVehicles = pickRandom(VEHICLES, Math.min(6, VEHICLES.length));

    // Scene dimensions for collision avoidance (rough approximation)
    const sceneW = scene.clientWidth || 600;
    const sceneH = scene.clientHeight || 400;

    const placed = [];

    function isOverlapping(left, top, sizePercent) {
      const sizeDeg = (sizePercent / 100) * sceneW;
      const sizeV = (sizePercent / 100) * sceneH;
      for (const p of placed) {
        const dx = Math.abs(p.left - left) * sceneW / 100;
        const dy = Math.abs(p.top - top) * sceneH / 100;
        const minDist = (p.size + sizePercent) * 0.8; // slightly generous overlap
        if (Math.sqrt(dx * dx + dy * dy) < minDist * 3) return true; // 3 is rough pixel factor
      }
      return false;
    }

    function placeItem(item, type, minTop, maxTop) {
      let left, top;
      let attempts = 0;
      const sizePct = 12; // approximate percentage size of an item
      do {
        left = randomPercent(5, 90 - sizePct);
        top = randomPercent(minTop, maxTop - sizePct);
        attempts++;
      } while (isOverlapping(left, top, sizePct) && attempts < 20);

      placed.push({ left, top, size: sizePct });
      const el = createSceneItem(item, type, left, top);
      scene.appendChild(el);
    }

    if (currentScene === 'sky' || currentScene === 'both') {
      selectedBirds.forEach(bird => placeItem(bird, 'bird', 5, 45));
    }
    if (currentScene === 'road' || currentScene === 'both') {
      selectedVehicles.forEach(vehicle => placeItem(vehicle, 'vehicle', 55, 88));
    }
  }

  async function switchScene() {
    audio.playTap();
    const scenes = ['both', 'sky', 'road'];
    const idx = scenes.indexOf(currentScene);
    currentScene = scenes[(idx + 1) % scenes.length];

    prompt.textContent = currentScene === 'both'
      ? 'Sky and Road!'
      : currentScene === 'sky'
        ? 'Birds in the Sky!'
        : 'Vehicles on the Road!';
    speak(prompt.textContent);

    populateScene();
  }

  // ── Start ──

  toggleBtn.addEventListener('click', switchScene);
  toggleBtn.addEventListener('touchend', (e) => { e.preventDefault(); switchScene(); });

  prompt.textContent = 'Tap the birds and vehicles to play!';
  populateScene();

  // TTS after 500ms
  wait(500).then(() => {
    speak('Tap the birds and vehicles to play!');
  });

  // Track minutes played
  minutesInterval = setInterval(() => {
    progress.minutesPlayed = (progress.minutesPlayed || 0) + 1;
    state.updateProgress('freePlay', progress);
  }, 60000);

  // Handle window resize to re-populate for better positioning
  let resizeTimeout;
  function onResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => populateScene(), 300);
  }
  window.addEventListener('resize', onResize);
  cleanupFns.push(() => window.removeEventListener('resize', onResize));

  // ── Cleanup ──
  return function cleanup() {
    if (minutesInterval) clearInterval(minutesInterval);
    cleanupFns.forEach(fn => fn());
    container.innerHTML = '';
  };
}
