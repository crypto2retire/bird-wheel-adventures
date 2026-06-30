/** @file State.js - Game state and progress management using localStorage */

const STORAGE_KEY = 'bird_wheel_adventures';

const DEFAULT_SETTINGS = {
  ttsEnabled: true,
  sfxEnabled: true,
  musicEnabled: false,
  difficulty: 'adaptive',
  waitTime: 5,
  reduceMotion: false
};

const DEFAULT_PROGRESS = {
  birdCounter: { level: 1, stars: 0, totalPlayed: 0 },
  vehicleABC: { level: 1, lettersUnlocked: ['A'], totalPlayed: 0 },
  memoryMatch: { level: 1, gamesPlayed: 0 },
  sayTheWord: { wordsAttempted: [], totalPlayed: 0 },
  sortTheFlock: { level: 1, totalPlayed: 0 },
  findTheBird: { level: 1, totalPlayed: 0 },
  wheelCounter: { level: 1, totalPlayed: 0 },
  freePlay: { minutesPlayed: 0 }
};

export class State {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
          progress: { ...DEFAULT_PROGRESS, ...parsed.progress }
        };
      }
    } catch (e) {
      console.warn('Failed to load state:', e);
    }
    return { settings: { ...DEFAULT_SETTINGS }, progress: { ...DEFAULT_PROGRESS } };
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Failed to save state:', e);
    }
  }

  getSettings() {
    return this.data.settings;
  }

  setSettings(key, value) {
    this.data.settings[key] = value;
    this.save();
  }

  getProgress(gameId) {
    return this.data.progress[gameId] || {};
  }

  updateProgress(gameId, updates) {
    if (!this.data.progress[gameId]) {
      this.data.progress[gameId] = {};
    }
    Object.assign(this.data.progress[gameId], updates);
    this.save();
  }

  resetAll() {
    this.data = { settings: { ...DEFAULT_SETTINGS }, progress: { ...DEFAULT_PROGRESS } };
    this.save();
  }

  export() {
    return JSON.stringify(this.data, null, 2);
  }

  import(json) {
    try {
      this.data = JSON.parse(json);
      this.save();
      return true;
    } catch (e) {
      return false;
    }
  }
}

export const state = new State();
