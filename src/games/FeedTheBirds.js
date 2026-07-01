/** @file FeedTheBirds.js - Feed birds to bring them closer! Uses child's photo. */

import { shuffle, wait } from '../core/gameData.js';
import { buildBird, injectBirdStyles, celebrateWin, getBirdVisualFrom } from '../core/BirdRenderer.js';
import { BIRDS } from '../core/gameData.js';

const FOODS = [
  { name: 'Seeds', emoji: '🌾', color: '#D4A574' },
  { name: 'Berries', emoji: '🍓', color: '#E53935' },
  { name: 'Bread', emoji: '🍞', color: '#FFA726' }
];

export function init(container, { tts, audio, state }) {
  let stars = 0;
  let totalPlayed = 0;
  let isBusy = false;
  let selectedFood = null;

  const progress = state.getProgress('feedTheBirds') || {};
  if (progress.stars) stars = progress.stars;
  if (progress.totalPlayed) totalPlayed = progress.totalPlayed;

  function saveProgress() {
    state.updateProgress('feedTheBirds', { stars, totalPlayed });
  }

  function clearBoard() {
    container.innerHTML = '';
  }

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
      window.dispatchEvent(new CustomEvent('gohome'));
    });
    homeRow.appendChild(homeBtn);
    board.appendChild(homeRow);
  }

  // ============================================================
  // SCENE BUILDER
  // ============================================================
  function createScene() {
    const scene = document.createElement('div');
    scene.style.cssText = `
      position:relative;width:100%;max-width:520px;height:420px;
      background:linear-gradient(180deg, #7EC8E3 0%, #A8D8EA 45%, #C8E6C9 75%, #81C784 75%);
      border-radius:20px;overflow:hidden;margin:0 auto;border:3px solid #7BA598;
    `;

    // Sun
    const sun = document.createElement('div');
    sun.style.cssText = 'position:absolute;top:15px;right:25px;width:40px;height:40px;background:#FFD54F;border-radius:50%;box-shadow:0 0 15px #FFD54F;';
    scene.appendChild(sun);

    // Clouds
    const clouds = [
      { top: 20, left: 30, size: 1.5, opacity: 0.7 },
      { top: 55, left: '60%', size: 1.2, opacity: 0.5 },
      { top: 85, left: '40%', size: 1, opacity: 0.4 }
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

    // Hills
    const hill = document.createElement('div');
    hill.style.cssText = 'position:absolute;bottom:60px;left:-20px;width:200px;height:60px;background:#A5D6A7;border-radius:50% 50% 0 0;z-index:1;';
    scene.appendChild(hill);
    const hill2 = document.createElement('div');
    hill2.style.cssText = 'position:absolute;bottom:55px;right:-30px;width:250px;height:70px;background:#81C784;border-radius:50% 50% 0 0;z-index:1;';
    scene.appendChild(hill2);

    // Trees
    [30, 130, 390, 470].forEach((left, i) => {
      const tree = document.createElement('div');
      tree.style.cssText = `position:absolute;bottom:70px;left:${left}px;transform:scale(${0.8 + (i % 2) * 0.2});z-index:3;pointer-events:none;`;
      tree.innerHTML = `<div style="width:8px;height:30px;background:#8D6E63;margin:0 auto;border-radius:2px;"></div>
        <div style="width:36px;height:36px;background:#43A047;border-radius:50%;margin-top:-10px;margin-left:-14px;position:relative;">
          <div style="width:28px;height:28px;background:#388E3C;border-radius:50%;position:absolute;top:-22px;left:4px;"></div>
        </div>`;
      scene.appendChild(tree);
    });

    // Flowers/bushes
    [70, 200, 330, 430].forEach(left => {
      const bush = document.createElement('div');
      bush.style.cssText = `position:absolute;bottom:72px;left:${left}px;width:16px;height:10px;background:#66BB6A;border-radius:50%;z-index:2;`;
      scene.appendChild(bush);
    });

    // Ground strip
    const ground = document.createElement('div');
    ground.style.cssText = 'position:absolute;bottom:0;left:0;width:100%;height:70px;background:linear-gradient(180deg, #81C784 0%, #66BB6A 50%, #4CAF50 100%);border-radius:0 0 17px 17px;z-index:2;';
    scene.appendChild(ground);

    return scene;
  }

  // ============================================================
  // MAIN GAME
  // ============================================================
  async function startGame() {
    isBusy = false;
    clearBoard();
    injectBirdStyles();

    const board = document.createElement('div');
    board.className = 'game-board';
    addHomeButton(board);
    container.appendChild(board);

    // Prompt
    const prompt = document.createElement('div');
    prompt.className = 'game-prompt';
    prompt.style.fontSize = '1.2rem';
    prompt.textContent = 'Feed the birds!';
    board.appendChild(prompt);

    const subPrompt = document.createElement('div');
    subPrompt.style.cssText = 'font-size:0.95rem;color:#666;text-align:center;margin-bottom:0.5rem;';
    subPrompt.textContent = 'Tap food, then tap a bird!';
    board.appendChild(subPrompt);

    // Scene
    const scene = createScene();
    board.appendChild(scene);

    // Child's photo at bottom center
    const childWrapper = document.createElement('div');
    childWrapper.style.cssText = `
      position:absolute;bottom:2px;left:50%;transform:translateX(-50%);
      z-index:5;display:flex;flex-direction:column;align-items:center;
    `;
    const childImg = document.createElement('img');
    childImg.src = '/assets/child.jpg';
    childImg.style.cssText = 'width:70px;height:70px;border-radius:50%;border:3px solid #fff;object-fit:cover;box-shadow:0 2px 8px rgba(0,0,0,0.2);';
    childImg.alt = 'You';
    childWrapper.appendChild(childImg);
    const childLabel = document.createElement('div');
    childLabel.style.cssText = 'font-size:0.7rem;font-weight:700;color:#fff;background:rgba(0,0,0,0.4);padding:2px 8px;border-radius:10px;margin-top:2px;';
    childLabel.textContent = 'You';
    childWrapper.appendChild(childLabel);
    scene.appendChild(childWrapper);

    // Food selector bar
    const foodBar = document.createElement('div');
    foodBar.style.cssText = 'display:flex;gap:12px;justify-content:center;margin-top:12px;flex-wrap:wrap;';
    board.appendChild(foodBar);

    FOODS.forEach((food, idx) => {
      const btn = document.createElement('button');
      btn.className = 'tile';
      btn.style.cssText = 'min-height:60px;min-width:80px;display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px;';
      btn.innerHTML = `<span style="font-size:1.8rem">${food.emoji}</span><span style="font-size:0.8rem;font-weight:700">${food.name}</span>`;
      btn.dataset.food = food.name;
      btn.addEventListener('click', () => {
        if (isBusy) return;
        audio.playTap();
        selectedFood = food;
        // Highlight selected food
        foodBar.querySelectorAll('button').forEach(b => {
          b.style.borderColor = '#E8E0D5';
          b.style.background = '#FFFFFF';
        });
        btn.style.borderColor = '#7BA598';
        btn.style.background = '#f0f7e8';
        tts.speak(`${food.name}!`);
      });
      foodBar.appendChild(btn);
    });

    // Pick 3 birds
    const pool = shuffle([...BIRDS]);
    const birdData = [pool[0], pool[1], pool[2]];
    const birds = [];
    let fedCount = 0;

    // Place birds at starting positions (far away, scattered)
    const startPositions = [
      { x: 40, y: 50 },   // top left
      { x: 400, y: 80 },  // top right
      { x: 220, y: 30 }   // top center
    ];

    birdData.forEach((bird, i) => {
      const visual = getBirdVisualFrom(bird);
      const el = buildBird(visual, { direction: 'right', index: i });
      el.style.left = `${startPositions[i].x}px`;
      el.style.top = `${startPositions[i].y}px`;
      el.style.transition = 'left 1.5s ease-in-out, top 1.5s ease-in-out, transform 1.5s ease';
      el.style.pointerEvents = 'auto';
      el.style.cursor = 'pointer';
      el.style.zIndex = '6';
      el.dataset.fed = '0';
      el.dataset.index = String(i);

      // Gentle hover animation
      el.style.animation = 'birdGlide 2s ease-in-out infinite';
      el.style.animationDelay = `${Math.random() * 0.8}s`;

      el.addEventListener('click', async () => {
        if (isBusy) return;

        if (!selectedFood) {
          tts.speak('Pick food first!');
          // Shake food bar to draw attention
          foodBar.style.animation = 'none';
          foodBar.offsetHeight; // force reflow
          foodBar.style.animation = 'shake 0.4s ease-in-out';
          return;
        }

        isBusy = true;
        audio.playTap();

        const fed = parseInt(el.dataset.fed) + 1;
        el.dataset.fed = String(fed);

        // Bird flies toward child (closer each feed)
        const targetX = 160 + i * 80; // spread across center-bottom
        const targetY = 280 - fed * 50; // gets lower (closer) each time
        el.style.left = `${targetX}px`;
        el.style.top = `${targetY}px`;
        el.style.animation = 'none';

        // TTS
        const birdName = bird.name;
        await tts.speak(`${birdName} wants ${selectedFood.name}!`);
        await wait(400);

        // Eating animation: bird bobs/pecks
        el.style.transform = 'scale(1.15) translateY(5px)';
        await wait(200);
        el.style.transform = 'scale(1) translateY(0)';
        await wait(200);
        el.style.transform = 'scale(1.1) translateY(3px)';
        await wait(200);
        el.style.transform = 'scale(1) translateY(0)';

        audio.playChirp();
        await tts.speak(`Yum!`);
        await wait(300);

        fedCount++;

        if (fedCount >= birdData.length) {
          // All birds fed once — celebrate!
          await wait(400);
          audio.playChime();
          await wait(200);
          await tts.speak(`You fed all the birds! Great job!`);
          stars++;
          totalPlayed++;
          saveProgress();
          await wait(800);
          await celebrateWin({ message: 'Great Feeding!', tts, audio, pauseMs: 2000 });
          showReward();
        } else {
          // Reset food selection for next bird
          selectedFood = null;
          foodBar.querySelectorAll('button').forEach(b => {
            b.style.borderColor = '#E8E0D5';
            b.style.background = '#FFFFFF';
          });
          await tts.speak('Pick more food for the next bird!');
          isBusy = false;
        }
      });

      scene.appendChild(el);
      birds.push({ el, data: bird, visual });
    });

    await wait(300);
    await tts.speak('Feed the birds! Tap a food, then tap a bird!');
  }

  async function showReward() {
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
    praise.textContent = 'You fed all the birds!';

    const childImg = document.createElement('img');
    childImg.src = '/assets/child.jpg';
    childImg.style.cssText = 'width:80px;height:80px;border-radius:50%;border:4px solid #FFD54F;object-fit:cover;margin:10px auto;';

    const btnRow = document.createElement('div');
    btnRow.style.display = 'flex';
    btnRow.style.gap = '16px';
    btnRow.style.flexWrap = 'wrap';
    btnRow.style.justifyContent = 'center';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn-primary';
    nextBtn.textContent = 'Feed Again!';
    nextBtn.addEventListener('click', async () => {
      audio.playTap();
      nextBtn.disabled = true;
      await wait(300);
      startGame();
    });

    btnRow.appendChild(nextBtn);
    reward.appendChild(bigEmoji);
    reward.appendChild(childImg);
    reward.appendChild(praise);
    reward.appendChild(btnRow);
    board.appendChild(reward);
    container.appendChild(board);
  }

  // ============================================================
  // Start screen
  // ============================================================
  function showStartScreen() {
    clearBoard();
    const board = document.createElement('div');
    board.className = 'game-board';
    addHomeButton(board);

    const title = document.createElement('div');
    title.className = 'game-prompt';
    title.textContent = 'Feed the Birds!';
    board.appendChild(title);

    const sub = document.createElement('div');
    sub.className = 'game-subprompt';
    sub.textContent = 'The birds are hungry!';
    board.appendChild(sub);

    // Child photo with birds around it
    const hero = document.createElement('div');
    hero.style.cssText = 'position:relative;width:200px;height:200px;margin:1rem auto;';

    const childImg = document.createElement('img');
    childImg.src = '/assets/child.jpg';
    childImg.style.cssText = 'width:140px;height:140px;border-radius:50%;border:4px solid #7BA598;object-fit:cover;position:absolute;bottom:0;left:50%;transform:translateX(-50%);';
    hero.appendChild(childImg);

    // Birds around the child
    const birdPositions = [
      { top: 0, left: '20%', emoji: '🐦' },
      { top: 10, left: '60%', emoji: '🦅' },
      { top: 40, left: '5%', emoji: '🦆' },
      { top: 50, left: '75%', emoji: '🦉' }
    ];
    birdPositions.forEach(pos => {
      const b = document.createElement('div');
      b.style.cssText = `position:absolute;top:${pos.top}px;left:${pos.left};font-size:2rem;animation:birdGlide 2s ease-in-out infinite;`;
      b.textContent = pos.emoji;
      hero.appendChild(b);
    });

    board.appendChild(hero);

    const startBtn = document.createElement('button');
    startBtn.className = 'btn-primary';
    startBtn.style.fontSize = '1.3rem';
    startBtn.style.minHeight = '60px';
    startBtn.style.padding = '12px 32px';
    startBtn.textContent = 'Start Feeding!';
    startBtn.addEventListener('click', async () => {
      audio.playTap();
      startBtn.disabled = true;
      await wait(300);
      startGame();
    });
    board.appendChild(startBtn);

    container.appendChild(board);

    // Add shake animation if not already present
    if (!document.getElementById('feed-bird-styles')) {
      const style = document.createElement('style');
      style.id = 'feed-bird-styles';
      style.textContent = `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
        }
      `;
      document.head.appendChild(style);
    }

    setTimeout(() => {
      tts.speak('Feed the Birds! Tap Start Feeding to play!');
    }, 500);
  }

  showStartScreen();

  return () => {
    clearBoard();
    tts.cancel();
  };
}
