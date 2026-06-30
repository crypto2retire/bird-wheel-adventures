import { VEHICLES, pickRandom, wait } from '../core/gameData.js';

// ── WheelCounter: counting vehicle wheels ───────────────────────────────────

export function init(container, { tts, audio, state }) {
  const settings = state.getSettings();
  const progress = state.getProgress('wheelCounter') || { level: 1, totalPlayed: 0 };

  let currentVehicle = null;
  let roundActive = false;

  // ── Build the DOM structure ──
  const board = document.createElement('div');
  board.className = 'game-board';

  const prompt = document.createElement('div');
  prompt.className = 'game-prompt';

  const vehicleDisplay = document.createElement('div');
  vehicleDisplay.style.fontSize = '120px';
  vehicleDisplay.style.textAlign = 'center';
  vehicleDisplay.style.margin = '16px 0';
  vehicleDisplay.setAttribute('aria-hidden', 'true');

  const vehicleName = document.createElement('div');
  vehicleName.className = 'game-prompt';
  vehicleName.style.fontSize = '1.5rem';
  vehicleName.style.marginBottom = '8px';

  const numberPad = document.createElement('div');
  numberPad.className = 'number-pad';
  numberPad.style.display = 'grid';
  numberPad.style.gridTemplateColumns = 'repeat(5, 1fr)';
  numberPad.style.gap = '12px';
  numberPad.style.maxWidth = '480px';
  numberPad.style.margin = '0 auto';

  const rewardScreen = document.createElement('div');
  rewardScreen.className = 'reward-screen hidden';

  board.appendChild(prompt);
  board.appendChild(vehicleDisplay);
  board.appendChild(vehicleName);
  board.appendChild(numberPad);
  board.appendChild(rewardScreen);
  container.appendChild(board);

  // ── Helpers ──

  function speak(text, priority = false) {
    if (settings.ttsEnabled !== false) {
      tts.speak(text);
    }
  }

  function buildNumberPad(maxNumber) {
    numberPad.innerHTML = '';
    const count = Math.min(Math.max(maxNumber, 10), 20); // show 10-20 numbers
    for (let i = 1; i <= count; i++) {
      const btn = document.createElement('button');
      btn.className = 'number-btn tile';
      btn.textContent = i;
      btn.style.fontSize = '2rem';
      btn.style.minHeight = '80px';
      btn.style.minWidth = '80px';
      btn.style.padding = '8px';
      btn.style.borderRadius = '16px';
      btn.style.cursor = 'pointer';
      btn.style.userSelect = 'none';
      btn.style.touchAction = 'manipulation';
      btn.setAttribute('aria-label', `Number ${i}`);
      btn.dataset.value = i;
      btn.addEventListener('click', handleNumberTap);
      btn.addEventListener('touchend', (e) => { e.preventDefault(); handleNumberTap.call(btn, e); });
      numberPad.appendChild(btn);
    }
  }

  async function handleNumberTap(e) {
    if (!roundActive || !currentVehicle) return;
    e.preventDefault?.();

    const tappedValue = parseInt(this.dataset.value, 10);
    audio.playTap();

    if (tappedValue === currentVehicle.wheels) {
      // ── Correct answer ──
      roundActive = false;
      this.classList.add('correct');
      audio.playChime();

      // Build the counting string
      const countWords = Array.from({ length: currentVehicle.wheels }, (_, i) => {
        const n = i + 1;
        if (n === 1) return 'One';
        if (n === 2) return 'two';
        if (n === 3) return 'three';
        if (n === 4) return 'four';
        if (n === 5) return 'five';
        if (n === 6) return 'six';
        if (n === 7) return 'seven';
        if (n === 8) return 'eight';
        if (n === 9) return 'nine';
        if (n === 10) return 'ten';
        if (n === 11) return 'eleven';
        if (n === 12) return 'twelve';
        if (n === 13) return 'thirteen';
        if (n === 14) return 'fourteen';
        if (n === 15) return 'fifteen';
        if (n === 16) return 'sixteen';
        if (n === 17) return 'seventeen';
        return 'eighteen';
      }).join(', ');

      const praiseText = `Yes! The ${currentVehicle.name} has ${currentVehicle.wheels} wheels! ${countWords}!`;
      speak(praiseText, true);

      await wait(800);
      audio.playCelebrate();

      // Update progress
      progress.totalPlayed += 1;
      progress.level = Math.floor(progress.totalPlayed / 5) + 1;
      state.updateProgress('wheelCounter', progress);

      // Reward screen
      rewardScreen.innerHTML = `
        <div style="font-size: 80px; margin-bottom: 16px;">${currentVehicle.emoji}</div>
        <div class="game-prompt" style="font-size: 2rem;">${currentVehicle.wheels} wheels!</div>
      `;
      rewardScreen.classList.remove('hidden');
      rewardScreen.classList.add('fade-in');
      vehicleDisplay.classList.add('hidden');
      vehicleName.classList.add('hidden');
      numberPad.classList.add('hidden');
      prompt.classList.add('hidden');

      await wait(2500);
      startRound();
    } else {
      // ── Wrong answer (gentle redirect) ──
      this.classList.add('wrong');
      roundActive = false; // prevent double taps while speaking

      // Count up to the actual number of wheels
      const countWords = Array.from({ length: currentVehicle.wheels }, (_, i) => {
        const n = i + 1;
        if (n === 1) return 'One';
        if (n === 2) return 'two';
        if (n === 3) return 'three';
        if (n === 4) return 'four';
        if (n === 5) return 'five';
        if (n === 6) return 'six';
        if (n === 7) return 'seven';
        if (n === 8) return 'eight';
        if (n === 9) return 'nine';
        if (n === 10) return 'ten';
        if (n === 11) return 'eleven';
        if (n === 12) return 'twelve';
        if (n === 13) return 'thirteen';
        if (n === 14) return 'fourteen';
        if (n === 15) return 'fifteen';
        if (n === 16) return 'sixteen';
        if (n === 17) return 'seventeen';
        return 'eighteen';
      }).join(', ');

      const redirectText = `Let's count together! ${countWords}! Try again!`;
      speak(redirectText, true);

      await wait(1500 + currentVehicle.wheels * 400); // approximate speaking time

      // Remove wrong styling, keep pad open for retry
      const allBtns = numberPad.querySelectorAll('.number-btn');
      allBtns.forEach(b => b.classList.remove('wrong', 'correct'));
      this.classList.remove('wrong');
      roundActive = true;
    }
  }

  async function startRound() {
    roundActive = false;

    // Reset display
    rewardScreen.classList.add('hidden');
    rewardScreen.classList.remove('fade-in');
    vehicleDisplay.classList.remove('hidden');
    vehicleName.classList.remove('hidden');
    numberPad.classList.remove('hidden');
    prompt.classList.remove('hidden');

    // Pick a vehicle: occasional surprise vehicles
    const surpriseChance = Math.random();
    if (surpriseChance < 0.15) {
      // Force unicycle (1 wheel) or semi-truck (18 wheels) if available
      const unicycle = VEHICLES.find(v => v.wheels === 1);
      const semi = VEHICLES.find(v => v.wheels === 18);
      if (semi && Math.random() < 0.5) {
        currentVehicle = semi;
      } else if (unicycle) {
        currentVehicle = unicycle;
      } else {
        currentVehicle = pickRandom(VEHICLES, 1)[0];
      }
    } else {
      // Filter out extreme values for normal rounds to keep it gentle
      const normalVehicles = VEHICLES.filter(v => v.wheels >= 2 && v.wheels <= 10);
      currentVehicle = normalVehicles.length > 0
        ? pickRandom(normalVehicles, 1)[0]
        : pickRandom(VEHICLES, 1)[0];
    }

    // Show vehicle
    vehicleDisplay.textContent = currentVehicle.emoji;
    vehicleName.textContent = currentVehicle.name;

    // Build prompt
    prompt.textContent = `How many wheels does the ${currentVehicle.name} have?`;

    // Build number pad (show up to max(10, wheels+2), capped at 20)
    const padMax = Math.min(Math.max(currentVehicle.wheels + 2, 10), 20);
    buildNumberPad(padMax);

    // Wait 500ms then TTS
    await wait(500);
    speak(`How many wheels does the ${currentVehicle.name} have?`, true);

    roundActive = true;
  }

  // ── Start the game ──
  startRound();

  // ── Cleanup ──
  return function cleanup() {
    roundActive = false;
    container.innerHTML = '';
  };
}
