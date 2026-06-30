import { BIRDS, VEHICLES, FIRST_WORDS, pickRandom, wait } from '../core/gameData.js';

const CONTENT_POOLS = [BIRDS, VEHICLES, FIRST_WORDS];

export function init(container, { tts, audio, state }) {
  const settings = state.getSettings();
  const waitTime = ((settings && settings.waitTime) || 5) * 1000;
  const progress = state.getProgress('sayTheWord') || {};
  const wordsAttempted = (progress.wordsAttempted || 0);
  const totalPlayed = (progress.totalPlayed || 0);

  let currentItem = null;
  let isActive = true;
  let timeoutId = null;

  function pickItem() {
    const pool = pickRandom(CONTENT_POOLS, 1)[0];
    return pickRandom(pool, 1)[0];
  }

  function getWord(item) {
    if (item && typeof item.word === 'string') {
      return item.word;
    }
    if (item && typeof item.name === 'string') {
      return item.name;
    }
    return 'something';
  }

  function getEmoji(item) {
    if (item && typeof item.emoji === 'string') {
      return item.emoji;
    }
    return '✨';
  }

  function getPrompt(item) {
    const word = getWord(item);
    const emoji = getEmoji(item);
    return { word, emoji };
  }

  function createPulseIcon() {
    const icon = document.createElement('div');
    icon.textContent = '🗣️';
    icon.style.fontSize = '4rem';
    icon.style.marginTop = '1.5rem';
    icon.style.animation = 'pulse 1s ease-in-out infinite';
    icon.style.cursor = 'pointer';
    icon.style.userSelect = 'none';
    icon.style.WebkitUserSelect = 'none';
    icon.id = 'stw-pulse';

    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.2); opacity: 0.8; }
        100% { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    return icon;
  }

  async function showScreen() {
    if (!isActive) return;

    container.innerHTML = '';
    currentItem = pickItem();
    const { word, emoji } = getPrompt(currentItem);

    const board = document.createElement('div');
    board.className = 'game-board';
    board.style.display = 'flex';
    board.style.flexDirection = 'column';
    board.style.alignItems = 'center';
    board.style.justifyContent = 'center';
    board.style.minHeight = '60vh';
    board.style.textAlign = 'center';
    board.style.padding = '1rem';

    const img = document.createElement('div');
    img.textContent = emoji;
    img.style.fontSize = '6rem';
    img.style.marginBottom = '1rem';
    img.style.cursor = 'pointer';
    img.style.userSelect = 'none';
    img.style.WebkitUserSelect = 'none';
    img.className = 'fade-in';
    board.appendChild(img);

    const bubble = document.createElement('div');
    bubble.className = 'speech-bubble fade-in';
    bubble.textContent = word;
    bubble.style.fontSize = '2rem';
    bubble.style.fontWeight = 'bold';
    bubble.style.marginBottom = '1rem';
    bubble.style.cursor = 'pointer';
    board.appendChild(bubble);

    const mouth = document.createElement('div');
    mouth.className = 'mouth-cue fade-in';
    mouth.style.fontSize = '3rem';
    mouth.style.marginBottom = '0.5rem';
    mouth.textContent = '👄';
    board.appendChild(mouth);

    const pulse = createPulseIcon();
    board.appendChild(pulse);

    const hint = document.createElement('div');
    hint.style.fontSize = '1rem';
    hint.style.color = '#888';
    hint.style.marginTop = '0.75rem';
    hint.textContent = 'Tap when you are ready!';
    hint.className = 'fade-in';
    board.appendChild(hint);

    container.appendChild(board);

    await wait(500);
    tts.speak(`This is a ${word}. Can you say ${word}?`);

    await wait(800);
    tts.speak('Say it with me!');

    const finishRound = async () => {
      if (!isActive) return;
      isActive = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      tts.cancel();
      audio.playTap();
      await wait(200);
      tts.speak(`Great trying! You said ${word}!`);
      await wait(400);
      audio.playCelebrate();

      state.updateProgress('sayTheWord', {
        wordsAttempted: wordsAttempted + 1,
        totalPlayed: totalPlayed + 1,
      });

      await wait(1500);
      isActive = true;
      showScreen();
    };

    board.addEventListener('click', () => {
      if (!isActive) return;
      finishRound();
    });

    board.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (!isActive) return;
      finishRound();
    }, { passive: false });

    timeoutId = setTimeout(() => {
      if (isActive) {
        finishRound();
      }
    }, waitTime + 2000);
  }

  showScreen();

  return () => {
    isActive = false;
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    tts.cancel();
    container.innerHTML = '';
  };
}
