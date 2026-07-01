import { BIRDS, shuffle, wait } from '../core/gameData.js';

/**
 * BirdCounter.js - Two interactive counting modes:
 * 1. "Birds Fly By!" - Birds fly across screen, child counts them, then answers how many
 * 2. "Count Them!" - Birds appear on screen, child taps each to count
 */

const NUMBER_WORDS = [
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
  'twenty-one', 'twenty-two', 'twenty-three', 'twenty-four', 'twenty-five', 'twenty-six', 'twenty-seven', 'twenty-eight', 'twenty-nine', 'thirty'
];

const LEVELS = [
  { label: '1-5 birds', min: 1, max: 5 },
  { label: '6-10 birds', min: 6, max: 10 },
  { label: '11-15 birds', min: 11, max: 15 },
  { label: '16-20 birds', min: 16, max: 20 }
];

const COLOR_MAP = {
  red:    '#D32F2F',
  blue:   '#1976D2',
  brown:  '#8D6E63',
  green:  '#388E3C',
  black:  '#333333',
  yellow: '#F9A825',
  pink:   '#F06292',
  white:  '#E0E0E0'
};

const WING_COLOR_MAP = {
  red:    '#B71C1C',
  blue:   '#1565C0',
  brown:  '#6D4C41',
  green:  '#2E7D32',
  black:  '#212121',
  yellow: '#F57F17',
  pink:   '#E91E63',
  white:  '#BDBDBD'
};

export function init(container, { tts, audio, state }) {
  let currentLevel = 0;
  let stars = 0;
  let totalPlayed = 0;
  let birdCount = 0;
  let isBusy = false;
  let cleanupCallbacks = [];

  const progress = state.getProgress('birdCounter') || {};
  if (progress.level !== undefined) currentLevel = Math.min(progress.level - 1, LEVELS.length - 1);
  if (progress.stars) stars = progress.stars;
  if (progress.totalPlayed) totalPlayed = progress.totalPlayed;

  function saveProgress() {
    state.updateProgress('birdCounter', { level: currentLevel + 1, stars, totalPlayed });
  }

  function clearBoard() {
    container.innerHTML = '';
    cleanupCallbacks.forEach(cb => cb());
    cleanupCallbacks = [];
  }

  // Add a prominent HOME button to every screen
  function addHomeButton(board) {
    const homeRow = document.createElement('div');
    homeRow.style.cssText = 'display:flex;justify-content:flex-end;margin-bottom:0.5rem;';
    const homeBtn = document.createElement('button');
    homeBtn.className = 'btn-secondary';
    homeBtn.style.cssText = 'min-height:40px;padding:6px 16px;font-size:0.9rem;font-weight:700;display:flex;align-items:center;gap:6px;';
    homeBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
      HOME
    `;
    homeBtn.addEventListener('click', () => {
      audio.playTap();
      // Trigger the global goHome by dispatching a custom event that main.js listens for
      window.dispatchEvent(new CustomEvent('gohome'));
    });
    homeRow.appendChild(homeBtn);
    board.appendChild(homeRow);
    return homeBtn;
  }

  // ============================================================
  // CSS-DRAWN SCENE BUILDER
  // ============================================================
  function createScene() {
    const scene = document.createElement('div');
    scene.className = 'bird-scene';
    scene.style.position = 'relative';
    scene.style.width = '100%';
    scene.style.maxWidth = '520px';
    scene.style.height = '360px';
    scene.style.background = 'linear-gradient(180deg, #7EC8E3 0%, #A8D8EA 45%, #C8E6C9 85%, #81C784 85%)';
    scene.style.borderRadius = '20px';
    scene.style.overflow = 'hidden';
    scene.style.margin = '0 auto';
    scene.style.border = '3px solid #7BA598';
    return scene;
  }

  function addSkyElements(scene) {
    // Sun
    const sun = document.createElement('div');
    sun.style.cssText = 'position:absolute;top:15px;right:25px;width:40px;height:40px;background:#FFD54F;border-radius:50%;box-shadow:0 0 15px #FFD54F;';
    scene.appendChild(sun);

    // Clouds
    const clouds = [
      { top: 20, left: 30, size: 1.5, opacity: 0.7 },
      { top: 50, left: '60%', size: 1.2, opacity: 0.5 },
      { top: 80, left: '40%', size: 1, opacity: 0.4 }
    ];
    clouds.forEach(c => {
      const el = document.createElement('div');
      el.style.cssText = `
        position:absolute;top:${c.top}px;left:${typeof c.left === 'number' ? c.left + 'px' : c.left};
        font-size:${c.size}rem;opacity:${c.opacity};pointer-events:none;z-index:1;
      `;
      el.textContent = '☁️';
      scene.appendChild(el);
    });
  }

  function addGroundAndTrees(scene) {
    // Ground strip
    const ground = document.createElement('div');
    ground.style.cssText = `
      position:absolute;bottom:0;left:0;width:100%;height:50px;
      background:linear-gradient(180deg, #81C784 0%, #66BB6A 50%, #4CAF50 100%);
      border-radius:0 0 17px 17px;z-index:2;
    `;
    scene.appendChild(ground);

    // Hill in background
    const hill = document.createElement('div');
    hill.style.cssText = `
      position:absolute;bottom:30px;left:-20px;width:200px;height:60px;
      background:#A5D6A7;border-radius:50% 50% 0 0;z-index:1;
    `;
    scene.appendChild(hill);

    const hill2 = document.createElement('div');
    hill2.style.cssText = `
      position:absolute;bottom:25px;right:-30px;width:250px;height:70px;
      background:#81C784;border-radius:50% 50% 0 0;z-index:1;
    `;
    scene.appendChild(hill2);

    // Trees
    const treePositions = [
      { left: 30, scale: 1 },
      { left: 120, scale: 0.8 },
      { left: 380, scale: 1.1 },
      { left: 450, scale: 0.7 }
    ];
    treePositions.forEach(pos => {
      const tree = document.createElement('div');
      tree.style.cssText = `
        position:absolute;bottom:40px;left:${pos.left}px;
        transform:scale(${pos.scale});z-index:3;pointer-events:none;
      `;

      const trunk = document.createElement('div');
      trunk.style.cssText = 'width:8px;height:30px;background:#8D6E63;margin:0 auto;border-radius:2px;';
      tree.appendChild(trunk);

      const foliage = document.createElement('div');
      foliage.style.cssText = `
        width:36px;height:36px;background:#43A047;border-radius:50%;
        margin-top:-10px;margin-left:-14px;position:relative;
      `;
      tree.appendChild(foliage);

      const foliage2 = document.createElement('div');
      foliage2.style.cssText = `
        width:28px;height:28px;background:#388E3C;border-radius:50%;
        position:absolute;top:-22px;left:4px;
      `;
      foliage.appendChild(foliage2);

      scene.appendChild(tree);
    });

    // Small flowers/bushes
    const bushes = [{ left: 70 }, { left: 200 }, { left: 320 }, { left: 420 }];
    bushes.forEach(b => {
      const bush = document.createElement('div');
      bush.style.cssText = `
        position:absolute;bottom:42px;left:${b.left}px;
        width:16px;height:10px;background:#66BB6A;border-radius:50%;z-index:2;
      `;
      scene.appendChild(bush);
    });
  }

  // ============================================================
  // CSS-DRAWN BIRD BUILDER
  // ============================================================
  function createBirdElement(bird, index) {
    const color = COLOR_MAP[bird.color] || '#555';
    const wingColor = WING_COLOR_MAP[bird.color] || '#444';

    const wrapper = document.createElement('div');
    wrapper.className = 'css-bird';
    wrapper.style.cssText = `
      position:absolute;left:-70px;top:40px;width:55px;height:35px;z-index:4;
      will-change:transform;pointer-events:none;
    `;

    // Tail
    const tail = document.createElement('div');
    tail.style.cssText = `
      position:absolute;left:-10px;top:14px;width:0;height:0;
      border-right:14px solid ${color};border-top:7px solid transparent;
      border-bottom:7px solid transparent;
    `;
    wrapper.appendChild(tail);

    // Body
    const body = document.createElement('div');
    body.style.cssText = `
      position:absolute;left:2px;top:10px;width:34px;height:20px;
      background:${color};border-radius:50%;z-index:2;
    `;
    wrapper.appendChild(body);

    // Head
    const head = document.createElement('div');
    head.style.cssText = `
      position:absolute;right:-2px;top:4px;width:18px;height:18px;
      background:${color};border-radius:50%;z-index:3;
    `;
    wrapper.appendChild(head);

    // Beak
    const beak = document.createElement('div');
    beak.style.cssText = `
      position:absolute;right:-11px;top:9px;width:0;height:0;
      border-left:12px solid #FFA726;border-top:5px solid transparent;
      border-bottom:5px solid transparent;z-index:3;
    `;
    wrapper.appendChild(beak);

    // Eye
    const eye = document.createElement('div');
    eye.style.cssText = `
      position:absolute;right:4px;top:8px;width:5px;height:5px;
      background:#fff;border-radius:50%;z-index:4;
    `;
    wrapper.appendChild(eye);
    const pupil = document.createElement('div');
    pupil.style.cssText = `
      position:absolute;right:5px;top:9px;width:2.5px;height:2.5px;
      background:#333;border-radius:50%;z-index:5;
    `;
    wrapper.appendChild(pupil);

    // Wing (the flapping part!)
    const wing = document.createElement('div');
    wing.style.cssText = `
      position:absolute;left:8px;top:2px;width:26px;height:16px;
      background:${wingColor};border-radius:50% 50% 50% 50% / 70% 70% 30% 30%;
      transform-origin:4px 14px;z-index:4;opacity:0.9;
      animation:birdFlapWing 0.38s ease-in-out infinite;
    `;
    wrapper.appendChild(wing);

    // Give each bird a slightly different flap speed for natural variation
    wing.style.animationDelay = `${(index * 0.07) % 0.3}s`;
    wing.style.animationDuration = `${0.32 + Math.random() * 0.12}s`;

    return wrapper;
  }

  // ============================================================
  // FLAPPING ANIMATION STYLES
  // ============================================================
  function injectBirdStyles() {
    if (document.getElementById('bird-counter-styles')) return;
    const style = document.createElement('style');
    style.id = 'bird-counter-styles';
    style.textContent = `
      @keyframes birdFlapWing {
        0%   { transform: rotate(-30deg) scaleY(1); }
        25%  { transform: rotate(15deg) scaleY(0.85); }
        50%  { transform: rotate(40deg) scaleY(0.7); }
        75%  { transform: rotate(10deg) scaleY(0.9); }
        100% { transform: rotate(-30deg) scaleY(1); }
      }
      @keyframes birdGlide {
        0%   { transform: translateY(0px); }
        50%  { transform: translateY(-6px); }
        100% { transform: translateY(0px); }
      }
      @keyframes birdFlyAcross {
        from { left: -70px; }
        to   { left: calc(100% + 40px); }
      }
    `;
    document.head.appendChild(style);
  }

  // ============================================================
  // MODE 1: "Birds Fly By!" - Flying birds with scenery
  // ============================================================
  async function startFlyByMode() {
    isBusy = true;
    clearBoard();
    injectBirdStyles();
    const level = LEVELS[currentLevel];
    birdCount = Math.floor(Math.random() * (level.max - level.min + 1)) + level.min;

    const board = document.createElement('div');
    board.className = 'game-board';
    addHomeButton(board);
    container.appendChild(board);

    // Level label
    const infoRow = document.createElement('div');
    infoRow.style.textAlign = 'center';
    infoRow.style.marginBottom = '0.5rem';
    infoRow.innerHTML = `<div style="font-size:1rem;color:#666;">Level ${currentLevel + 1} • Birds Fly By!</div>`;
    board.appendChild(infoRow);

    // The sky scene with ground and trees
    const scene = createScene();
    addSkyElements(scene);
    addGroundAndTrees(scene);
    board.appendChild(scene);

    // Pick birds for this round
    const pool = shuffle([...BIRDS]);
    const roundBirds = [];
    for (let i = 0; i < birdCount; i++) {
      roundBirds.push(pool[i % pool.length]);
    }

    // TTS intro
    await wait(300);
    await tts.speak('Watch the birds fly by! Count them!');
    await wait(500);

    // Fly each bird across the screen
    let counted = 0;
    for (const bird of roundBirds) {
      // Staggered heights — birds fly at different sky levels (above trees)
      const heightBands = [35, 75, 115, 155, 100, 60, 130, 50];
      const baseTop = heightBands[counted % heightBands.length] + (Math.random() * 15 - 7);

      const el = createBirdElement(bird, counted);
      el.style.top = `${baseTop}px`;
      scene.appendChild(el);

      // Start flight — slower (4.5s) with smooth movement
      requestAnimationFrame(() => {
        el.style.transition = 'left 4.5s ease-in-out, top 4.5s ease-in-out';
        el.style.left = 'calc(100% + 40px)';
        el.style.top = `${baseTop - 5 + Math.random() * 10}px`;
      });

      // Gentle bobbing while flying
      el.style.animation = 'birdGlide 2s ease-in-out infinite';
      el.style.animationDelay = `${Math.random() * 0.5}s`;

      audio.playChirp();
      counted++;
      const countWord = NUMBER_WORDS[counted - 1] || counted.toString();
      await tts.speak(`${countWord}!`);

      // Wait before next bird (longer gap for counting)
      await wait(1400);
    }

    await wait(400);

    // All birds flew past. Now ask: How many?
    const questionBoard = document.createElement('div');
    questionBoard.style.display = 'flex';
    questionBoard.style.flexDirection = 'column';
    questionBoard.style.alignItems = 'center';
    questionBoard.style.gap = '16px';
    questionBoard.style.marginTop = '20px';
    board.appendChild(questionBoard);

    const question = document.createElement('div');
    question.className = 'game-prompt';
    question.style.fontSize = '1.5rem';
    question.textContent = 'How many birds flew by?';
    questionBoard.appendChild(question);

    await tts.speak('How many birds flew by?');
    await wait(200);

    // Number pad
    const maxNum = Math.min(birdCount + 3, 20);
    const startNum = Math.max(1, birdCount - 3);
    const numbers = [];
    for (let i = startNum; i <= maxNum; i++) numbers.push(i);

    const pad = document.createElement('div');
    pad.style.display = 'grid';
    pad.style.gridTemplateColumns = 'repeat(5, 1fr)';
    pad.style.gap = '10px';
    pad.style.maxWidth = '400px';
    pad.style.width = '100%';
    questionBoard.appendChild(pad);

    for (const num of numbers) {
      const btn = document.createElement('button');
      btn.className = 'number-btn';
      btn.textContent = num;
      btn.style.minHeight = '60px';
      btn.style.fontSize = '1.5rem';
      btn.addEventListener('click', async () => {
        if (isBusy) return;
        isBusy = true;
        audio.playTap();

        if (num === birdCount) {
          btn.classList.add('correct');
          audio.playChime();
          await wait(200);
          audio.playCelebrate();
          await tts.speak(`Yes! ${birdCount} birds flew by! Great counting!`);
          stars++;
          totalPlayed++;
          saveProgress();
          await wait(1000);
          showFlyByReward();
        } else {
          btn.classList.add('wrong');
          await wait(200);
          btn.classList.remove('wrong');
          audio.playHmm();
          await tts.speak(`Let's count again!`);

          await replayBirds(roundBirds, scene);
          await wait(300);
          await tts.speak(`There were ${birdCount} birds! Try again!`);
          isBusy = false;
        }
      });
      pad.appendChild(btn);
    }
    isBusy = false;
  }

  async function replayBirds(birds, scene) {
    let counted = 0;
    for (let i = 0; i < birds.length; i++) {
      const bird = birds[i];
      const el = createBirdElement(bird, i);
      el.style.top = `${40 + (i % 3) * 60}px`;
      el.style.left = '-60px';
      el.style.transition = 'left 1s ease-in-out';
      scene.appendChild(el);
      requestAnimationFrame(() => {
        el.style.left = '50%';
      });
      counted++;
      const countWord = NUMBER_WORDS[counted - 1] || counted.toString();
      await tts.speak(`${countWord}!`);
      await wait(500);
      // Fade out
      el.style.transition = 'opacity 0.5s';
      el.style.opacity = '0';
      await wait(400);
    }
    await wait(500);
  }

  async function showFlyByReward() {
    clearBoard();
    const board = document.createElement('div');
    board.className = 'game-board';
    addHomeButton(board);

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
      startFlyByMode();
    });

    const moreBtn = document.createElement('button');
    moreBtn.className = 'btn-secondary';
    moreBtn.textContent = 'More Birds!';
    moreBtn.addEventListener('click', async () => {
      audio.playTap();
      moreBtn.disabled = true;
      if (currentLevel < LEVELS.length - 1) currentLevel++;
      await wait(300);
      startFlyByMode();
    });

    btnRow.appendChild(nextBtn);
    btnRow.appendChild(moreBtn);
    reward.appendChild(bigEmoji);
    reward.appendChild(praise);
    reward.appendChild(btnRow);
    board.appendChild(reward);
    container.appendChild(board);
  }

  // ============================================================
  // MODE 2: "Count Them!" - Static birds on screen with scenery
  // ============================================================
  async function startCountThemMode() {
    isBusy = false;
    clearBoard();
    injectBirdStyles();
    const level = LEVELS[currentLevel];
    birdCount = Math.floor(Math.random() * (level.max - level.min + 1)) + level.min;
    let counted = 0;

    const board = document.createElement('div');
    board.className = 'game-board';
    addHomeButton(board);
    container.appendChild(board);

    const infoRow = document.createElement('div');
    infoRow.style.textAlign = 'center';
    infoRow.style.marginBottom = '0.5rem';
    infoRow.innerHTML = `<div style="font-size:1rem;color:#666;">Level ${currentLevel + 1} • Count Them!</div>`;
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

    // The scene with scenery
    const scene = createScene();
    addSkyElements(scene);
    addGroundAndTrees(scene);
    board.appendChild(scene);

    // Pick birds
    const pool = shuffle([...BIRDS]);
    const currentBirds = [];
    for (let i = 0; i < birdCount; i++) {
      currentBirds.push({ ...pool[i % pool.length], id: i });
    }

    // Place birds in the sky area (above trees)
    const cols = birdCount <= 5 ? 3 : birdCount <= 10 ? 4 : 5;
    const rows = Math.ceil(birdCount / cols);
    const cellW = 440 / cols;
    const cellH = 180 / Math.max(rows, 3);

    currentBirds.forEach((bird, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const jitterX = (Math.random() - 0.5) * 20;
      const jitterY = (Math.random() - 0.5) * 20;
      const x = col * cellW + 30 + jitterX;
      const y = row * cellH + 30 + jitterY;

      const el = createBirdElement(bird, i);
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.pointerEvents = 'auto';
      el.style.cursor = 'pointer';
      el.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      el.style.opacity = '0';
      el.style.transform = 'translateY(-20px) scale(0.7)';
      el.dataset.tapped = 'false';

      // Add a gentle hover animation
      el.style.animation = 'birdGlide 2s ease-in-out infinite';
      el.style.animationDelay = `${Math.random() * 0.8}s`;

      el.addEventListener('click', async () => {
        if (isBusy || el.dataset.tapped === 'true') return;
        isBusy = true;
        audio.playTap();
        audio.playChirp();
        counted++;

        el.dataset.tapped = 'true';
        el.style.animation = 'none';
        el.style.transform = 'scale(1.2) translateY(-8px)';
        el.style.opacity = '0.5';
        el.style.pointerEvents = 'none';

        counter.textContent = `${counted} / ${birdCount}`;
        const countWord = NUMBER_WORDS[counted - 1] || counted.toString();
        await tts.speak(`${countWord}!`);

        await wait(300);
        el.style.transform = 'scale(1) translateY(0)';

        if (counted === birdCount) {
          await wait(400);
          audio.playChime();
          await wait(200);
          audio.playCelebrate();
          await tts.speak(`You counted ${birdCount} birds! Great counting!`);
          stars++;
          totalPlayed++;
          saveProgress();
          await wait(1000);
          showCountReward();
        } else {
          await tts.speak('Tap the next bird!');
          isBusy = false;
        }
      });

      scene.appendChild(el);
      // Staggered fly-in
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0) scale(1)';
      }, 150 + i * 100);
    });

    await wait(500 + birdCount * 100);
    await tts.speak(`Tap the birds to count them! There are ${birdCount} birds!`);
  }

  async function showCountReward() {
    clearBoard();
    const board = document.createElement('div');
    board.className = 'game-board';
    addHomeButton(board);

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
      startCountThemMode();
    });

    const moreBtn = document.createElement('button');
    moreBtn.className = 'btn-secondary';
    moreBtn.textContent = 'More Birds!';
    moreBtn.addEventListener('click', async () => {
      audio.playTap();
      moreBtn.disabled = true;
      if (currentLevel < LEVELS.length - 1) currentLevel++;
      await wait(300);
      startCountThemMode();
    });

    btnRow.appendChild(nextBtn);
    btnRow.appendChild(moreBtn);
    reward.appendChild(bigEmoji);
    reward.appendChild(praise);
    reward.appendChild(btnRow);
    board.appendChild(reward);
    container.appendChild(board);
  }

  // ============================================================
  // Start screen with mode selection
  // ============================================================
  function showModeSelect() {
    clearBoard();
    const board = document.createElement('div');
    board.className = 'game-board';
    addHomeButton(board);

    const title = document.createElement('div');
    title.className = 'game-prompt';
    title.textContent = 'Bird Counter';
    board.appendChild(title);

    const sub = document.createElement('div');
    sub.className = 'game-subprompt';
    sub.textContent = 'How do you want to count?';
    board.appendChild(sub);

    const emoji = document.createElement('div');
    emoji.style.fontSize = '4rem';
    emoji.style.textAlign = 'center';
    emoji.style.marginBottom = '1rem';
    emoji.textContent = '🐦🐦🐦';
    board.appendChild(emoji);

    const modes = [
      { id: 'flyby', title: 'Birds Fly By!', emoji: '✈️', desc: 'Watch birds fly past!' },
      { id: 'count', title: 'Count Them!', emoji: '👆', desc: 'Tap birds to count!' }
    ];

    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
    grid.style.gap = '16px';
    grid.style.maxWidth = '400px';
    grid.style.width = '100%';

    for (const mode of modes) {
      const tile = document.createElement('button');
      tile.className = 'tile';
      tile.style.display = 'flex';
      tile.style.flexDirection = 'column';
      tile.style.alignItems = 'center';
      tile.style.justifyContent = 'center';
      tile.style.gap = '0.5rem';
      tile.style.padding = '1rem';
      tile.style.minHeight = '120px';
      tile.innerHTML = `
        <span style="font-size:2.5rem">${mode.emoji}</span>
        <span style="font-size:1.1rem;font-weight:700">${mode.title}</span>
        <span style="font-size:0.85rem;color:#666">${mode.desc}</span>
      `;
      tile.addEventListener('click', async () => {
        audio.playTap();
        tile.disabled = true;
        await wait(300);
        if (mode.id === 'flyby') {
          startFlyByMode();
        } else {
          startCountThemMode();
        }
      });
      grid.appendChild(tile);
    }
    board.appendChild(grid);

    // Level selector
    const levelRow = document.createElement('div');
    levelRow.style.marginTop = '1.5rem';
    levelRow.style.display = 'grid';
    levelRow.style.gridTemplateColumns = 'repeat(2, 1fr)';
    levelRow.style.gap = '10px';
    levelRow.style.maxWidth = '360px';
    levelRow.style.width = '100%';

    LEVELS.forEach((lvl, idx) => {
      const tile = document.createElement('button');
      tile.className = 'tile';
      tile.style.display = 'flex';
      tile.style.flexDirection = 'column';
      tile.style.alignItems = 'center';
      tile.style.justifyContent = 'center';
      tile.style.gap = '0.25rem';
      tile.style.padding = '0.5rem';
      tile.style.minHeight = '70px';
      tile.innerHTML = `<span style="font-size:1.5rem">🐦</span><span style="font-size:0.8rem;font-weight:bold">${lvl.label}</span>`;
      if (idx === currentLevel) {
        tile.style.borderColor = '#7BA598';
        tile.style.background = '#f0f7e8';
      }
      tile.addEventListener('click', async () => {
        audio.playTap();
        currentLevel = idx;
        levelRow.querySelectorAll('.tile').forEach(t => {
          t.style.borderColor = '#E8E0D5';
          t.style.background = '#FFFFFF';
        });
        tile.style.borderColor = '#7BA598';
        tile.style.background = '#f0f7e8';
      });
      levelRow.appendChild(tile);
    });
    board.appendChild(levelRow);

    container.appendChild(board);
  }

  showModeSelect();

  return () => {
    clearBoard();
    tts.cancel();
  };
}
