import { wait, shuffle } from '../core/gameData.js';

/**
 * Sort the Flock — Color sorting game with progressive levels.
 * Each level unlocks a new color pair.
 * Level 1: Red vs Blue
 * Level 2: Green vs Yellow
 * Level 3: Orange vs Purple
 * Level 4: Black vs White
 */

// Each level has its own clearly-colored items
const COLOR_LEVELS = [
  {
    name: 'Red vs Blue',
    zoneA: { key: 'red', emoji: '🔴', label: 'RED', color: '#E57373', ttsLabel: 'red' },
    zoneB: { key: 'blue', emoji: '🔵', label: 'BLUE', color: '#64B5F6', ttsLabel: 'blue' },
    itemsA: [
      { emoji: '🍎', name: 'apple', tts: 'Red apple!' },
      { emoji: '❤️', name: 'heart', tts: 'Red heart!' },
      { emoji: '🌹', name: 'rose', tts: 'Red rose!' },
      { emoji: '🍓', name: 'strawberry', tts: 'Red strawberry!' },
      { emoji: '🍒', name: 'cherries', tts: 'Red cherries!' },
      { emoji: '🧨', name: 'firecracker', tts: 'Red firecracker!' },
      { emoji: '🌶️', name: 'pepper', tts: 'Red pepper!' },
      { emoji: '🔴', name: 'red circle', tts: 'Red circle!' }
    ],
    itemsB: [
      { emoji: '🫐', name: 'blueberries', tts: 'Blue blueberries!' },
      { emoji: '💙', name: 'blue heart', tts: 'Blue heart!' },
      { emoji: '🔵', name: 'blue circle', tts: 'Blue circle!' },
      { emoji: '🐳', name: 'whale', tts: 'Blue whale!' },
      { emoji: '💎', name: 'diamond', tts: 'Blue diamond!' },
      { emoji: '🧊', name: 'ice', tts: 'Blue ice!' },
      { emoji: '🌊', name: 'wave', tts: 'Blue wave!' },
      { emoji: '🐟', name: 'fish', tts: 'Blue fish!' }
    ]
  },
  {
    name: 'Green vs Yellow',
    zoneA: { key: 'green', emoji: '🟢', label: 'GREEN', color: '#81C784', ttsLabel: 'green' },
    zoneB: { key: 'yellow', emoji: '🟡', label: 'YELLOW', color: '#FFD54F', ttsLabel: 'yellow' },
    itemsA: [
      { emoji: '🍏', name: 'green apple', tts: 'Green apple!' },
      { emoji: '💚', name: 'green heart', tts: 'Green heart!' },
      { emoji: '🐸', name: 'frog', tts: 'Green frog!' },
      { emoji: '🌿', name: 'herb', tts: 'Green leaf!' },
      { emoji: '🥝', name: 'kiwi', tts: 'Green kiwi!' },
      { emoji: '🥦', name: 'broccoli', tts: 'Green broccoli!' },
      { emoji: '🟢', name: 'green circle', tts: 'Green circle!' },
      { emoji: '🍀', name: 'clover', tts: 'Green clover!' }
    ],
    itemsB: [
      { emoji: '🍋', name: 'lemon', tts: 'Yellow lemon!' },
      { emoji: '💛', name: 'yellow heart', tts: 'Yellow heart!' },
      { emoji: '🌻', name: 'sunflower', tts: 'Yellow sunflower!' },
      { emoji: '🍌', name: 'banana', tts: 'Yellow banana!' },
      { emoji: '🟡', name: 'yellow circle', tts: 'Yellow circle!' },
      { emoji: '🧀', name: 'cheese', tts: 'Yellow cheese!' },
      { emoji: '🐥', name: 'chick', tts: 'Yellow chick!' },
      { emoji: '⭐', name: 'star', tts: 'Yellow star!' }
    ]
  },
  {
    name: 'Orange vs Purple',
    zoneA: { key: 'orange', emoji: '🟠', label: 'ORANGE', color: '#FF8A65', ttsLabel: 'orange' },
    zoneB: { key: 'purple', emoji: '🟣', label: 'PURPLE', color: '#9575CD', ttsLabel: 'purple' },
    itemsA: [
      { emoji: '🍊', name: 'orange', tts: 'Orange orange!' },
      { emoji: '🧡', name: 'orange heart', tts: 'Orange heart!' },
      { emoji: '🎃', name: 'pumpkin', tts: 'Orange pumpkin!' },
      { emoji: '🥕', name: 'carrot', tts: 'Orange carrot!' },
      { emoji: '🟠', name: 'orange circle', tts: 'Orange circle!' },
      { emoji: '🦊', name: 'fox', tts: 'Orange fox!' },
      { emoji: '🍁', name: 'maple leaf', tts: 'Orange leaf!' },
      { emoji: '🏀', name: 'basketball', tts: 'Orange ball!' }
    ],
    itemsB: [
      { emoji: '🍇', name: 'grapes', tts: 'Purple grapes!' },
      { emoji: '💜', name: 'purple heart', tts: 'Purple heart!' },
      { emoji: '🍆', name: 'eggplant', tts: 'Purple eggplant!' },
      { emoji: '🟣', name: 'purple circle', tts: 'Purple circle!' },
      { emoji: '🔮', name: 'crystal ball', tts: 'Purple crystal!' },
      { emoji: '🦕', name: 'dino', tts: 'Purple dinosaur!' },
      { emoji: '🌂', name: 'umbrella', tts: 'Purple umbrella!' },
      { emoji: '🎆', name: 'fireworks', tts: 'Purple fireworks!' }
    ]
  },
  {
    name: 'Black vs White',
    zoneA: { key: 'black', emoji: '⚫', label: 'BLACK', color: '#555555', ttsLabel: 'black' },
    zoneB: { key: 'white', emoji: '⚪', label: 'WHITE', color: '#BDBDBD', ttsLabel: 'white' },
    itemsA: [
      { emoji: '🐈‍⬛', name: 'black cat', tts: 'Black cat!' },
      { emoji: '🖤', name: 'black heart', tts: 'Black heart!' },
      { emoji: '⚫', name: 'black circle', tts: 'Black circle!' },
      { emoji: '🎱', name: '8 ball', tts: 'Black ball!' },
      { emoji: '🐧', name: 'penguin', tts: 'Black penguin!' },
      { emoji: '🕷️', name: 'spider', tts: 'Black spider!' },
      { emoji: '🦨', name: 'skunk', tts: 'Black skunk!' },
      { emoji: '🎓', name: 'graduation', tts: 'Black hat!' }
    ],
    itemsB: [
      { emoji: '🤍', name: 'white heart', tts: 'White heart!' },
      { emoji: '⚪', name: 'white circle', tts: 'White circle!' },
      { emoji: '🦢', name: 'swan', tts: 'White swan!' },
      { emoji: '🥚', name: 'egg', tts: 'White egg!' },
      { emoji: '❄️', name: 'snowflake', tts: 'White snowflake!' },
      { emoji: '🍚', name: 'rice', tts: 'White rice!' },
      { emoji: '🦷', name: 'tooth', tts: 'White tooth!' },
      { emoji: '🏐', name: 'volleyball', tts: 'White ball!' }
    ]
  }
];

export function init(container, { tts, audio, state }) {
  let isRunning = true;
  let selectedZone = null;
  let sortedCount = 0;
  let totalItems = 0;
  let zoneARemaining = 0;
  let zoneBRemaining = 0;
  let zoneAEl = null;
  let zoneBEl = null;
  let promptEl = null;

  const progress = state.getProgress('sortTheFlock') || { level: 1, totalPlayed: 0 };
  let levelIdx = Math.min((progress.level || 1) - 1, COLOR_LEVELS.length - 1);
  let level = COLOR_LEVELS[levelIdx];

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
    level = COLOR_LEVELS[levelIdx];

    // Pick 4 items from each zone
    const zoneAItems = shuffle([...level.itemsA]).slice(0, 4).map(i => ({ ...i, zone: level.zoneA.key }));
    const zoneBItems = shuffle([...level.itemsB]).slice(0, 4).map(i => ({ ...i, zone: level.zoneB.key }));
    const items = shuffle([...zoneAItems, ...zoneBItems]);
    totalItems = items.length;
    zoneARemaining = zoneAItems.length;
    zoneBRemaining = zoneBItems.length;

    // Level title
    const title = document.createElement('div');
    title.style.fontSize = '0.9rem';
    title.style.color = '#666';
    title.style.textAlign = 'center';
    title.textContent = `Level ${levelIdx + 1}: ${level.name}`;
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

    // Counter
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

    zoneAEl = makeZone(level.zoneA);
    zoneAEl.addEventListener('click', () => selectZone(level.zoneA.key));
    zonesRow.appendChild(zoneAEl);

    zoneBEl = makeZone(level.zoneB);
    zoneBEl.addEventListener('click', () => selectZone(level.zoneB.key));
    zonesRow.appendChild(zoneBEl);

    // Items row
    const itemsRow = document.createElement('div');
    itemsRow.style.display = 'flex';
    itemsRow.style.flexWrap = 'wrap';
    itemsRow.style.gap = '8px';
    itemsRow.style.justifyContent = 'center';
    itemsRow.style.margin = '6px 0';
    board.appendChild(itemsRow);

    for (const item of items) {
      const tile = makeItemTile(item);
      itemsRow.appendChild(tile);
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
      if (isRunning) tts.speak(`Level ${levelIdx + 1}! Sort ${level.zoneA.ttsLabel} and ${level.zoneB.ttsLabel}! Tap a zone first!`);
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

    const zA = level.zoneA;
    const zB = level.zoneB;

    // Reset both
    zoneAEl.style.borderColor = zA.color;
    zoneAEl.style.boxShadow = `0 0 0 3px ${zA.color}40`;
    zoneBEl.style.borderColor = zB.color;
    zoneBEl.style.boxShadow = `0 0 0 3px ${zB.color}40`;

    // Highlight selected
    if (zone === zA.key) {
      zoneAEl.style.borderColor = '#4CAF50';
      zoneAEl.style.boxShadow = '0 0 0 6px rgba(76, 175, 80, 0.3)';
      promptEl.textContent = `Tap ${zA.ttsLabel} things!`;
      tts.speak(`${zA.ttsLabel} zone! Now tap ${zA.ttsLabel} things!`);
    } else {
      zoneBEl.style.borderColor = '#4CAF50';
      zoneBEl.style.boxShadow = '0 0 0 6px rgba(76, 175, 80, 0.3)';
      promptEl.textContent = `Tap ${zB.ttsLabel} things!`;
      tts.speak(`${zB.ttsLabel} zone! Now tap ${zB.ttsLabel} things!`);
    }
  }

  async function onItemTap(el) {
    if (!isRunning || el.dataset.sorted === 'true') return;

    const itemZone = el.dataset.zone;
    const itemTTS = el.dataset.tts;

    const zA = level.zoneA;
    const zB = level.zoneB;

    // No zone selected yet
    if (!selectedZone) {
      audio.playTap();
      tts.speak(`Tap the ${zA.ttsLabel} zone or ${zB.ttsLabel} zone first!`);
      promptEl.textContent = 'Tap a zone first!';
      zoneAEl.style.animation = 'gentleShake 0.4s ease';
      zoneBEl.style.animation = 'gentleShake 0.4s ease';
      await wait(400);
      zoneAEl.style.animation = '';
      zoneBEl.style.animation = '';
      return;
    }

    // Wrong zone selected — redirect to correct zone
    if (itemZone !== selectedZone) {
      audio.playTap();
      const correctZone = itemZone === zA.key ? zA : zB;
      promptEl.textContent = `That's ${correctZone.ttsLabel}! Tap ${correctZone.ttsLabel} zone!`;
      tts.speak(`That's ${correctZone.ttsLabel}! Tap the ${correctZone.ttsLabel} zone!`);

      // Reset both
      zoneAEl.style.borderColor = zA.color;
      zoneAEl.style.boxShadow = `0 0 0 3px ${zA.color}40`;
      zoneBEl.style.borderColor = zB.color;
      zoneBEl.style.boxShadow = `0 0 0 3px ${zB.color}40`;

      // Highlight correct zone
      if (itemZone === zA.key) {
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

    if (itemZone === zA.key) zoneARemaining--;
    else zoneBRemaining--;

    // Animate to zone
    const targetZone = itemZone === zA.key ? zoneAEl : zoneBEl;
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

    const badges = targetZone.querySelectorAll('div');
    badges.forEach((b, i) => {
      b.style.transform = `translate(${(i * 12) - ((badges.length - 1) * 6)}px, -3px)`;
    });

    audio.playChime();

    const remaining = totalItems - sortedCount;
    const counterEl = document.getElementById('sort-counter');
    if (counterEl) counterEl.textContent = `${sortedCount} sorted / ${remaining} left`;

    await tts.speak(itemTTS);

    // Check if current zone is empty
    if (selectedZone === zA.key && zoneARemaining === 0) {
      if (zoneBRemaining === 0) {
        await wait(500);
        showReward();
        return;
      }
      promptEl.textContent = `${zA.label} done! Tap ${zB.ttsLabel} zone!`;
      await wait(200);
      tts.speak(`${zA.label} zone is done! Now tap the ${zB.ttsLabel} zone!`);
      zoneAEl.style.borderColor = zA.color;
      zoneAEl.style.boxShadow = `0 0 0 3px ${zA.color}40`;
      zoneBEl.style.borderColor = '#4CAF50';
      zoneBEl.style.boxShadow = '0 0 0 6px rgba(76, 175, 80, 0.3)';
      selectedZone = zB.key;
    } else if (selectedZone === zB.key && zoneBRemaining === 0) {
      if (zoneARemaining === 0) {
        await wait(500);
        showReward();
        return;
      }
      promptEl.textContent = `${zB.label} done! Tap ${zA.ttsLabel} zone!`;
      await wait(200);
      tts.speak(`${zB.label} zone is done! Now tap the ${zA.ttsLabel} zone!`);
      zoneBEl.style.borderColor = zB.color;
      zoneBEl.style.boxShadow = `0 0 0 3px ${zB.color}40`;
      zoneAEl.style.borderColor = '#4CAF50';
      zoneAEl.style.boxShadow = '0 0 0 6px rgba(76, 175, 80, 0.3)';
      selectedZone = zA.key;
    }
  }

  async function showReward() {
    board.innerHTML = '';
    const reward = document.createElement('div');
    reward.className = 'reward-screen fade-in';
    reward.innerHTML = `
      <div style="font-size:4rem;">🎉</div>
      <div class="game-prompt" style="margin-top:12px;">Level ${levelIdx + 1} complete!</div>
      <div style="font-size:1.3rem;color:#555;margin-top:8px;">${level.name} sorted!</div>
      <div style="display:flex;gap:12px;margin-top:20px;flex-wrap:wrap;justify-content:center;">
        <button id="sf-next" class="btn-primary">Next Level</button>
        <button id="sf-home" class="btn-secondary">Home</button>
      </div>
    `;
    board.appendChild(reward);
    audio.playCelebrate();
    await tts.speak(`Level ${levelIdx + 1} complete! ${level.name} sorted! Great job!`);

    progress.totalPlayed = (progress.totalPlayed || 0) + 1;
    state.updateProgress('sortTheFlock', progress);

    reward.querySelector('#sf-next').addEventListener('click', () => {
      audio.playTap();
      levelIdx = (levelIdx + 1) % COLOR_LEVELS.length;
      level = COLOR_LEVELS[levelIdx];
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
