import { wait, shuffle } from '../core/gameData.js';

/**
 * Sort the Flock — Child must FIRST select a zone, THEN tap matching items.
 * Only uses emojis that are reliably red or blue on all platforms.
 */

const RED_ITEMS = [
  { emoji: '🍎', name: 'apple', tts: 'Red apple!' },
  { emoji: '❤️', name: 'heart', tts: 'Red heart!' },
  { emoji: '🌹', name: 'rose', tts: 'Red rose!' },
  { emoji: '🍓', name: 'strawberry', tts: 'Red strawberry!' },
  { emoji: '🍒', name: 'cherries', tts: 'Red cherries!' },
  { emoji: '🧨', name: 'firecracker', tts: 'Red firecracker!' },
  { emoji: '🌶️', name: 'pepper', tts: 'Red pepper!' },
  { emoji: '🔴', name: 'red circle', tts: 'Red circle!' },
  { emoji: '❣️', name: 'red heart', tts: 'Red heart!' },
  { emoji: '🍉', name: 'watermelon', tts: 'Red watermelon!' }
];

const BLUE_ITEMS = [
  { emoji: '🫐', name: 'blueberries', tts: 'Blue blueberries!' },
  { emoji: '💙', name: 'blue heart', tts: 'Blue heart!' },
  { emoji: '🔵', name: 'blue circle', tts: 'Blue circle!' },
  { emoji: '🐳', name: 'whale', tts: 'Blue whale!' },
  { emoji: '💎', name: 'diamond', tts: 'Blue diamond!' },
  { emoji: '🧊', name: 'ice', tts: 'Blue ice!' },
  { emoji: '🌊', name: 'wave', tts: 'Blue wave!' },
  { emoji: '🐟', name: 'fish', tts: 'Blue fish!' },
  { emoji: '🦋', name: 'butterfly', tts: 'Blue butterfly!' },
  { emoji: '🐬', name: 'dolphin', tts: 'Blue dolphin!' }
];

export function init(container, { tts, audio, state }) {
  let isRunning = true;
  let selectedZone = null; // 'red', 'blue', or null
  let sortedCount = 0;
  let totalItems = 0;
  let redRemaining = 0;
  let blueRemaining = 0;
  let items = [];
  let zoneAEl = null;
  let zoneBEl = null;
  let itemsRowEl = null;
  let promptEl = null;
  let redCount = 0;
  let blueCount = 0;

  const board = document.createElement('div');
  board.className = 'game-board';
  board.style.width = '100%';
  board.style.maxWidth = '440px';
  board.style.gap = '8px';
  container.appendChild(board);

  buildLevel();

  function buildLevel() {
    board.innerHTML = '';
    selectedZone = null;
    sortedCount = 0;

    // Pick 4 red and 4 blue items (8 total)
    const redItems = shuffle([...RED_ITEMS]).slice(0, 4).map(i => ({ ...i, zone: 'red' }));
    const blueItems = shuffle([...BLUE_ITEMS]).slice(0, 4).map(i => ({ ...i, zone: 'blue' }));
    items = shuffle([...redItems, ...blueItems]);
    totalItems = items.length;
    redCount = redItems.length;
    blueCount = blueItems.length;
    redRemaining = redCount;
    blueRemaining = blueCount;

    // Title
    const title = document.createElement('div');
    title.style.fontSize = '0.9rem';
    title.style.color = '#666';
    title.style.textAlign = 'center';
    title.textContent = 'Sort by Color!';
    board.appendChild(title);

    // Instruction prompt
    promptEl = document.createElement('div');
    promptEl.className = 'game-prompt';
    promptEl.style.fontSize = '1.2rem';
    promptEl.style.minHeight = '2.5rem';
    promptEl.style.display = 'flex';
    promptEl.style.alignItems = 'center';
    promptEl.style.justifyContent = 'center';
    promptEl.textContent = 'Tap a zone first!';
    board.appendChild(promptEl);

    // Zone counter
    const counter = document.createElement('div');
    counter.style.fontSize = '1.1rem';
    counter.style.fontWeight = '700';
    counter.style.color = '#7BA598';
    counter.style.textAlign = 'center';
    counter.id = 'sort-counter';
    counter.textContent = '0 sorted / 8 left';
    board.appendChild(counter);

    // Zones row
    const zonesRow = document.createElement('div');
    zonesRow.style.display = 'flex';
    zonesRow.style.gap = '12px';
    zonesRow.style.justifyContent = 'center';
    zonesRow.style.width = '100%';
    zonesRow.style.margin = '6px 0';
    board.appendChild(zonesRow);

    // Zone A — Red
    zoneAEl = makeZone({ key: 'red', emoji: '🔴', label: 'RED', color: '#E57373' });
    zoneAEl.addEventListener('click', () => selectZone('red'));
    zonesRow.appendChild(zoneAEl);

    // Zone B — Blue
    zoneBEl = makeZone({ key: 'blue', emoji: '🔵', label: 'BLUE', color: '#64B5F6' });
    zoneBEl.addEventListener('click', () => selectZone('blue'));
    zonesRow.appendChild(zoneBEl);

    // Items to sort
    itemsRowEl = document.createElement('div');
    itemsRowEl.style.display = 'flex';
    itemsRowEl.style.flexWrap = 'wrap';
    itemsRowEl.style.gap = '8px';
    itemsRowEl.style.justifyContent = 'center';
    itemsRowEl.style.margin = '6px 0';
    board.appendChild(itemsRowEl);

    for (const item of items) {
      const tile = makeItemTile(item);
      itemsRowEl.appendChild(tile);
    }

    // Home button
    const homeBtn = document.createElement('button');
    homeBtn.className = 'btn-secondary';
    homeBtn.style.marginTop = '6px';
    homeBtn.style.fontSize = '1rem';
    homeBtn.style.minHeight = '44px';
    homeBtn.innerHTML = '🏠 Home';
    homeBtn.addEventListener('click', () => {
      audio.playTap();
      const backBtn = document.getElementById('back-btn');
      if (backBtn) backBtn.click();
    });
    board.appendChild(homeBtn);

    wait(600).then(() => {
      if (isRunning) tts.speak('Sort the colors! Tap the red zone or the blue zone first!');
    });
  }

  function makeZone(cfg) {
    const el = document.createElement('div');
    el.className = 'tile';
    el.style.minWidth = '110px';
    el.style.minHeight = '80px';
    el.style.display = 'flex';
    el.style.flexDirection = 'column';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.gap = '4px';
    el.style.background = '#FFFFFF';
    el.style.border = `3px solid ${cfg.color}`;
    el.style.borderRadius = '14px';
    el.style.fontSize = '1rem';
    el.style.fontWeight = '700';
    el.style.color = '#3D3D3D';
    el.style.cursor = 'pointer';
    el.style.transition = 'all 0.3s ease';
    el.style.userSelect = 'none';
    el.style.boxShadow = `0 0 0 3px ${cfg.color}40`;
    el.innerHTML = `<span style="font-size:2.2rem;">${cfg.emoji}</span><span>${cfg.label}</span>`;
    el.dataset.zoneKey = cfg.key;
    return el;
  }

  function makeItemTile(item) {
    const el = document.createElement('div');
    el.className = 'tile';
    el.style.fontSize = '2.5rem';
    el.style.minWidth = '65px';
    el.style.minHeight = '65px';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.cursor = 'pointer';
    el.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
    el.style.border = '3px solid #E8E0D5';
    el.style.background = '#FFFFFF';
    el.textContent = item.emoji;
    el.dataset.zone = item.zone;
    el.dataset.name = item.name;
    el.dataset.sorted = 'false';
    el.dataset.tts = item.tts;
    el.style.userSelect = 'none';

    el.addEventListener('click', () => onItemTap(el));
    return el;
  }

  function selectZone(zone) {
    if (!isRunning) return;
    audio.playTap();

    selectedZone = zone;

    // Clear both zones
    zoneAEl.style.borderColor = '#E57373';
    zoneAEl.style.boxShadow = '0 0 0 3px #E5737340';
    zoneBEl.style.borderColor = '#64B5F6';
    zoneBEl.style.boxShadow = '0 0 0 3px #64B5F640';

    // Highlight selected zone
    if (zone === 'red') {
      zoneAEl.style.borderColor = '#4CAF50';
      zoneAEl.style.boxShadow = '0 0 0 6px rgba(76, 175, 80, 0.3)';
      promptEl.textContent = 'Tap red things!';
      tts.speak('Red zone! Now tap red things!');
    } else {
      zoneBEl.style.borderColor = '#4CAF50';
      zoneBEl.style.boxShadow = '0 0 0 6px rgba(76, 175, 80, 0.3)';
      promptEl.textContent = 'Tap blue things!';
      tts.speak('Blue zone! Now tap blue things!');
    }
  }

  async function onItemTap(el) {
    if (!isRunning || el.dataset.sorted === 'true') return;

    const itemZone = el.dataset.zone;
    const itemName = el.dataset.name;
    const itemTTS = el.dataset.tts;

    // No zone selected yet — prompt to select one
    if (!selectedZone) {
      audio.playTap();
      tts.speak('Tap the red zone or blue zone first!');
      promptEl.textContent = 'Tap a zone first!';
      // Flash both zones
      zoneAEl.style.animation = 'gentleShake 0.4s ease';
      zoneBEl.style.animation = 'gentleShake 0.4s ease';
      await wait(400);
      zoneAEl.style.animation = '';
      zoneBEl.style.animation = '';
      return;
    }

    // Wrong zone selected — redirect
    if (itemZone !== selectedZone) {
      audio.playTap();
      const correctZone = itemZone === 'red' ? 'red' : 'blue';
      promptEl.textContent = `That's ${itemZone}! Tap ${correctZone} zone!`;
      tts.speak(`That's ${itemZone}! Tap the ${correctZone} zone!`);

      // Switch highlight to correct zone
      zoneAEl.style.borderColor = '#E57373';
      zoneAEl.style.boxShadow = '0 0 0 3px #E5737340';
      zoneBEl.style.borderColor = '#64B5F6';
      zoneBEl.style.boxShadow = '0 0 0 3px #64B5F640';

      if (itemZone === 'red') {
        zoneAEl.style.borderColor = '#4CAF50';
        zoneAEl.style.boxShadow = '0 0 0 6px rgba(76, 175, 80, 0.3)';
      } else {
        zoneBEl.style.borderColor = '#4CAF50';
        zoneBEl.style.boxShadow = '0 0 0 6px rgba(76, 175, 80, 0.3)';
      }
      selectedZone = itemZone;
      return;
    }

    // Correct! Sort this item
    audio.playTap();
    el.dataset.sorted = 'true';
    el.style.pointerEvents = 'none';
    sortedCount++;

    if (itemZone === 'red') redRemaining--;
    else blueRemaining--;

    // Animate to selected zone
    const targetZone = itemZone === 'red' ? zoneAEl : zoneBEl;
    const zoneRect = targetZone.getBoundingClientRect();
    const itemRect = el.getBoundingClientRect();
    const dx = zoneRect.left + zoneRect.width / 2 - itemRect.left - itemRect.width / 2;
    const dy = zoneRect.top + zoneRect.height / 2 - itemRect.top - itemRect.height / 2;

    el.style.transform = `translate(${dx}px, ${dy}px) scale(0.4)`;
    el.style.opacity = '0';
    el.style.zIndex = '100';
    el.style.position = 'relative';

    await wait(400);
    el.remove();

    // Add badge to zone
    const badge = document.createElement('div');
    badge.style.fontSize = '1.2rem';
    badge.style.position = 'absolute';
    badge.style.pointerEvents = 'none';
    badge.textContent = el.textContent;
    targetZone.appendChild(badge);

    // Re-arrange badges
    const badges = targetZone.querySelectorAll('div');
    badges.forEach((b, i) => {
      b.style.transform = `translate(${(i * 12) - ((badges.length - 1) * 6)}px, -3px)`;
    });

    audio.playChime();

    // Update counter
    const remaining = totalItems - sortedCount;
    const counterEl = document.getElementById('sort-counter');
    if (counterEl) counterEl.textContent = `${sortedCount} sorted / ${remaining} left`;

    // TTS
    await tts.speak(itemTTS);

    // Check if current zone is empty
    if (selectedZone === 'red' && redRemaining === 0) {
      // Red zone empty, check if blue is also empty
      if (blueRemaining === 0) {
        await wait(500);
        showReward();
        return;
      }
      // Prompt to switch to blue
      promptEl.textContent = 'Red done! Tap blue zone!';
      await wait(200);
      tts.speak('Red zone is done! Now tap the blue zone!');
      // Switch highlight to blue
      zoneAEl.style.borderColor = '#E57373';
      zoneAEl.style.boxShadow = '0 0 0 3px #E5737340';
      zoneBEl.style.borderColor = '#4CAF50';
      zoneBEl.style.boxShadow = '0 0 0 6px rgba(76, 175, 80, 0.3)';
      selectedZone = 'blue';
    } else if (selectedZone === 'blue' && blueRemaining === 0) {
      if (redRemaining === 0) {
        await wait(500);
        showReward();
        return;
      }
      promptEl.textContent = 'Blue done! Tap red zone!';
      await wait(200);
      tts.speak('Blue zone is done! Now tap the red zone!');
      zoneBEl.style.borderColor = '#64B5F6';
      zoneBEl.style.boxShadow = '0 0 0 3px #64B5F640';
      zoneAEl.style.borderColor = '#4CAF50';
      zoneAEl.style.boxShadow = '0 0 0 6px rgba(76, 175, 80, 0.3)';
      selectedZone = 'red';
    }
  }

  async function showReward() {
    board.innerHTML = '';
    const reward = document.createElement('div');
    reward.className = 'reward-screen fade-in';
    reward.innerHTML = `
      <div style="font-size:4rem;">🎉</div>
      <div class="game-prompt" style="margin-top:12px;">All sorted!</div>
      <div style="font-size:1.3rem;color:#555;margin-top:8px;">Great job!</div>
      <div style="display:flex;gap:12px;margin-top:20px;flex-wrap:wrap;justify-content:center;">
        <button id="sf-replay" class="btn-primary">Play Again!</button>
        <button id="sf-home" class="btn-secondary">Home</button>
      </div>
    `;
    board.appendChild(reward);
    audio.playCelebrate();
    await tts.speak('You sorted all the colors! Great job!');

    reward.querySelector('#sf-replay').addEventListener('click', () => {
      audio.playTap();
      buildLevel();
    });
    reward.querySelector('#sf-home').addEventListener('click', () => {
      audio.playTap();
      const backBtn = document.getElementById('back-btn');
      if (backBtn) backBtn.click();
    });
  }

  return () => {
    isRunning = false;
    container.innerHTML = '';
    tts.cancel();
  };
}
