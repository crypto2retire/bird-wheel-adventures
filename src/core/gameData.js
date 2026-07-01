/** @file gameData.js - Shared content data for all games */

export const BIRDS = [
  { name: 'Cardinal', emoji: '🐦', sound: 'chirp', color: 'red' },
  { name: 'Blue Jay', emoji: '🐦‍⬛', sound: 'chirp', color: 'blue' },
  { name: 'Robin', emoji: '🐦', sound: 'chirp', color: 'red' },
  { name: 'Eagle', emoji: '🦅', sound: 'chirp', color: 'brown' },
  { name: 'Owl', emoji: '🦉', sound: 'chirp', color: 'brown' },
  { name: 'Parrot', emoji: '🦜', sound: 'chirp', color: 'green' },
  { name: 'Penguin', emoji: '🐧', sound: 'chirp', color: 'black' },
  { name: 'Duck', emoji: '🦆', sound: 'chirp', color: 'yellow' },
  { name: 'Flamingo', emoji: '🦩', sound: 'chirp', color: 'pink' },
  { name: 'Peacock', emoji: '🦚', sound: 'chirp', color: 'green' },
  { name: 'Swan', emoji: '🦢', sound: 'chirp', color: 'white' },
  { name: 'Hummingbird', emoji: '🐦', sound: 'chirp', color: 'green' }
];

/**
 * VEHICLES - Accurate names that match their emojis.
 * No fake names. Every emoji looks like the name says.
 * Some letters (E, K, L, N, O, Q, U, W, X, Z) don't have good vehicle emojis —
 * the Vehicle ABC game will skip those letters naturally.
 */
export const VEHICLES = [
  { name: 'Ambulance', emoji: '🚑', wheels: 4, letter: 'A', color: 'white' },
  { name: 'Bus', emoji: '🚌', wheels: 4, letter: 'B', color: 'yellow' },
  { name: 'Car', emoji: '🚗', wheels: 4, letter: 'C', color: 'red' },
  { name: 'Delivery Truck', emoji: '🚚', wheels: 4, letter: 'D', color: 'white' },
  { name: 'Fire Truck', emoji: '🚒', wheels: 6, letter: 'F', color: 'red' },
  { name: 'Garbage Truck', emoji: '🚛', wheels: 6, letter: 'G', color: 'green' },
  { name: 'Helicopter', emoji: '🚁', wheels: 0, letter: 'H', color: 'white' },
  { name: 'Jeep', emoji: '🚙', wheels: 4, letter: 'J', color: 'green' },
  { name: 'Motorcycle', emoji: '🏍️', wheels: 2, letter: 'M', color: 'red' },
  { name: 'Police Car', emoji: '🚓', wheels: 4, letter: 'P', color: 'blue' },
  { name: 'Race Car', emoji: '🏎️', wheels: 4, letter: 'R', color: 'red' },
  { name: 'Taxi', emoji: '🚕', wheels: 4, letter: 'T', color: 'yellow' },
  { name: 'Tractor', emoji: '🚜', wheels: 4, letter: 'T', color: 'green' },
  { name: 'Train', emoji: '🚆', wheels: 0, letter: 'T', color: 'blue' },
  { name: 'Van', emoji: '🚐', wheels: 4, letter: 'V', color: 'white' },
  { name: 'Yacht', emoji: '⛵', wheels: 0, letter: 'Y', color: 'white' }
];

export const FIRST_WORDS = [
  { word: 'bird', emoji: '🐦' },
  { word: 'car', emoji: '🚗' },
  { word: 'wheel', emoji: '⚙️' },
  { word: 'go', emoji: '🏁' },
  { word: 'more', emoji: '➕' },
  { word: 'up', emoji: '⬆️' },
  { word: 'down', emoji: '⬇️' },
  { word: 'fast', emoji: '⚡' },
  { word: 'slow', emoji: '🐌' },
  { word: 'red', emoji: '🔴' },
  { word: 'blue', emoji: '🔵' },
  { word: 'big', emoji: '🐘' },
  { word: 'small', emoji: '🐜' },
  { word: 'truck', emoji: '🚛' },
  { word: 'bus', emoji: '🚌' },
  { word: 'plane', emoji: '✈️' }
];

export function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function pickRandom(array, count) {
  return shuffle(array).slice(0, count);
}

export function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
