import { BIRDS, pickRandom, wait } from '../core/gameData.js';

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

  // ============================================================
  // MODE 1: "Birds Fly By!" - Dynamic flying birds
  // ============================================================
  async function startFlyByMode() {
    isBusy = true;
    clearBoard();
    const level = LEVELS[currentLevel];
    birdCount = Math.floor(Math.random() * (level.max - level.min + 1)) + level.min;

    const board = document.createElement('div');
    board.className = 'game-board';
    container.appendChild(board);

    // Level label
    const infoRow = document.createElement('div');
    infoRow.style.textAlign = 'center';
    infoRow.style.marginBottom = '0.5rem';
    infoRow.innerHTML = `<div style="font-size:1rem;color:#666;">Level ${currentLevel + 1} • Birds Fly By!</div>`;
    board.appendChild(infoRow);

    // The sky scene
    const scene = document.createElement('div');
    scene.style.position = 'relative';
    scene.style.width = '100%';
    scene.style.maxWidth = '520px';
    scene.style.height = '320px';
    scene.style.background = 'linear-gradient(180deg, #9BB8D3 0%, #C8D8E8 70%, #F5F0E8 70%)';
    scene.style.borderRadius = '20px';
    scene.style.overflow = 'hidden';
    scene.style.margin = '0 auto';
    scene.style.border = '3px solid #7BA598';
    board.appendChild(scene);

    // Cloud decorations
    scene.innerHTML = '<div style="position:absolute;top:10px;left:20px;font-size:1.5rem;opacity:0.6;">☁️</div>' +
                      '<div style="position:absolute;top:30px;right:40px;font-size:1.2rem;opacity:0.5;">☁️</div>' +
                      '<div style="position:absolute;top:60px;left:50%;font-size:1rem;opacity:0.4;">☁️</div>';

    // Pick birds for this round
    const pool = shuffle([...BIRDS]);
    const roundBirds = [];
    for (let i = 0; i < birdCount; i++) {
      roundBirds.push(pool[i % pool.length]);
    }

    // TTS: "Watch the birds fly by! Count them!"
    await wait(300);
    await tts.speak('Watch the birds fly by! Count them!');
    await wait(500);

    // Inject bird flight CSS animations
    if (!document.getElementById('bird-flight-styles')) {
      const style = document.createElement('style');
      style.id = 'bird-flight-styles';
      style.textContent = `
        @keyframes birdFlap {
          0%, 100% { transform: scaleY(1) rotate(0deg); }
          25% { transform: scaleY(0.85) rotate(-8deg); }
          50% { transform: scaleY(1) rotate(0deg); }
          75% { transform: scaleY(0.85) rotate(8deg); }
        }
        @keyframes birdBob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `;
      document.head.appendChild(style);
    }

    // Fly each bird across the screen — slower, with flapping
    let counted = 0;
    for (const bird of roundBirds) {
      const el = document.createElement('div');
      el.textContent = bird.emoji;
      el.style.fontSize = '2.5rem';
      el.style.position = 'absolute';
      el.style.left = '-60px';
      // Vary height but keep within sky area
      el.style.top = `${30 + (counted % 4) * 50 + Math.random() * 20}px`;
      el.style.zIndex = '2';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      // Flapping animation
      el.style.animation = 'birdFlap 0.35s ease-in-out infinite';
      el.style.transformOrigin = 'center center';
      scene.appendChild(el);

      // Start flight — slower (3.5s) with gentle bobbing
      requestAnimationFrame(() => {
        el.style.transition = 'left 3.5s ease-in-out, top 3.5s ease-in-out';
        el.style.left = 'calc(100% + 40px)';
        el.style.top = `${parseFloat(el.style.top) - 5 + Math.random() * 10}px`;
      });

      audio.playChirp();
      counted++;
      const countWord = NUMBER_WORDS[counted - 1] || counted.toString();
      await tts.speak(`${countWord}!`);

      // Wait for bird to mostly clear before next one
      await wait(1200);
    }

    await wait(300);

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

    // Number pad (big, simple)
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

          // Replay the birds flying back (show the count)
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
    // Birds fly back in reverse, showing each with count
    let counted = 0;
    for (let i = 0; i < birds.length; i++) {
      const bird = birds[i];
      const el = document.createElement('div');
      el.textContent = bird.emoji;
      el.style.fontSize = '2rem';
      el.style.position = 'absolute';
      el.style.left = '-40px';
      el.style.top = `${40 + (i % 3) * 60}px`;
      el.style.transition = 'left 0.8s ease-in-out';
      el.style.zIndex = '2';
      scene.appendChild(el);
      requestAnimationFrame(() => {
        el.style.left = '50%';
      });
      counted++;
      const countWord = NUMBER_WORDS[counted - 1] || counted.toString();
      await tts.speak(`${countWord}!`);
      await wait(400);
    }
    await wait(500);
    // Clear replay birds
    scene.querySelectorAll('div[style*="position: absolute"]').forEach(el => {
      if (!el.style.top.includes('px') || el.style.zIndex !== '2') return;
      el.style.left = '120%';
    });
  }

  async function showFlyByReward() {
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
  // MODE 2: "Count Them!" - Static birds on screen, tap to count
  // ============================================================
  async function startCountThemMode() {
    isBusy = false;
    clearBoard();
    const level = LEVELS[currentLevel];
    birdCount = Math.floor(Math.random() * (level.max - level.min + 1)) + level.min;
    let counted = 0;

    const board = document.createElement('div');
    board.className = 'game-board';
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

    const scene = document.createElement('div');
    scene.style.position = 'relative';
    scene.style.width = '100%';
    scene.style.maxWidth = '520px';
    scene.style.height = '320px';
    scene.style.background = 'linear-gradient(180deg, #9BB8D3 0%, #C8D8E8 70%, #F5F0E8 70%)';
    scene.style.borderRadius = '20px';
    scene.style.overflow = 'hidden';
    scene.style.margin = '0 auto';
    scene.style.border = '3px solid #7BA598';
    board.appendChild(scene);

    // Pick birds
    const pool = shuffle([...BIRDS]);
    const currentBirds = [];
    for (let i = 0; i < birdCount; i++) {
      currentBirds.push({ ...pool[i % pool.length], id: i });
    }

    // Place birds scattered
    const cols = birdCount <= 5 ? 3 : birdCount <= 10 ? 4 : 5;
    currentBirds.forEach((bird, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const jitterX = (Math.random() - 0.5) * 20;
      const jitterY = (Math.random() - 0.5) * 20;
      const x = col * 90 + 30 + jitterX;
      const y = row * 70 + 30 + jitterY;

      const el = document.createElement('div');
      el.textContent = bird.emoji;
      el.style.fontSize = '2.5rem';
      el.style.position = 'absolute';
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.cursor = 'pointer';
      el.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      el.style.userSelect = 'none';
      el.style.zIndex = '2';
      el.style.opacity = '0';
      el.style.transform = 'translateY(-20px) scale(0.7)';
      el.dataset.tapped = 'false';

      el.addEventListener('click', async () => {
        if (isBusy || el.dataset.tapped === 'true') return;
        isBusy = true;
        audio.playTap();
        audio.playChirp();
        counted++;

        el.dataset.tapped = 'true';
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

    // Level selector (small tiles below)
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
        // Visual feedback
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

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
