/** @file main.js - Entry point, home screen, navigation, and game routing */

import { state } from './core/State.js';
import { tts } from './core/TTS.js';
import { audio } from './core/AudioManager.js';

// Game modules (lazy loaded)
const gameModules = {
  birdCounter: () => import('./games/BirdCounter.js'),
  vehicleABC: () => import('./games/VehicleABC.js'),
  memoryMatch: () => import('./games/MemoryMatch.js'),
  sayTheWord: () => import('./games/SayTheWord.js'),
  sortTheFlock: () => import('./games/SortTheFlock.js'),
  findTheBird: () => import('./games/FindTheBird.js'),
  wheelCounter: () => import('./games/WheelCounter.js'),
  freePlay: () => import('./games/FreePlay.js')
};

const GAMES = [
  { id: 'birdCounter', title: 'Bird Counter', icon: '🐦', color: '#9BB8D3' },
  { id: 'vehicleABC', title: 'Vehicle ABC', icon: '🚗', color: '#C4A882' },
  { id: 'memoryMatch', title: 'Memory Match', icon: '🧠', color: '#D4A574' },
  { id: 'sayTheWord', title: 'Say the Word!', icon: '🗣️', color: '#A8C686' },
  { id: 'sortTheFlock', title: 'Sort the Flock', icon: '🗂️', color: '#9BB8D3' },
  { id: 'findTheBird', title: 'Find the Bird!', icon: '🔍', color: '#C4A882' },
  { id: 'wheelCounter', title: 'Wheel Counter', icon: '🎡', color: '#D4A574' },
  { id: 'freePlay', title: 'Free Play', icon: '🏖️', color: '#A8C686' }
];

let currentGame = null;
let currentGameCleanup = null;

const app = document.getElementById('app');
const gameScreen = document.getElementById('game-screen');
const backBtn = document.getElementById('back-btn');
const settingsBtn = document.getElementById('settings-btn');
const gameTitle = document.getElementById('game-title');
const settingsPanel = document.getElementById('settings-panel');

// Initialize
function init() {
  // Apply settings
  applySettings();
  
  // Build home screen
  showHome();
  
  // Setup navigation
  backBtn.addEventListener('click', () => {
    audio.playTap();
    goHome();
  });
  
  settingsBtn.addEventListener('click', () => {
    audio.playTap();
    showSettings();
  });
  
  document.getElementById('close-settings').addEventListener('click', () => {
    audio.playTap();
    hideSettings();
  });
  
  // Setup settings toggles
  setupSettings();
  
  // Warm up TTS on first interaction
  document.addEventListener('click', () => {
    tts.warmup();
  }, { once: true });
  
  // Register service worker for PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {});
  }
}

function showHome() {
  // Clear current game
  if (currentGameCleanup) {
    currentGameCleanup();
    currentGameCleanup = null;
  }
  currentGame = null;
  
  gameScreen.innerHTML = '';
  gameTitle.textContent = 'Bird & Wheel Adventures';
  backBtn.classList.add('hidden');
  settingsBtn.classList.remove('hidden');
  
  const grid = document.createElement('div');
  grid.className = 'home-grid';
  
  for (const game of GAMES) {
    const card = document.createElement('div');
    card.className = 'game-card fade-in';
    card.style.borderColor = 'transparent';
    card.innerHTML = `
      <div class="game-card-icon">${game.icon}</div>
      <div class="game-card-title">${game.title}</div>
    `;
    card.addEventListener('click', () => {
      audio.playTap();
      launchGame(game.id);
    });
    grid.appendChild(card);
  }
  
  gameScreen.appendChild(grid);
  
  // Welcome TTS
  const settings = state.getSettings();
  if (settings.ttsEnabled) {
    setTimeout(() => {
      tts.speak('Welcome to Bird and Wheel Adventures! Tap a game to play.');
    }, 500);
  }
}

function goHome() {
  showHome();
}

async function launchGame(gameId) {
  const gameInfo = GAMES.find(g => g.id === gameId);
  if (!gameInfo) return;
  
  gameTitle.textContent = gameInfo.title;
  backBtn.classList.remove('hidden');
  settingsBtn.classList.remove('hidden');
  gameScreen.innerHTML = '';
  
  currentGame = gameId;
  
  try {
    const module = await gameModules[gameId]();
    if (module.init) {
      currentGameCleanup = module.init(gameScreen, { tts, audio, state });
    }
  } catch (e) {
    console.error('Failed to load game:', e);
    gameScreen.innerHTML = '<p class="center" style="padding:40px;font-size:1.2rem">Oops! This game is loading...</p>';
  }
}

function showSettings() {
  settingsPanel.classList.remove('hidden');
}

function hideSettings() {
  settingsPanel.classList.add('hidden');
  applySettings();
}

function setupSettings() {
  const settings = state.getSettings();
  document.getElementById('tts-toggle').checked = settings.ttsEnabled;
  document.getElementById('sfx-toggle').checked = settings.sfxEnabled;
  document.getElementById('music-toggle').checked = settings.musicEnabled;
  document.getElementById('reduce-motion').checked = settings.reduceMotion;
  document.getElementById('wait-time').value = String(settings.waitTime);
  document.getElementById('difficulty').value = settings.difficulty;
  
  // Bind listeners
  document.getElementById('tts-toggle').addEventListener('change', (e) => {
    state.setSettings('ttsEnabled', e.target.checked);
    tts.setEnabled(e.target.checked);
  });
  document.getElementById('sfx-toggle').addEventListener('change', (e) => {
    state.setSettings('sfxEnabled', e.target.checked);
    audio.setEnabled(e.target.checked);
  });
  document.getElementById('music-toggle').addEventListener('change', (e) => {
    state.setSettings('musicEnabled', e.target.checked);
  });
  document.getElementById('reduce-motion').addEventListener('change', (e) => {
    state.setSettings('reduceMotion', e.target.checked);
    applyMotionSettings();
  });
  document.getElementById('wait-time').addEventListener('change', (e) => {
    state.setSettings('waitTime', parseInt(e.target.value));
  });
  document.getElementById('difficulty').addEventListener('change', (e) => {
    state.setSettings('difficulty', e.target.value);
  });
}

function applySettings() {
  const settings = state.getSettings();
  tts.setEnabled(settings.ttsEnabled);
  audio.setEnabled(settings.sfxEnabled);
  applyMotionSettings();
}

function applyMotionSettings() {
  const settings = state.getSettings();
  if (settings.reduceMotion) {
    document.documentElement.style.setProperty('--animation-duration', '0.01ms');
  }
}

init();
