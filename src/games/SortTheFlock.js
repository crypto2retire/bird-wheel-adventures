import { BIRDS, VEHICLES, shuffle, pickRandom, wait } from '../core/gameData.js';

const BIG_BIRDS = new Set(BIRDS.slice(0, 6).map(b => b.name));
const SMALL_BIRDS = new Set(BIRDS.slice(6).map(b => b.name));
function isBigVehicle(v) { return v.wheels >= 4; }
const FLYING_VEHICLES = new Set(['Airplane', 'Helicopter']);

const LEVELS = [
  { id: 1, name: 'Birds vs Vehicles', ttsPrompt: 'Birds go in the nest! Cars go in the garage!', zoneA: 'nest', zoneB: 'garage' },
  { id: 2, name: 'Red vs Blue', ttsPrompt: 'Red things go to the red spot! Blue things go to the blue spot!', zoneA: 'red', zoneB: 'blue' },
  { id: 3, name: 'Big vs Small', ttsPrompt: 'Big things go to the big spot! Small things go to the small spot!', zoneA: 'big', zoneB: 'small' },
  { id: 4, name: 'Flying vs Ground', ttsPrompt: 'Flying things go to the sky! Rolling things go to the ground!', zoneA: 'flying', zoneB: 'ground' }
];

export function init(container, { tts, audio, state }) {
  let isRunning = true;
  let progress = state.getProgress('sortTheFlock') || { level: 1, totalPlayed: 0 };
  let levelIdx = Math.min((progress.level || 1) - 1, LEVELS.length - 1);
  let level = LEVELS[levelIdx];
  let sortedCount = 0;
  let totalItems = 0;

  const board = document.createElement('div');
  board.className = 'game-board';
  board.style.width = '100%';
  board.style.maxWidth = '460px';
  board.style.gap = '10px';
  container.appendChild(board);

  // Build everything
  buildLevel();

  function buildLevel() {
    board.innerHTML = '';
    sortedCount = 0;

    // Progress bar
    const progressBar = document.createElement('div');
    progressBar.style.width = '100%';
    progressBar.style.marginBottom = '4px';
    progressBar.innerHTML = `<div style="font-size:0.9rem;color:#666;text-align:center;">Sort everything!</div><div id="sort-progress" style="font-size:1.3rem;font-weight:800;color:#7BA598;text-align:center;">0 / 0</div>`;
    board.appendChild(progressBar);

    // Prompt
    const prompt = document.createElement('div');
    prompt.className = 'game-prompt';
    prompt.style.fontSize = '1.2rem';
    prompt.textContent = level.ttsPrompt;
    board.appendChild(prompt);

    // Items to sort
    const itemsRow = document.createElement('div');
    itemsRow.style.display = 'flex';
    itemsRow.style.flexWrap = 'wrap';
    itemsRow.style.gap = '10px';
    itemsRow.style.justifyContent = 'center';
    itemsRow.style.margin = '8px 0';
    itemsRow.id = 'sort-items-row';
    board.appendChild(itemsRow);

    // Zones row
    const zonesRow = document.createElement('div');
    zonesRow.style.display = 'flex';
    zonesRow.style.gap = '12px';
    zonesRow.style.justifyContent = 'center';
    zonesRow.style.width = '100%';
    zonesRow.style.marginTop = '8px';
    board.appendChild(zonesRow);

    // Get data for this level
    const data = getLevelData(level);
    totalItems = data.items.length;

    // Update progress text
    const progressText = board.querySelector('#sort-progress');
    if (progressText) progressText.textContent = `0 / ${totalItems}`;

    // Create zone A
    const zoneA = makeZone(data.zoneAConfig);
    zonesRow.appendChild(zoneA);

    // Create zone B
    const zoneB = makeZone(data.zoneBConfig);
    zonesRow.appendChild(zoneB);

    // Create items
    for (const item of data.items) {
      const tile = makeItemTile(item, zoneA, zoneB);
      itemsRow.appendChild(tile);
    }

    // Home button
    const homeBtn = document.createElement('button');
    homeBtn.className = 'btn-secondary';
    homeBtn.style.marginTop = '8px';
    homeBtn.style.fontSize = '1rem';
    homeBtn.style.minHeight = '50px';
    homeBtn.innerHTML = '🏠 Home';
    homeBtn.addEventListener('click', () => {
      audio.playTap();
      const backBtn = document.getElementById('back-btn');
      if (backBtn) backBtn.click();
    });
    board.appendChild(homeBtn);

    // TTS after short delay
    wait(600).then(() => {
      if (isRunning) tts.speak(level.ttsPrompt + ' Tap any item to sort!');
    });
  }

  function getLevelData(lvl) {
    switch (lvl.id) {
      case 1: {
        const birds = pickRandom(BIRDS, 3);
        const vehicles = pickRandom(VEHICLES, 3);
        const items = shuffle([
          ...birds.map(b => ({ ...b, zone: 'nest' })),
          ...vehicles.map(v => ({ ...v, zone: 'garage' }))
        ]);
        return {
          items,
          zoneAConfig: { key: 'nest', emoji: '🪺', label: 'Nest', color: '#A8C686' },
          zoneBConfig: { key: 'garage', emoji: '🏠', label: 'Garage', color: '#D4A574' }
        };
      }
      case 2: {
        const redBirds = BIRDS.filter(b => b.color === 'red');
        const blueBirds = BIRDS.filter(b => b.color === 'blue');
        const redVehicles = VEHICLES.filter(v => v.color === 'red');
        const blueVehicles = VEHICLES.filter(v => v.color === 'blue');
        const reds = pickRandom([...redBirds, ...redVehicles], 3);
        const blues = pickRandom([...blueBirds, ...blueVehicles], 3);
        const items = shuffle([...reds.map(r => ({ ...r, zone: 'red' })), ...blues.map(b => ({ ...b, zone: 'blue' }))]);
        return {
          items,
          zoneAConfig: { key: 'red', emoji: '🔴', label: 'Red', color: '#E57373' },
          zoneBConfig: { key: 'blue', emoji: '🔵', label: 'Blue', color: '#64B5F6' }
        };
      }
      case 3: {
        const bigBirds = BIRDS.filter(b => BIG_BIRDS.has(b.name));
        const smallBirds = BIRDS.filter(b => SMALL_BIRDS.has(b.name));
        const bigVehicles = VEHICLES.filter(v => isBigVehicle(v));
        const smallVehicles = VEHICLES.filter(v => !isBigVehicle(v));
        const bigs = pickRandom([...bigBirds, ...bigVehicles], 3);
        const smalls = pickRandom([...smallBirds, ...smallVehicles], 3);
        const items = shuffle([...bigs.map(b => ({ ...b, zone: 'big' })), ...smalls.map(s => ({ ...s, zone: 'small' }))]);
        return {
          items,
          zoneAConfig: { key: 'big', emoji: '🐘', label: 'Big', color: '#D4A574' },
          zoneBConfig: { key: 'small', emoji: '🐜', label: 'Small', color: '#A8C686' }
        };
      }
      case 4: {
        const flying = VEHICLES.filter(v => FLYING_VEHICLES.has(v.name));
        const ground = VEHICLES.filter(v => !FLYING_VEHICLES.has(v.name));
        const flyItems = pickRandom(flying, 2);
        const groundItems = pickRandom(ground, 4);
        const items = shuffle([...flyItems.map(f => ({ ...f, zone: 'flying' })), ...groundItems.map(g => ({ ...g, zone: 'ground' }))]);
        return {
          items,
          zoneAConfig: { key: 'flying', emoji: '☁️', label: 'Sky', color: '#9BB8D3' },
          zoneBConfig: { key: 'ground', emoji: '🛣️', label: 'Ground', color: '#C4A882' }
        };
      }
    }
  }

  function makeZone(cfg) {
    const el = document.createElement('div');
    el.className = 'tile';
    el.style.minWidth = '120px';
    el.style.minHeight = '90px';
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
    el.style.boxShadow = `0 0 0 3px ${cfg.color}40`;
    el.innerHTML = `<span style="font-size:2.2rem;">${cfg.emoji}</span><span>${cfg.label}</span>`;
    el.dataset.zoneKey = cfg.key;
    return el;
  }

  function makeItemTile(item, zoneA, zoneB) {
    const el = document.createElement('div');
    el.className = 'tile';
    el.style.fontSize = '2.5rem';
    el.style.minWidth = '70px';
    el.style.minHeight = '70px';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.cursor = 'pointer';
    el.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
    el.style.border = '3px solid #E8E0D5';
    el.textContent = item.emoji;
    el.dataset.zone = item.zone;
    el.dataset.name = item.name;
    el.dataset.sorted = 'false';

    el.addEventListener('click', () => onItemTap(el, item, zoneA, zoneB));
    return el;
  }

  async function onItemTap(el, item, zoneA, zoneB) {
    if (!isRunning || el.dataset.sorted === 'true') return;

    audio.playTap();
    el.dataset.sorted = 'true';
    el.style.pointerEvents = 'none';

    // Determine correct zone
    const correctZone = item.zone === zoneA.dataset.zoneKey ? zoneA : zoneB;

    // Animate to zone
    const zoneRect = correctZone.getBoundingClientRect();
    const itemRect = el.getBoundingClientRect();
    const dx = zoneRect.left + zoneRect.width / 2 - itemRect.left - itemRect.width / 2;
    const dy = zoneRect.top + zoneRect.height / 2 - itemRect.top - itemRect.height / 2;

    el.style.transform = `translate(${dx}px, ${dy}px) scale(0.4)`;
    el.style.opacity = '0';
    el.style.zIndex = '100';
    el.style.position = 'relative';

    await wait(400);

    // Remove item from items row
    el.remove();

    // Add badge to zone
    const badge = document.createElement('div');
    badge.style.fontSize = '1.3rem';
    badge.style.position = 'absolute';
    badge.style.pointerEvents = 'none';
    badge.textContent = item.emoji;
    correctZone.appendChild(badge);

    // Re-arrange badges
    const badges = correctZone.querySelectorAll('div');
    badges.forEach((b, i) => {
      b.style.transform = `translate(${(i * 14) - ((badges.length - 1) * 7)}px, -4px)`;
    });

    audio.playChime();
    sortedCount++;

    // Update progress
    const progressText = board.querySelector('#sort-progress');
    if (progressText) progressText.textContent = `${sortedCount} / ${totalItems}`;

    // TTS
    await tts.speak(`${item.name} goes to the ${correctZone.querySelector('span:last-child')?.textContent || 'spot'}!`);

    // Check complete
    if (sortedCount >= totalItems) {
      await wait(600);
      showReward();
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
        <button id="sf-next" class="btn-primary">Next Level</button>
        <button id="sf-home" class="btn-secondary">Home</button>
      </div>
    `;
    board.appendChild(reward);

    audio.playCelebrate();
    await tts.speak('Great job! You sorted everything!');

    progress.totalPlayed = (progress.totalPlayed || 0) + 1;
    state.updateProgress('sortTheFlock', progress);

    reward.querySelector('#sf-next').addEventListener('click', () => {
      audio.playTap();
      levelIdx = (levelIdx + 1) % LEVELS.length;
      level = LEVELS[levelIdx];
      progress.level = levelIdx + 1;
      state.updateProgress('sortTheFlock', progress);
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
