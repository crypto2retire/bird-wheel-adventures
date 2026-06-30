/** @file SortTheFlock.js - Categorization sorting game */

import { BIRDS, VEHICLES, shuffle, pickRandom, wait } from '../core/gameData.js';

// --- Size helpers (conceptual, since data has no size field) ---
const BIG_BIRDS = new Set(BIRDS.slice(0, 6).map(b => b.name));
const SMALL_BIRDS = new Set(BIRDS.slice(6).map(b => b.name));
function isBigVehicle(v) { return v.wheels >= 4; }

const FLYING_VEHICLES = new Set(['Airplane', 'Helicopter']);

const LEVELS = [
  { id: 1, name: 'Birds vs Vehicles', prompt: 'Put the BIRDS in the NEST!' },
  { id: 2, name: 'Red vs Blue',       prompt: 'Put the RED items in the RED zone!' },
  { id: 3, name: 'Big vs Small',      prompt: 'Put the BIG ones in the BIG zone!' },
  { id: 4, name: 'Flying vs Ground',  prompt: 'Put the FLYING ones in the SKY!' }
];

export function init(container, { tts, audio, state }) {
  let progress = state.getProgress('sortTheFlock') || { level: 1, totalPlayed: 0 };
  let levelIdx = Math.min((progress.level || 1) - 1, LEVELS.length - 1);
  let level = LEVELS[levelIdx];
  let isRunning = true;
  let cleanupFns = [];

  // Build board
  const board = document.createElement('div');
  board.className = 'game-board';
  container.appendChild(board);

  const promptEl = document.createElement('div');
  promptEl.className = 'game-prompt';
  promptEl.textContent = level.prompt;
  board.appendChild(promptEl);

  // Items area
  const itemsArea = document.createElement('div');
  itemsArea.className = 'tile-grid';
  itemsArea.style.gridTemplateColumns = 'repeat(4, 1fr)';
  itemsArea.style.gap = '16px';
  itemsArea.style.margin = '20px 0';
  board.appendChild(itemsArea);

  // Zones area
  const zonesArea = document.createElement('div');
  zonesArea.style.display = 'flex';
  zonesArea.style.gap = '16px';
  zonesArea.style.justifyContent = 'center';
  zonesArea.style.width = '100%';
  zonesArea.style.marginTop = '20px';
  board.appendChild(zonesArea);

  let zoneA, zoneB;
  let items = [];
  let correctCount = 0;

  function setupLevel() {
    correctCount = 0;
    itemsArea.innerHTML = '';
    zonesArea.innerHTML = '';

    switch (level.id) {
      case 1: { // Birds vs Vehicles
        const birds = pickRandom(BIRDS, 2);
        const vehicles = pickRandom(VEHICLES, 2);
        items = shuffle([...birds.map(b => ({ ...b, type: 'bird', zone: 'nest' })),
                         ...vehicles.map(v => ({ ...v, type: 'vehicle', zone: 'garage' }))]);
        zoneA = makeZone('Nest 🪺', 'nest');
        zoneB = makeZone('Garage 🏠', 'garage');
        break;
      }
      case 2: { // Red vs Blue
        const redBirds = BIRDS.filter(b => b.color === 'red');
        const blueBirds = BIRDS.filter(b => b.color === 'blue');
        const redVehicles = VEHICLES.filter(v => v.color === 'red');
        const blueVehicles = VEHICLES.filter(v => v.color === 'blue');
        const reds = pickRandom([...redBirds, ...redVehicles], 2);
        const blues = pickRandom([...blueBirds, ...blueVehicles], 2);
        items = shuffle([...reds.map(r => ({ ...r, zone: 'red' })),
                         ...blues.map(b => ({ ...b, zone: 'blue' }))]);
        zoneA = makeZone('Red 🔴', 'red');
        zoneB = makeZone('Blue 🔵', 'blue');
        break;
      }
      case 3: { // Big vs Small
        const bigBirds = BIRDS.filter(b => BIG_BIRDS.has(b.name));
        const smallBirds = BIRDS.filter(b => SMALL_BIRDS.has(b.name));
        const bigVehicles = VEHICLES.filter(v => isBigVehicle(v));
        const smallVehicles = VEHICLES.filter(v => !isBigVehicle(v));
        const bigs = pickRandom([...bigBirds, ...bigVehicles], 2);
        const smalls = pickRandom([...smallBirds, ...smallVehicles], 2);
        items = shuffle([...bigs.map(b => ({ ...b, zone: 'big' })),
                         ...smalls.map(s => ({ ...s, zone: 'small' }))]);
        zoneA = makeZone('Big 🐘', 'big');
        zoneB = makeZone('Small 🐜', 'small');
        break;
      }
      case 4: { // Flying vs Ground
        const flying = VEHICLES.filter(v => FLYING_VEHICLES.has(v.name));
        const ground = VEHICLES.filter(v => !FLYING_VEHICLES.has(v.name));
        const flyItems = pickRandom(flying, 2);
        const groundItems = pickRandom(ground, 2);
        items = shuffle([...flyItems.map(f => ({ ...f, zone: 'flying' })),
                         ...groundItems.map(g => ({ ...g, zone: 'ground' }))]);
        zoneA = makeZone('Sky ☁️', 'flying');
        zoneB = makeZone('Ground 🛣️', 'ground');
        break;
      }
    }

    zonesArea.appendChild(zoneA.el);
    zonesArea.appendChild(zoneB.el);

    for (const item of items) {
      const tile = makeTile(item);
      itemsArea.appendChild(tile);
    }
  }

  function makeZone(label, zoneKey) {
    const el = document.createElement('div');
    el.className = 'tile';
    el.dataset.zone = zoneKey;
    el.style.minWidth = '140px';
    el.style.minHeight = '100px';
    el.style.fontSize = '1.2rem';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.flexDirection = 'column';
    el.textContent = label;
    return { el, zoneKey };
  }

  function makeTile(item) {
    const el = document.createElement('div');
    el.className = 'tile fade-in';
    el.style.fontSize = '3rem';
    el.style.minHeight = '80px';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.cursor = 'pointer';
    el.style.transition = 'transform 0.6s ease, opacity 0.4s ease';
    el.innerHTML = `<div style="font-size:3rem;">${item.emoji}</div>`;
    el.dataset.zone = item.zone;
    el.dataset.name = item.name;

    el.addEventListener('click', () => onItemTap(el, item));
    el.addEventListener('touchstart', (e) => { e.preventDefault(); onItemTap(el, item); }, { passive: false });
    return el;
  }

  async function onItemTap(el, item) {
    if (!isRunning || el.classList.contains('sorted')) return;
    audio.playTap();

    const targetZone = el.dataset.zone === zoneA.zoneKey ? zoneA.el : zoneB.el;
    const isCorrect = el.dataset.zone === item.zone;

    if (isCorrect) {
      el.classList.add('sorted', 'correct');
      el.style.pointerEvents = 'none';

      // Animate to zone
      const zoneRect = targetZone.getBoundingClientRect();
      const itemRect = el.getBoundingClientRect();
      const dx = zoneRect.left + zoneRect.width / 2 - itemRect.left - itemRect.width / 2;
      const dy = zoneRect.top + zoneRect.height / 2 - itemRect.top - itemRect.height / 2;
      el.style.transform = `translate(${dx}px, ${dy}px) scale(0.5)`;
      el.style.opacity = '0';

      await wait(300);
      audio.playChime();
      await wait(200);
      audio.playCelebrate();

      const zoneName = zoneA.zoneKey === item.zone ? zoneA.el.textContent : zoneB.el.textContent;
      tts.speak(`The ${item.name} goes in the ${zoneName.replace(/[\s\p{Emoji}]/gu, '').trim()}!`);

      correctCount++;
      if (correctCount >= items.length) {
        await wait(800);
        showReward();
      }
    } else {
      // Gentle redirect: wrong zone tapped
      const wrongZone = el.dataset.zone !== zoneA.zoneKey ? zoneA.el : zoneB.el;
      const correctZoneName = targetZone.textContent.replace(/[\s\p{Emoji}]/gu, '').trim();
      el.classList.add('wrong');
      // Gentle shake
      el.style.animation = 'shake 0.4s ease';
      await wait(400);
      el.classList.remove('wrong');
      el.style.animation = '';

      tts.speak(`That's a ${item.name}! ${item.name}s go in the ${correctZoneName}!`);
      // Don't move the item, let child try again
    }
  }

  async function showReward() {
    board.innerHTML = '';
    const reward = document.createElement('div');
    reward.className = 'reward-screen fade-in';
    reward.innerHTML = `
      <div style="font-size:5rem;">🎉</div>
      <div class="game-prompt" style="margin-top:16px;">All sorted!</div>
      <div style="font-size:3rem;margin-top:12px;">Great job!</div>
    `;
    board.appendChild(reward);
    audio.playCelebrate();
    tts.speak('Great job! You sorted everything!');

    progress.totalPlayed = (progress.totalPlayed || 0) + 1;
    if (progress.level < LEVELS.length) {
      progress.level = (progress.level || 1) + 1;
    }
    state.updateProgress('sortTheFlock', progress);
  }

  setupLevel();
  wait(500).then(() => { if (isRunning) tts.speak(level.prompt); });

  return () => {
    isRunning = false;
    cleanupFns.forEach(fn => fn());
    container.innerHTML = '';
  };
}

// Add shake keyframes if not present (inline style injection for simplicity)
if (!document.getElementById('sort-flock-anim')) {
  const style = document.createElement('style');
  style.id = 'sort-flock-anim';
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-6px); }
      75% { transform: translateX(6px); }
    }
  `;
  document.head.appendChild(style);
}
