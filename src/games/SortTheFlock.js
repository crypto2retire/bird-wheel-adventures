import { BIRDS, VEHICLES, shuffle, pickRandom, wait } from '../core/gameData.js';

// --- Size helpers ---
const BIG_BIRDS = new Set(BIRDS.slice(0, 6).map(b => b.name));
const SMALL_BIRDS = new Set(BIRDS.slice(6).map(b => b.name));
function isBigVehicle(v) { return v.wheels >= 4; }
const FLYING_VEHICLES = new Set(['Airplane', 'Helicopter']);

const LEVELS = [
  { id: 1, name: 'Birds vs Vehicles', ttsPrompt: 'Put the birds in the nest!', targetZone: 'nest' },
  { id: 2, name: 'Red vs Blue', ttsPrompt: 'Put the red things in the red spot!', targetZone: 'red' },
  { id: 3, name: 'Big vs Small', ttsPrompt: 'Put the big ones in the big spot!', targetZone: 'big' },
  { id: 4, name: 'Flying vs Ground', ttsPrompt: 'Put the flying ones in the sky!', targetZone: 'flying' }
];

export function init(container, { tts, audio, state }) {
  let progress = state.getProgress('sortTheFlock') || { level: 1, totalPlayed: 0 };
  let levelIdx = Math.min((progress.level || 1) - 1, LEVELS.length - 1);
  let level = LEVELS[levelIdx];
  let isRunning = true;
  let cleanupFns = [];

  const board = document.createElement('div');
  board.className = 'game-board';
  container.appendChild(board);

  // Items area (center)
  const itemsArea = document.createElement('div');
  itemsArea.style.display = 'flex';
  itemsArea.style.flexWrap = 'wrap';
  itemsArea.style.gap = '16px';
  itemsArea.style.justifyContent = 'center';
  itemsArea.style.alignItems = 'center';
  itemsArea.style.minHeight = '120px';
  itemsArea.style.margin = '12px 0';
  board.appendChild(itemsArea);

  // Zones area (bottom, large visual zones)
  const zonesArea = document.createElement('div');
  zonesArea.style.display = 'flex';
  zonesArea.style.gap = '20px';
  zonesArea.style.justifyContent = 'center';
  zonesArea.style.width = '100%';
  zonesArea.style.marginTop = '16px';
  board.appendChild(zonesArea);

  let zoneA, zoneB;
  let items = [];
  let sortedCount = 0;

  function getZoneData(lvl) {
    switch (lvl.id) {
      case 1: return {
        birds: pickRandom(BIRDS, 3),
        vehicles: pickRandom(VEHICLES, 3),
        a: { key: 'nest', emoji: '🪺', label: 'Nest', tts: 'the nest' },
        b: { key: 'garage', emoji: '🏠', label: 'Garage', tts: 'the garage' }
      };
      case 2: {
        const redBirds = BIRDS.filter(b => b.color === 'red');
        const blueBirds = BIRDS.filter(b => b.color === 'blue');
        const redVehicles = VEHICLES.filter(v => v.color === 'red');
        const blueVehicles = VEHICLES.filter(v => v.color === 'blue');
        return {
          reds: pickRandom([...redBirds, ...redVehicles], 3),
          blues: pickRandom([...blueBirds, ...blueVehicles], 3),
          a: { key: 'red', emoji: '🔴', label: 'Red', tts: 'the red spot' },
          b: { key: 'blue', emoji: '🔵', label: 'Blue', tts: 'the blue spot' }
        };
      }
      case 3: {
        const bigBirds = BIRDS.filter(b => BIG_BIRDS.has(b.name));
        const smallBirds = BIRDS.filter(b => SMALL_BIRDS.has(b.name));
        const bigVehicles = VEHICLES.filter(v => isBigVehicle(v));
        const smallVehicles = VEHICLES.filter(v => !isBigVehicle(v));
        return {
          bigs: pickRandom([...bigBirds, ...bigVehicles], 3),
          smalls: pickRandom([...smallBirds, ...smallVehicles], 3),
          a: { key: 'big', emoji: '🐘', label: 'Big', tts: 'the big spot' },
          b: { key: 'small', emoji: '🐜', label: 'Small', tts: 'the small spot' }
        };
      }
      case 4: {
        const flying = VEHICLES.filter(v => FLYING_VEHICLES.has(v.name));
        const ground = VEHICLES.filter(v => !FLYING_VEHICLES.has(v.name));
        return {
          flyItems: pickRandom(flying, 3),
          groundItems: pickRandom(ground, 3),
          a: { key: 'flying', emoji: '☁️', label: 'Sky', tts: 'the sky' },
          b: { key: 'ground', emoji: '🛣️', label: 'Ground', tts: 'the ground' }
        };
      }
    }
  }

  function setupLevel() {
    sortedCount = 0;
    itemsArea.innerHTML = '';
    zonesArea.innerHTML = '';
    board.querySelector('.game-prompt')?.remove();
    board.querySelector('.game-subprompt')?.remove();

    // Create prompt (TTS-only, no reading required, but text shown for parent)
    const promptEl = document.createElement('div');
    promptEl.className = 'game-prompt';
    promptEl.textContent = level.ttsPrompt;
    board.insertBefore(promptEl, itemsArea);

    const subPrompt = document.createElement('div');
    subPrompt.className = 'game-subprompt';
    subPrompt.textContent = 'Tap any item to sort it!';
    board.insertBefore(subPrompt, zonesArea);

    const data = getZoneData(level);

    switch (level.id) {
      case 1: {
        items = shuffle([
          ...data.birds.map(b => ({ ...b, type: 'bird', zone: 'nest' })),
          ...data.vehicles.map(v => ({ ...v, type: 'vehicle', zone: 'garage' }))
        ]);
        zoneA = makeZone(data.a);
        zoneB = makeZone(data.b);
        break;
      }
      case 2: {
        items = shuffle([
          ...data.reds.map(r => ({ ...r, zone: 'red' })),
          ...data.blues.map(b => ({ ...b, zone: 'blue' }))
        ]);
        zoneA = makeZone(data.a);
        zoneB = makeZone(data.b);
        break;
      }
      case 3: {
        items = shuffle([
          ...data.bigs.map(b => ({ ...b, zone: 'big' })),
          ...data.smalls.map(s => ({ ...s, zone: 'small' }))
        ]);
        zoneA = makeZone(data.a);
        zoneB = makeZone(data.b);
        break;
      }
      case 4: {
        items = shuffle([
          ...data.flyItems.map(f => ({ ...f, zone: 'flying' })),
          ...data.groundItems.map(g => ({ ...g, zone: 'ground' }))
        ]);
        zoneA = makeZone(data.a);
        zoneB = makeZone(data.b);
        break;
      }
    }

    // Highlight the target zone (the one TTS mentioned)
    if (zoneA.zoneKey === level.targetZone) {
      zoneA.el.classList.add('target-zone');
    } else if (zoneB.zoneKey === level.targetZone) {
      zoneB.el.classList.add('target-zone');
    }

    zonesArea.appendChild(zoneA.el);
    zonesArea.appendChild(zoneB.el);

    for (const item of items) {
      const tile = makeTile(item);
      itemsArea.appendChild(tile);
    }

    // TTS prompt after a short delay
    wait(600).then(() => {
      if (isRunning) tts.speak(level.ttsPrompt + ' Tap any item to sort it!');
    });
  }

  function makeZone(cfg) {
    const el = document.createElement('div');
    el.className = 'tile zone-tile';
    el.dataset.zone = cfg.key;
    el.style.minWidth = '140px';
    el.style.minHeight = '100px';
    el.style.display = 'flex';
    el.style.flexDirection = 'column';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.gap = '4px';
    el.style.background = '#FFFFFF';
    el.style.border = '3px solid #E8E0D5';
    el.style.borderRadius = '16px';
    el.style.fontSize = '1.1rem';
    el.style.fontWeight = '700';
    el.style.color = '#3D3D3D';
    el.style.transition = 'border-color 0.3s ease, box-shadow 0.3s ease';
    el.innerHTML = `<span style="font-size:2.5rem;">${cfg.emoji}</span><span>${cfg.label}</span>`;
    return { el, zoneKey: cfg.key, ttsLabel: cfg.tts };
  }

  function makeTile(item) {
    const el = document.createElement('div');
    el.className = 'tile sort-item';
    el.style.fontSize = '3rem';
    el.style.minHeight = '80px';
    el.style.minWidth = '80px';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.cursor = 'pointer';
    el.style.transition = 'transform 0.5s ease, opacity 0.4s ease, border-color 0.3s ease';
    el.style.border = '3px solid #E8E0D5';
    el.innerHTML = `<div style="font-size:3rem;pointer-events:none;">${item.emoji}</div>`;
    el.dataset.zone = item.zone;
    el.dataset.name = item.name;

    el.addEventListener('click', () => onItemTap(el, item));
    return el;
  }

  async function onItemTap(el, item) {
    if (!isRunning || el.dataset.sorted === 'true') return;
    audio.playTap();
    el.dataset.sorted = 'true';
    el.style.pointerEvents = 'none';

    // Determine correct zone
    const correctZone = item.zone === zoneA.zoneKey ? zoneA : zoneB;
    const otherZone = item.zone === zoneA.zoneKey ? zoneB : zoneA;
    const isCorrect = level.targetZone === item.zone; // Did they tap what TTS asked for?

    // Animate the item to the correct zone (always go to correct zone, even if it wasn't the target)
    const zoneRect = correctZone.el.getBoundingClientRect();
    const itemRect = el.getBoundingClientRect();
    const dx = zoneRect.left + zoneRect.width / 2 - itemRect.left - itemRect.width / 2;
    const dy = zoneRect.top + zoneRect.height / 2 - itemRect.top - itemRect.height / 2;

    el.style.transform = `translate(${dx}px, ${dy}px) scale(0.4)`;
    el.style.opacity = '0';
    el.style.zIndex = '100';

    await wait(400);

    // Add the item's emoji to the zone (small icon badge)
    const badge = document.createElement('div');
    badge.style.fontSize = '1.5rem';
    badge.style.position = 'absolute';
    badge.style.pointerEvents = 'none';
    badge.textContent = item.emoji;
    correctZone.el.appendChild(badge);

    // Update badge positions so they don't overlap
    const badges = correctZone.el.querySelectorAll('div[style*="font-size: 1.5rem"]');
    badges.forEach((b, i) => {
      const offset = i * 12 - (badges.length - 1) * 6;
      b.style.transform = `translate(${offset}px, -6px)`;
    });

    audio.playChime();
    sortedCount++;

    // TTS feedback based on whether this was the target category
    if (isCorrect) {
      tts.speak(`Yes! ${item.name} goes to ${correctZone.ttsLabel}!`);
    } else {
      tts.speak(`${item.name} goes to ${correctZone.ttsLabel}!`);
    }

    if (sortedCount >= items.length) {
      await wait(1000);
      showReward();
    }
  }

  async function showReward() {
    board.innerHTML = '';
    const reward = document.createElement('div');
    reward.className = 'reward-screen fade-in';
    reward.innerHTML = `
      <div style="font-size:5rem;">🎉</div>
      <div class="game-prompt" style="margin-top:16px;">All sorted!</div>
      <div style="font-size:1.5rem;color:#555;margin-top:12px;">Great job!</div>
      <button id="sf-next" class="btn-primary" style="margin-top:24px;">Next Level</button>
    `;
    board.appendChild(reward);
    audio.playCelebrate();
    tts.speak('Great job! You sorted everything!');

    reward.querySelector('#sf-next').addEventListener('click', () => {
      audio.playTap();
      levelIdx = (levelIdx + 1) % LEVELS.length;
      level = LEVELS[levelIdx];
      progress.level = levelIdx + 1;
      progress.totalPlayed = (progress.totalPlayed || 0) + 1;
      state.updateProgress('sortTheFlock', progress);
      setupLevel();
    });
  }

  setupLevel();

  return () => {
    isRunning = false;
    cleanupFns.forEach(fn => fn());
    container.innerHTML = '';
  };
}

// Add target-zone pulsing style
if (!document.getElementById('sort-flock-style')) {
  const style = document.createElement('style');
  style.id = 'sort-flock-style';
  style.textContent = `
    .zone-tile.target-zone {
      border-color: #7BA598 !important;
      box-shadow: 0 0 0 4px rgba(123, 165, 152, 0.3);
      animation: targetPulse 1.5s ease-in-out infinite;
    }
    @keyframes targetPulse {
      0%, 100% { box-shadow: 0 0 0 4px rgba(123, 165, 152, 0.3); }
      50% { box-shadow: 0 0 0 8px rgba(123, 165, 152, 0.15); }
    }
    .sort-item {
      position: relative;
    }
    .zone-tile {
      position: relative;
      overflow: visible;
    }
  `;
  document.head.appendChild(style);
}
