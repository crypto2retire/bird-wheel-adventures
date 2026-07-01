import { wait } from '../core/gameData.js';

const CITY_ITEMS = [
  { emoji: '🏠', name: 'house', sound: 'tap', tts: 'You found a house! A house is where people live.' },
  { emoji: '🚗', name: 'car', sound: 'beep', tts: 'Beep beep! It is a car! Cars have wheels!' },
  { emoji: '🌳', name: 'tree', sound: 'chirp', tts: 'A tree! Birds like to sit in trees!' },
  { emoji: '🐕', name: 'dog', sound: 'beep', tts: 'Woof woof! A dog! Dogs are friendly!' },
  { emoji: '🏢', name: 'building', sound: 'tap', tts: 'A big building! Tall buildings are called skyscrapers!' },
  { emoji: '🚌', name: 'bus', sound: 'beep', tts: 'A bus! Buses carry lots of people!' },
  { emoji: '🚤', name: 'boat', sound: 'beep', tts: 'A boat! Boats go on the water!' },
  { emoji: '🐦', name: 'bird', sound: 'chirp', tts: 'Chirp chirp! A bird! Birds can fly!' },
  { emoji: '🚒', name: 'fire truck', sound: 'beep', tts: 'A fire truck! Fire trucks go fast to help people!' },
  { emoji: '🚁', name: 'helicopter', sound: 'beep', tts: 'A helicopter! Helicopters fly in the sky!' },
  { emoji: '🏪', name: 'store', sound: 'tap', tts: 'A store! You can buy things at a store!' },
  { emoji: '🚦', name: 'traffic light', sound: 'tap', tts: 'Red light! Stop! Green light! Go!' },
  { emoji: '🚧', name: 'construction', sound: 'tap', tts: 'Construction zone! Workers are building something!' },
  { emoji: '🌷', name: 'flower', sound: 'chirp', tts: 'Pretty flowers! Flowers smell nice!' },
  { emoji: '🐈', name: 'cat', sound: 'chirp', tts: 'Meow! A cat! Cats like to nap!' },
  { emoji: '🚲', name: 'bicycle', sound: 'tap', tts: 'A bicycle! Bicycles have two wheels!' },
  { emoji: '🍦', name: 'ice cream', sound: 'tap', tts: 'Ice cream! Yummy ice cream truck!' },
  { emoji: '🚓', name: 'police car', sound: 'beep', tts: 'Wee-oo wee-oo! A police car!' },
  { emoji: '🎈', name: 'balloon', sound: 'tap', tts: 'Balloons! Balloons float up in the air!' },
  { emoji: '🏥', name: 'hospital', sound: 'tap', tts: 'A hospital! Doctors help people feel better!' }
];

const ROWS = 5;
const COLS = 4;

export function init(container, { tts, audio, state }) {
  let isRunning = true;
  let charRow = 0;
  let charCol = 0;
  let isMoving = false;
  let gridItems = [];
  let visited = new Set(); // track visited cells

  const progress = state.getProgress('cityExplorer') || {};
  const totalVisited = progress.totalVisited || 0;
  const totalPlayed = progress.totalPlayed || 0;

  // Build the game board
  const board = document.createElement('div');
  board.className = 'game-board';
  board.style.width = '100%';
  board.style.maxWidth = '500px';
  container.appendChild(board);

  // Info bar
  const infoBar = document.createElement('div');
  infoBar.style.display = 'flex';
  infoBar.style.justifyContent = 'space-between';
  infoBar.style.alignItems = 'center';
  infoBar.style.width = '100%';
  infoBar.style.marginBottom = '8px';
  infoBar.innerHTML = `<span style="font-size:1rem;color:#666;">Explore the city!</span><span id="city-visited" style="font-size:1rem;color:#7BA598;font-weight:700;">${visited.size} / ${ROWS * COLS}</span>`;
  board.appendChild(infoBar);

  // Grid container
  const gridWrap = document.createElement('div');
  gridWrap.style.position = 'relative';
  gridWrap.style.width = '100%';
  gridWrap.style.aspectRatio = `${COLS} / ${ROWS}`;
  gridWrap.style.background = '#e0e0e0';
  gridWrap.style.borderRadius = '16px';
  gridWrap.style.overflow = 'hidden';
  gridWrap.style.border = '3px solid #7BA598';
  board.appendChild(gridWrap);

  // Grid cells
  const cellSize = 100 / COLS;
  const shuffledItems = shuffle([...CITY_ITEMS]);
  gridItems = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const idx = r * COLS + c;
      const item = shuffledItems[idx % shuffledItems.length];
      const cell = document.createElement('div');
      cell.className = 'city-cell';
      cell.dataset.row = String(r);
      cell.dataset.col = String(c);
      cell.style.position = 'absolute';
      cell.style.left = `${c * cellSize}%`;
      cell.style.top = `${r * (100 / ROWS)}%`;
      cell.style.width = `${cellSize}%`;
      cell.style.height = `${100 / ROWS}%`;
      cell.style.display = 'flex';
      cell.style.alignItems = 'center';
      cell.style.justifyContent = 'center';
      cell.style.fontSize = '2.2rem';
      cell.style.cursor = 'pointer';
      cell.style.transition = 'transform 0.3s ease, background 0.3s ease';
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
  character.style.fontSize = '2rem';
  character.style.position = 'absolute';
  character.style.zIndex = '10';
  character.style.transition = 'top 0.4s ease, left 0.4s ease';
  character.style.pointerEvents = 'none';
  character.style.display = 'flex';
  character.style.alignItems = 'center';
  character.style.justifyContent = 'center';
  character.style.width = `${cellSize}%`;
  character.style.height = `${100 / ROWS}%`;
  character.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))';
  gridWrap.appendChild(character);

  function updateCharPosition() {
    character.style.left = `${charCol * cellSize}%`;
    character.style.top = `${charRow * (100 / ROWS)}%`;
  }
  updateCharPosition();

  // Highlight current cell
  function highlightCurrentCell() {
    gridItems.forEach(gi => {
      gi.element.style.background = (gi.row + gi.col) % 2 === 0 ? '#F0EDE6' : '#E8E4DC';
      gi.element.style.boxShadow = 'none';
    });
    const current = gridItems.find(gi => gi.row === charRow && gi.col === charCol);
    if (current) {
      current.element.style.background = '#D4E8D4';
      current.element.style.boxShadow = 'inset 0 0 0 3px #7BA598';
    }
  }
  highlightCurrentCell();

  // Directional controls
  const controls = document.createElement('div');
  controls.style.display = 'flex';
  controls.style.flexDirection = 'column';
  controls.style.alignItems = 'center';
  controls.style.gap = '8px';
  controls.style.marginTop = '16px';
  controls.style.width = '100%';

  // Up button
  const upRow = document.createElement('div');
  const upBtn = makeArrow('⬆️', 'up');
  upRow.appendChild(upBtn);
  controls.appendChild(upRow);

  // Left/Right row
  const midRow = document.createElement('div');
  midRow.style.display = 'flex';
  midRow.style.gap = '8px';
  const leftBtn = makeArrow('⬅️', 'left');
  const rightBtn = makeArrow('➡️', 'right');
  midRow.appendChild(leftBtn);
  midRow.appendChild(rightBtn);
  controls.appendChild(midRow);

  // Down button
  const downRow = document.createElement('div');
  const downBtn = makeArrow('⬇️', 'down');
  downRow.appendChild(downBtn);
  controls.appendChild(downRow);

  board.appendChild(controls);

  // Interaction panel
  const interactionPanel = document.createElement('div');
  interactionPanel.className = 'speech-bubble';
  interactionPanel.style.marginTop = '12px';
  interactionPanel.style.width = '100%';
  interactionPanel.style.maxWidth = '400px';
  interactionPanel.style.minHeight = '60px';
  interactionPanel.style.display = 'flex';
  interactionPanel.style.alignItems = 'center';
  interactionPanel.style.justifyContent = 'center';
  interactionPanel.textContent = 'Tap arrows to walk!';
  board.appendChild(interactionPanel);

  function makeArrow(emoji, direction) {
    const btn = document.createElement('button');
    btn.className = 'btn-primary';
    btn.style.minWidth = '80px';
    btn.style.minHeight = '70px';
    btn.style.fontSize = '2rem';
    btn.style.padding = '0';
    btn.style.borderRadius = '16px';
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
      await wait(400);
      await interactWithCurrentCell();
    }

    isMoving = false;
  }

  async function onCellTap(row, col) {
    if (isMoving || !isRunning) return;
    isMoving = true;
    audio.playTap();

    // Move character to tapped cell
    charRow = row;
    charCol = col;
    updateCharPosition();
    highlightCurrentCell();
    await wait(400);
    await interactWithCurrentCell();

    isMoving = false;
  }

  async function interactWithCurrentCell() {
    const current = gridItems.find(gi => gi.row === charRow && gi.col === charCol);
    if (!current) return;

    const cell = current.element;
    const item = current.item;

    // Mark visited
    if (cell.dataset.visited === 'false') {
      cell.dataset.visited = 'true';
      cell.style.opacity = '0.6';
      visited.add(`${charRow},${charCol}`);
      const visitedEl = document.getElementById('city-visited');
      if (visitedEl) visitedEl.textContent = `${visited.size} / ${ROWS * COLS}`;
    }

    // Animation
    cell.style.transform = 'scale(1.3)';
    await wait(200);
    cell.style.transform = 'scale(1)';

    // Sound
    if (item.sound === 'chirp') audio.playChirp();
    else if (item.sound === 'beep') audio.playBeep();
    else audio.playTap();

    // Show interaction
    interactionPanel.textContent = item.tts;
    await wait(200);
    await tts.speak(item.tts);

    // Check if all visited
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
      <div style="font-size:5rem;">🌟</div>
      <div class="game-prompt" style="margin-top:16px;">City Explorer!</div>
      <div style="font-size:1.5rem;color:#555;margin-top:12px;">You visited everything!</div>
      <button id="ce-replay" class="btn-primary" style="margin-top:24px;">Explore Again!</button>
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
  }

  // Welcome TTS
  wait(600).then(() => {
    if (isRunning) tts.speak('Welcome to the city! Tap the arrows to walk around!');
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
