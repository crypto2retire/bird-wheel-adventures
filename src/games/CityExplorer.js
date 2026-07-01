import { wait } from '../core/gameData.js';

const CITY_ITEMS = [
  { emoji: '🏠', name: 'house', sound: 'tap', tts: 'A house! People live here!' },
  { emoji: '🚗', name: 'car', sound: 'beep', tts: 'Beep beep! A car!' },
  { emoji: '🌳', name: 'tree', sound: 'chirp', tts: 'A tree! Birds sit here!' },
  { emoji: '🐕', name: 'dog', sound: 'beep', tts: 'Woof! A dog!' },
  { emoji: '🏢', name: 'building', sound: 'tap', tts: 'A big building!' },
  { emoji: '🚌', name: 'bus', sound: 'beep', tts: 'A bus! Room for lots!' },
  { emoji: '🚤', name: 'boat', sound: 'beep', tts: 'A boat! Floats on water!' },
  { emoji: '🐦', name: 'bird', sound: 'chirp', tts: 'Chirp! A bird!' },
  { emoji: '🚒', name: 'fire truck', sound: 'beep', tts: 'A fire truck! Goes fast!' },
  { emoji: '🚁', name: 'helicopter', sound: 'beep', tts: 'A helicopter! Flies!' },
  { emoji: '🏪', name: 'store', sound: 'tap', tts: 'A store! Buy things!' },
  { emoji: '🚦', name: 'traffic light', sound: 'tap', tts: 'Stop! Go!' }
];

const ROWS = 4;
const COLS = 3;

export function init(container, { tts, audio, state }) {
  let isRunning = true;
  let charRow = 0;
  let charCol = 0;
  let isMoving = false;
  let gridItems = [];
  let visited = new Set();

  const progress = state.getProgress('cityExplorer') || {};
  const totalVisited = progress.totalVisited || 0;
  const totalPlayed = progress.totalPlayed || 0;

  const board = document.createElement('div');
  board.className = 'game-board';
  board.style.width = '100%';
  board.style.maxWidth = '400px';
  board.style.gap = '8px';
  board.style.padding = '8px 0';
  container.appendChild(board);

  // Info bar
  const infoBar = document.createElement('div');
  infoBar.style.display = 'flex';
  infoBar.style.justifyContent = 'space-between';
  infoBar.style.alignItems = 'center';
  infoBar.style.width = '100%';
  infoBar.style.marginBottom = '4px';
  infoBar.innerHTML = `<span style="font-size:0.95rem;color:#666;">Explore!</span><span id="city-visited" style="font-size:0.95rem;color:#7BA598;font-weight:700;">0 / ${ROWS * COLS}</span>`;
  board.appendChild(infoBar);

  // Grid container — compact, fixed height
  const gridWrap = document.createElement('div');
  gridWrap.style.position = 'relative';
  gridWrap.style.width = '100%';
  gridWrap.style.maxWidth = '340px';
  gridWrap.style.height = '240px';
  gridWrap.style.background = '#e0e0e0';
  gridWrap.style.borderRadius = '12px';
  gridWrap.style.overflow = 'hidden';
  gridWrap.style.border = '3px solid #7BA598';
  gridWrap.style.margin = '0 auto';
  board.appendChild(gridWrap);

  const cellW = 100 / COLS;
  const cellH = 100 / ROWS;
  const shuffledItems = shuffle([...CITY_ITEMS]);
  gridItems = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const idx = r * COLS + c;
      const item = shuffledItems[idx % shuffledItems.length];
      const cell = document.createElement('div');
      cell.dataset.row = String(r);
      cell.dataset.col = String(c);
      cell.style.position = 'absolute';
      cell.style.left = `${c * cellW}%`;
      cell.style.top = `${r * cellH}%`;
      cell.style.width = `${cellW}%`;
      cell.style.height = `${cellH}%`;
      cell.style.display = 'flex';
      cell.style.alignItems = 'center';
      cell.style.justifyContent = 'center';
      cell.style.fontSize = '1.8rem';
      cell.style.cursor = 'pointer';
      cell.style.transition = 'transform 0.3s ease';
      cell.style.border = '1px solid rgba(0,0,0,0.05)';
      cell.style.background = (r + c) % 2 === 0 ? '#F0EDE6' : '#E8E4DC';
      cell.textContent = item.emoji;
      cell.dataset.name = item.name;
      cell.dataset.tts = item.tts;
      cell.dataset.sound = item.sound;
      cell.dataset.visited = 'false';
      cell.setAttribute('role', 'img');
      cell.setAttribute('aria-label', item.name);

      cell.addEventListener('click', () => onCellTap(r, c));
      gridWrap.appendChild(cell);
      gridItems.push({ element: cell, item, row: r, col: c });
    }
  }

  // Character
  const character = document.createElement('div');
  character.textContent = '🧒';
  character.style.fontSize = '1.6rem';
  character.style.position = 'absolute';
  character.style.zIndex = '10';
  character.style.transition = 'top 0.3s ease, left 0.3s ease';
  character.style.pointerEvents = 'none';
  character.style.display = 'flex';
  character.style.alignItems = 'center';
  character.style.justifyContent = 'center';
  character.style.width = `${cellW}%`;
  character.style.height = `${cellH}%`;
  character.style.filter = 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))';
  gridWrap.appendChild(character);

  function updateCharPosition() {
    character.style.left = `${charCol * cellW}%`;
    character.style.top = `${charRow * cellH}%`;
  }
  updateCharPosition();

  function highlightCurrentCell() {
    gridItems.forEach(gi => {
      gi.element.style.background = (gi.row + gi.col) % 2 === 0 ? '#F0EDE6' : '#E8E4DC';
      gi.element.style.boxShadow = 'none';
    });
    const current = gridItems.find(gi => gi.row === charRow && gi.col === charCol);
    if (current) {
      current.element.style.background = '#D4E8D4';
      current.element.style.boxShadow = 'inset 0 0 0 2px #7BA598';
    }
  }
  highlightCurrentCell();

  // Controls row — arrows + Home button, always visible
  const controlsRow = document.createElement('div');
  controlsRow.style.display = 'flex';
  controlsRow.style.alignItems = 'center';
  controlsRow.style.justifyContent = 'center';
  controlsRow.style.gap = '12px';
  controlsRow.style.marginTop = '10px';
  controlsRow.style.width = '100%';
  board.appendChild(controlsRow);

  // Direction pad
  const dpad = document.createElement('div');
  dpad.style.display = 'grid';
  dpad.style.gridTemplateColumns = 'repeat(3, 1fr)';
  dpad.style.gap = '3px';
  dpad.style.maxWidth = '150px';

  dpad.appendChild(document.createElement('div'));
  dpad.appendChild(makeArrow('⬆️', 'up'));
  dpad.appendChild(document.createElement('div'));
  dpad.appendChild(makeArrow('⬅️', 'left'));
  const centerDot = document.createElement('div');
  centerDot.style.display = 'flex';
  centerDot.style.alignItems = 'center';
  centerDot.style.justifyContent = 'center';
  centerDot.innerHTML = '<span style="font-size:1rem;color:#ccc;">●</span>';
  dpad.appendChild(centerDot);
  dpad.appendChild(makeArrow('➡️', 'right'));
  dpad.appendChild(document.createElement('div'));
  dpad.appendChild(makeArrow('⬇️', 'down'));
  dpad.appendChild(document.createElement('div'));

  controlsRow.appendChild(dpad);

  // Big Home button
  const homeBtn = document.createElement('button');
  homeBtn.className = 'btn-secondary';
  homeBtn.style.minHeight = '60px';
  homeBtn.style.minWidth = '70px';
  homeBtn.style.fontSize = '0.9rem';
  homeBtn.style.fontWeight = '700';
  homeBtn.style.display = 'flex';
  homeBtn.style.flexDirection = 'column';
  homeBtn.style.alignItems = 'center';
  homeBtn.style.justifyContent = 'center';
  homeBtn.style.gap = '2px';
  homeBtn.style.borderRadius = '14px';
  homeBtn.innerHTML = '<span style="font-size:1.4rem;">🏠</span><span>Home</span>';
  homeBtn.addEventListener('click', () => {
    audio.playTap();
    const backBtn = document.getElementById('back-btn');
    if (backBtn) backBtn.click();
  });
  controlsRow.appendChild(homeBtn);

  // Speech bubble
  const interactionPanel = document.createElement('div');
  interactionPanel.className = 'speech-bubble';
  interactionPanel.style.marginTop = '8px';
  interactionPanel.style.width = '100%';
  interactionPanel.style.maxWidth = '360px';
  interactionPanel.style.minHeight = '40px';
  interactionPanel.style.padding = '12px 16px';
  interactionPanel.style.display = 'flex';
  interactionPanel.style.alignItems = 'center';
  interactionPanel.style.justifyContent = 'center';
  interactionPanel.style.fontSize = '1rem';
  interactionPanel.textContent = 'Tap arrows to walk!';
  board.appendChild(interactionPanel);

  function makeArrow(emoji, direction) {
    const btn = document.createElement('button');
    btn.className = 'btn-primary';
    btn.style.minWidth = '44px';
    btn.style.minHeight = '44px';
    btn.style.fontSize = '1.3rem';
    btn.style.padding = '0';
    btn.style.borderRadius = '10px';
    btn.style.fontFamily = 'inherit';
    btn.textContent = emoji;
    btn.addEventListener('click', () => moveCharacter(direction));
    return btn;
  }

  async function moveCharacter(direction) {
    if (isMoving || !isRunning) return;
    isMoving = true;
    audio.playTap();

    let newRow = charRow;
    let newCol = charCol;
    switch (direction) {
      case 'up': newRow = Math.max(0, charRow - 1); break;
      case 'down': newRow = Math.min(ROWS - 1, charRow + 1); break;
      case 'left': newCol = Math.max(0, charCol - 1); break;
      case 'right': newCol = Math.min(COLS - 1, charCol + 1); break;
    }

    if (newRow !== charRow || newCol !== charCol) {
      charRow = newRow;
      charCol = newCol;
      updateCharPosition();
      highlightCurrentCell();
      await wait(300);
      await interactWithCurrentCell();
    }
    isMoving = false;
  }

  async function onCellTap(row, col) {
    if (isMoving || !isRunning) return;
    isMoving = true;
    audio.playTap();
    charRow = row;
    charCol = col;
    updateCharPosition();
    highlightCurrentCell();
    await wait(300);
    await interactWithCurrentCell();
    isMoving = false;
  }

  async function interactWithCurrentCell() {
    const current = gridItems.find(gi => gi.row === charRow && gi.col === charCol);
    if (!current) return;

    const cell = current.element;
    const item = current.item;

    if (cell.dataset.visited === 'false') {
      cell.dataset.visited = 'true';
      cell.style.opacity = '0.6';
      visited.add(`${charRow},${charCol}`);
      const visitedEl = document.getElementById('city-visited');
      if (visitedEl) visitedEl.textContent = `${visited.size} / ${ROWS * COLS}`;
    }

    cell.style.transform = 'scale(1.3)';
    await wait(200);
    cell.style.transform = 'scale(1)';

    if (item.sound === 'chirp') audio.playChirp();
    else if (item.sound === 'beep') audio.playBeep();
    else audio.playTap();

    interactionPanel.textContent = item.tts;
    await wait(200);
    await tts.speak(item.tts);

    if (visited.size === ROWS * COLS) {
      await wait(500);
      showReward();
    }
  }

  async function showReward() {
    board.innerHTML = '';
    const reward = document.createElement('div');
    reward.className = 'reward-screen fade-in';
    reward.innerHTML = `
      <div style="font-size:4rem;">🌟</div>
      <div class="game-prompt" style="margin-top:12px;">City Explorer!</div>
      <div style="font-size:1.3rem;color:#555;margin-top:8px;">You visited everything!</div>
      <div style="display:flex;gap:12px;margin-top:20px;flex-wrap:wrap;justify-content:center;">
        <button id="ce-replay" class="btn-primary">Explore Again!</button>
        <button id="ce-home" class="btn-secondary">Home</button>
      </div>
    `;
    board.appendChild(reward);
    audio.playCelebrate();
    await tts.speak('You explored the whole city! Great job!');

    state.updateProgress('cityExplorer', {
      totalVisited: (totalVisited || 0) + visited.size,
      totalPlayed: (totalPlayed || 0) + 1
    });

    reward.querySelector('#ce-replay').addEventListener('click', () => {
      audio.playTap();
      container.innerHTML = '';
      init(container, { tts, audio, state });
    });
    reward.querySelector('#ce-home').addEventListener('click', () => {
      audio.playTap();
      const backBtn = document.getElementById('back-btn');
      if (backBtn) backBtn.click();
    });
  }

  wait(600).then(() => {
    if (isRunning) tts.speak('Welcome to the city! Tap arrows to walk!');
  });

  return () => {
    isRunning = false;
    container.innerHTML = '';
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
