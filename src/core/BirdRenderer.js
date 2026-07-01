/** @file BirdRenderer.js - Shared CSS bird builder + celebration banner */

import { BIRDS, shuffle, wait } from './gameData.js';

const COLOR_MAP = {
  red: '#D32F2F', blue: '#1976D2', brown: '#8D6E63',
  green: '#388E3C', black: '#333333', yellow: '#F9A825',
  pink: '#F06292', white: '#E0E0E0', orange: '#FF7043',
  darkblue: '#0D47A1', cream: '#FFF8E1', gold: '#FFB300',
  peach: '#FFCCBC', darkgreen: '#1B5E20', grey: '#757575'
};

const WING_COLOR_MAP = {
  red: '#B71C1C', blue: '#1565C0', brown: '#6D4C41',
  green: '#2E7D32', black: '#212121', yellow: '#F57F17',
  pink: '#E91E63', white: '#BDBDBD', orange: '#E64A19',
  darkblue: '#0A2E5C', cream: '#F0E6C8', gold: '#F9A825',
  peach: '#FFAB91', darkgreen: '#0D3B0D', grey: '#616161'
};

/**
 * Rich bird data with per-species visual traits.
 * Every bird has distinct head, beak, eyes, and markings so kids can tell them apart.
 */
export const BIRD_VISUALS = [
  // Cardinal: red body, pointed crest, thick black beak
  { name: 'Cardinal', bodyColor: 'red', headColor: 'red', beakColor: '#333',
    beakShape: 'thick', eyeSize: 'normal', crest: 'pointed', facePatch: null, scale: 1.0 },
  // Blue Jay: blue body, white face, blue crest, black pointed beak
  { name: 'Blue Jay', bodyColor: 'blue', headColor: 'blue', beakColor: '#333',
    beakShape: 'pointed', eyeSize: 'normal', crest: 'blue', facePatch: 'white', scale: 1.0 },
  // Robin: brown body, orange chest, brown head, yellow thin beak
  { name: 'Robin', bodyColor: 'brown', headColor: 'brown', beakColor: '#FFC107',
    beakShape: 'thin', eyeSize: 'normal', crest: null, facePatch: 'orange', scale: 1.0 },
  // Eagle: brown body, white head, yellow hooked beak, large eyes
  { name: 'Eagle', bodyColor: 'brown', headColor: 'white', beakColor: '#FF8F00',
    beakShape: 'hooked', eyeSize: 'large', crest: null, facePatch: null, scale: 1.15 },
  // Owl: brown, huge eyes, small yellow beak, ear tufts
  { name: 'Owl', bodyColor: 'brown', headColor: 'brown', beakColor: '#FF8F00',
    beakShape: 'small', eyeSize: 'huge', crest: null, facePatch: null, earTufts: true, scale: 1.0 },
  // Parrot: green body, curved orange beak, small crest
  { name: 'Parrot', bodyColor: 'green', headColor: 'green', beakColor: '#FF7043',
    beakShape: 'curved', eyeSize: 'normal', crest: 'small', facePatch: 'white', scale: 1.0 },
  // Penguin: black body, white belly, black head, orange beak, white face patch
  { name: 'Penguin', bodyColor: 'black', headColor: 'black', beakColor: '#FF8F00',
    beakShape: 'penguin', eyeSize: 'normal', crest: null, facePatch: 'white', belly: 'white', scale: 1.0 },
  // Duck: yellow body, yellow head, flat orange beak
  { name: 'Duck', bodyColor: 'yellow', headColor: 'yellow', beakColor: '#FF7043',
    beakShape: 'flat', eyeSize: 'normal', crest: null, facePatch: null, scale: 1.0 },
  // Flamingo: pink, long thin curved pink beak
  { name: 'Flamingo', bodyColor: 'pink', headColor: 'pink', beakColor: '#E91E63',
    beakShape: 'longcurved', eyeSize: 'normal', crest: null, facePatch: null, scale: 1.1 },
  // Peacock: green body, blue head, small crest
  { name: 'Peacock', bodyColor: 'green', headColor: 'darkblue', beakColor: '#333',
    beakShape: 'pointed', eyeSize: 'normal', crest: 'peacock', facePatch: null, scale: 1.0 },
  // Swan: white, long neck, orange beak
  { name: 'Swan', bodyColor: 'white', headColor: 'white', beakColor: '#FF7043',
    beakShape: 'longorange', eyeSize: 'normal', crest: null, facePatch: null, scale: 1.1 },
  // Hummingbird: green, very long thin beak, tiny body
  { name: 'Hummingbird', bodyColor: 'green', headColor: 'green', beakColor: '#333',
    beakShape: 'needle', eyeSize: 'tiny', crest: null, facePatch: null, scale: 0.75 }
];

function resolveColor(c) { return COLOR_MAP[c] || c; }
function resolveWingColor(c) { return WING_COLOR_MAP[c] || resolveColor(c); }

/** Build a CSS-drawn bird with per-species visual variation.
 *  @param {Object} birdData - from BIRD_VISUALS
 *  @param {Object} options - scale, direction, index
 *  @returns {HTMLElement} the bird wrapper
 */
export function buildBird(birdData, { scale = 1, direction = 'right', index = 0 } = {}) {
  const bodyColor = resolveColor(birdData.bodyColor);
  const headColor = resolveColor(birdData.headColor);
  const wingColor = resolveWingColor(birdData.bodyColor);

  const flip = direction === 'left' ? 'scaleX(-1)' : '';
  const baseScale = (birdData.scale || 1) * scale;

  const wrapper = document.createElement('div');
  wrapper.className = 'css-bird';
  wrapper.style.cssText = `
    position:absolute;left:-70px;top:40px;width:55px;height:40px;z-index:4;
    will-change:transform;pointer-events:none;
    transform:${flip} scale(${baseScale});
    transform-origin:center center;
  `;

  // --- Tail ---
  const tail = document.createElement('div');
  tail.style.cssText = `
    position:absolute;left:-10px;top:16px;width:0;height:0;
    border-right:14px solid ${bodyColor};border-top:7px solid transparent;
    border-bottom:7px solid transparent;z-index:1;
  `;
  wrapper.appendChild(tail);

  // --- Body ---
  const body = document.createElement('div');
  body.style.cssText = `
    position:absolute;left:2px;top:12px;width:34px;height:20px;
    background:${bodyColor};border-radius:50%;z-index:2;
  `;
  wrapper.appendChild(body);

  // Belly patch (for penguin etc.)
  if (birdData.belly) {
    const belly = document.createElement('div');
    belly.style.cssText = `
      position:absolute;left:8px;top:16px;width:22px;height:14px;
      background:${resolveColor(birdData.belly)};border-radius:50%;z-index:3;
      opacity:0.9;
    `;
    wrapper.appendChild(belly);
  }

  // --- Neck (for swan/flamingo) ---
  if (birdData.name === 'Swan') {
    const neck = document.createElement('div');
    neck.style.cssText = `
      position:absolute;right:8px;top:-8px;width:10px;height:20px;
      background:${headColor};border-radius:50%;z-index:2;
    `;
    wrapper.appendChild(neck);
  }
  if (birdData.name === 'Flamingo') {
    const neck = document.createElement('div');
    neck.style.cssText = `
      position:absolute;right:10px;top:-4px;width:8px;height:16px;
      background:${headColor};border-radius:50%;z-index:2;transform:rotate(15deg);
    `;
    wrapper.appendChild(neck);
  }

  // --- Head ---
  const headSize = birdData.name === 'Hummingbird' ? 12 : 18;
  const headTop = birdData.name === 'Swan' ? -4 : birdData.name === 'Flamingo' ? 0 : 4;
  const headRight = birdData.name === 'Swan' ? -8 : -2;
  const head = document.createElement('div');
  head.style.cssText = `
    position:absolute;right:${headRight}px;top:${headTop}px;
    width:${headSize}px;height:${headSize}px;
    background:${headColor};border-radius:50%;z-index:3;
  `;
  wrapper.appendChild(head);

  // --- Face patch ---
  if (birdData.facePatch) {
    const patchColor = birdData.facePatch === 'orange' ? '#FF7043'
      : birdData.facePatch === 'white' ? '#FFFFFF' : resolveColor(birdData.facePatch);
    const patch = document.createElement('div');
    patch.style.cssText = `
      position:absolute;right:${headRight + 2}px;top:${headTop + 3}px;
      width:${headSize - 4}px;height:${headSize - 6}px;
      background:${patchColor};border-radius:50%;z-index:4;opacity:0.85;
    `;
    wrapper.appendChild(patch);
  }

  // --- Ear tufts (owl) ---
  if (birdData.earTufts) {
    const tuftL = document.createElement('div');
    tuftL.style.cssText = `
      position:absolute;right:${headRight + 6}px;top:${headTop - 4}px;
      width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent;
      border-bottom:8px solid ${headColor};z-index:5;
    `;
    wrapper.appendChild(tuftL);
    const tuftR = document.createElement('div');
    tuftR.style.cssText = `
      position:absolute;right:${headRight - 2}px;top:${headTop - 4}px;
      width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent;
      border-bottom:8px solid ${headColor};z-index:5;
    `;
    wrapper.appendChild(tuftR);
  }

  // --- Beak ---
  const beak = buildBeak(birdData, headRight, headTop, headSize);
  wrapper.appendChild(beak);

  // --- Eye ---
  const eye = buildEye(birdData, headRight, headTop, headSize);
  wrapper.appendChild(eye);

  // --- Crest ---
  if (birdData.crest) {
    const crest = buildCrest(birdData, headRight, headTop, headColor);
    wrapper.appendChild(crest);
  }

  // --- Wing ---
  const wing = document.createElement('div');
  const wingW = birdData.name === 'Hummingbird' ? 18 : 26;
  const wingH = birdData.name === 'Hummingbird' ? 10 : 16;
  const wingLeft = birdData.name === 'Hummingbird' ? 12 : 8;
  wing.style.cssText = `
    position:absolute;left:${wingLeft}px;top:2px;width:${wingW}px;height:${wingH}px;
    background:${wingColor};border-radius:50% 50% 50% 50% / 70% 70% 30% 30%;
    transform-origin:4px 14px;z-index:4;opacity:0.9;
    animation:birdFlapWing 0.38s ease-in-out infinite;
  `;
  wrapper.appendChild(wing);
  wing.style.animationDelay = `${(index * 0.07) % 0.3}s`;
  wing.style.animationDuration = `${0.32 + Math.random() * 0.12}s`;

  return wrapper;
}

function buildBeak(birdData, headRight, headTop, headSize) {
  const beak = document.createElement('div');
  const shape = birdData.beakShape;
  const color = birdData.beakColor;

  switch (shape) {
    case 'thick': // Cardinal
      beak.style.cssText = `
        position:absolute;right:${headRight - 10}px;top:${headTop + 5}px;
        width:0;height:0;border-left:10px solid ${color};border-top:4px solid transparent;
        border-bottom:4px solid transparent;z-index:5;
      `;
      break;
    case 'pointed': // Blue Jay, Peacock
      beak.style.cssText = `
        position:absolute;right:${headRight - 12}px;top:${headTop + 5}px;
        width:0;height:0;border-left:12px solid ${color};border-top:4px solid transparent;
        border-bottom:4px solid transparent;z-index:5;
      `;
      break;
    case 'thin': // Robin
      beak.style.cssText = `
        position:absolute;right:${headRight - 9}px;top:${headTop + 6}px;
        width:0;height:0;border-left:9px solid ${color};border-top:3px solid transparent;
        border-bottom:3px solid transparent;z-index:5;
      `;
      break;
    case 'hooked': // Eagle
      beak.style.cssText = `
        position:absolute;right:${headRight - 13}px;top:${headTop + 5}px;
        width:0;height:0;border-left:14px solid ${color};border-top:5px solid transparent;
        border-bottom:4px solid transparent;z-index:5;transform:rotate(-10deg);
      `;
      break;
    case 'curved': // Parrot
      beak.style.cssText = `
        position:absolute;right:${headRight - 11}px;top:${headTop + 4}px;
        width:0;height:0;border-left:11px solid ${color};border-top:4px solid transparent;
        border-bottom:4px solid transparent;z-index:5;transform:rotate(-15deg);
      `;
      break;
    case 'small': // Owl
      beak.style.cssText = `
        position:absolute;right:${headRight - 6}px;top:${headTop + 7}px;
        width:0;height:0;border-left:7px solid ${color};border-top:3px solid transparent;
        border-bottom:3px solid transparent;z-index:5;
      `;
      break;
    case 'penguin': // Penguin
      beak.style.cssText = `
        position:absolute;right:${headRight - 10}px;top:${headTop + 6}px;
        width:0;height:0;border-left:10px solid ${color};border-top:4px solid transparent;
        border-bottom:4px solid transparent;z-index:5;
      `;
      break;
    case 'flat': // Duck
      beak.style.cssText = `
        position:absolute;right:${headRight - 14}px;top:${headTop + 6}px;
        width:0;height:0;border-left:14px solid ${color};border-top:5px solid transparent;
        border-bottom:5px solid transparent;z-index:5;
      `;
      break;
    case 'longcurved': // Flamingo
      beak.style.cssText = `
        position:absolute;right:${headRight - 18}px;top:${headTop + 6}px;
        width:0;height:0;border-left:18px solid ${color};border-top:3px solid transparent;
        border-bottom:3px solid transparent;z-index:5;transform:rotate(-20deg);
      `;
      break;
    case 'longorange': // Swan
      beak.style.cssText = `
        position:absolute;right:${headRight - 16}px;top:${headTop + 6}px;
        width:0;height:0;border-left:16px solid ${color};border-top:4px solid transparent;
        border-bottom:4px solid transparent;z-index:5;
      `;
      break;
    case 'needle': // Hummingbird
      beak.style.cssText = `
        position:absolute;right:${headRight - 18}px;top:${headTop + 4}px;
        width:0;height:0;border-left:20px solid ${color};border-top:2px solid transparent;
        border-bottom:2px solid transparent;z-index:5;
      `;
      break;
    default:
      beak.style.cssText = `
        position:absolute;right:${headRight - 10}px;top:${headTop + 6}px;
        width:0;height:0;border-left:10px solid ${color};border-top:4px solid transparent;
        border-bottom:4px solid transparent;z-index:5;
      `;
  }
  return beak;
}

function buildEye(birdData, headRight, headTop, headSize) {
  const size = birdData.eyeSize;
  const eyeW = size === 'huge' ? 7 : size === 'large' ? 6 : size === 'tiny' ? 3 : 5;
  const eyeH = size === 'huge' ? 7 : size === 'large' ? 6 : size === 'tiny' ? 3 : 5;
  const pupilW = size === 'huge' ? 3 : size === 'large' ? 2.5 : size === 'tiny' ? 1.5 : 2.5;
  const pupilH = size === 'huge' ? 3 : size === 'large' ? 2.5 : size === 'tiny' ? 1.5 : 2.5;
  const eyeTop = size === 'huge' ? headTop + 3 : size === 'large' ? headTop + 3 : headTop + 4;
  const eyeRight = headRight + (size === 'huge' ? 3 : size === 'large' ? 4 : 4);
  const pupilRight = eyeRight + (size === 'huge' ? 1.5 : size === 'large' ? 1.5 : 1);
  const pupilTop = eyeTop + (size === 'huge' ? 1.5 : size === 'large' ? 1.5 : 1);

  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:absolute;z-index:6;';

  const eye = document.createElement('div');
  eye.style.cssText = `
    position:absolute;right:${eyeRight}px;top:${eyeTop}px;
    width:${eyeW}px;height:${eyeH}px;
    background:#fff;border-radius:50%;z-index:6;
  `;
  wrapper.appendChild(eye);

  const pupil = document.createElement('div');
  pupil.style.cssText = `
    position:absolute;right:${pupilRight}px;top:${pupilTop}px;
    width:${pupilW}px;height:${pupilH}px;
    background:#333;border-radius:50%;z-index:7;
  `;
  wrapper.appendChild(pupil);

  // Owl eyes have a yellow ring
  if (birdData.name === 'Owl') {
    const ring = document.createElement('div');
    ring.style.cssText = `
      position:absolute;right:${eyeRight - 1}px;top:${eyeTop - 1}px;
      width:${eyeW + 2}px;height:${eyeH + 2}px;
      border:2px solid #FFD54F;border-radius:50%;z-index:5;
    `;
    wrapper.insertBefore(ring, eye);
  }

  return wrapper;
}

function buildCrest(birdData, headRight, headTop, headColor) {
  const crest = document.createElement('div');
  const style = birdData.crest;

  if (style === 'pointed') { // Cardinal
    crest.style.cssText = `
      position:absolute;right:${headRight + 4}px;top:${headTop - 6}px;
      width:0;height:0;border-left:3px solid transparent;border-right:3px solid transparent;
      border-bottom:8px solid ${headColor};z-index:6;
    `;
  } else if (style === 'blue') { // Blue Jay
    crest.style.cssText = `
      position:absolute;right:${headRight + 3}px;top:${headTop - 8}px;
      width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent;
      border-bottom:10px solid ${headColor};z-index:6;
    `;
  } else if (style === 'small') { // Parrot
    crest.style.cssText = `
      position:absolute;right:${headRight + 5}px;top:${headTop - 5}px;
      width:0;height:0;border-left:2px solid transparent;border-right:2px solid transparent;
      border-bottom:6px solid #FF7043;z-index:6;
    `;
  } else if (style === 'peacock') { // Peacock
    crest.style.cssText = `
      position:absolute;right:${headRight + 3}px;top:${headTop - 7}px;
      width:0;height:0;border-left:3px solid transparent;border-right:3px solid transparent;
      border-bottom:8px solid #0D47A1;z-index:6;
    `;
  }
  return crest;
}

/** Inject all CSS keyframes needed for birds and celebration. */
export function injectBirdStyles() {
  if (document.getElementById('bird-counter-styles')) return;
  const style = document.createElement('style');
  style.id = 'bird-counter-styles';
  style.textContent = `
    @keyframes birdFlapWing {
      0%   { transform: rotate(-30deg) scaleY(1); }
      25%  { transform: rotate(15deg) scaleY(0.85); }
      50%  { transform: rotate(40deg) scaleY(0.7); }
      75%  { transform: rotate(10deg) scaleY(0.9); }
      100% { transform: rotate(-30deg) scaleY(1); }
    }
    @keyframes birdGlide {
      0%   { transform: translateY(0px); }
      50%  { transform: translateY(-6px); }
      100% { transform: translateY(0px); }
    }
    @keyframes birdFlyAcross {
      from { left: -70px; }
      to   { left: calc(100% + 40px); }
    }
    @keyframes bannerFlyIn {
      from { transform: translateX(-120vw); }
      to   { transform: translateX(0); }
    }
    @keyframes bannerFloat {
      0%, 100% { transform: translateY(0); }
      50%  { transform: translateY(-8px); }
    }
    @keyframes bannerFadeOut {
      from { opacity: 1; }
      to   { opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// CELEBRATION BANNER - birds fly across pulling a "Great Job" banner
// ---------------------------------------------------------------------------

/**
 * Show a full-screen celebration: birds fly across in a V-formation
 * pulling a banner with the given message. Works from ANY game.
 *
 * @param {Object} opts
 * @param {string} opts.message - text on the banner (default: "Great Job!")
 * @param {Object} opts.tts - TTS instance
 * @param {Object} opts.audio - AudioManager instance
 * @param {number} opts.pauseMs - how long to pause the banner in center (default 2000)
 * @returns {Promise} resolves when celebration finishes
 */
export async function celebrateWin({ message = 'Great Job!', tts, audio, pauseMs = 2500 }) {
  injectBirdStyles();

  const overlay = document.createElement('div');
  overlay.id = 'celebration-overlay';
  overlay.style.cssText = `
    position:fixed;top:0;left:0;width:100%;height:100%;
    background:linear-gradient(180deg, #7EC8E3 0%, #A8D8EA 55%, #C8E6C9 85%, #81C784 85%);
    z-index:9999;overflow:hidden;pointer-events:none;opacity:0;transition:opacity 0.5s ease;
  `;
  document.body.appendChild(overlay);

  // Fade in
  requestAnimationFrame(() => { overlay.style.opacity = '1'; });

  // Sun
  const sun = document.createElement('div');
  sun.style.cssText = 'position:absolute;top:20px;right:40px;width:50px;height:50px;background:#FFD54F;border-radius:50%;box-shadow:0 0 20px #FFD54F;';
  overlay.appendChild(sun);

  // Clouds
  const clouds = [
    { top: 30, left: '10%', size: 2 },
    { top: 60, left: '70%', size: 1.5 }
  ];
  clouds.forEach(c => {
    const el = document.createElement('div');
    el.style.cssText = `position:absolute;top:${c.top}px;left:${c.left};font-size:${c.size}rem;opacity:0.6;`;
    el.textContent = '☁️';
    overlay.appendChild(el);
  });

  // Ground
  const ground = document.createElement('div');
  ground.style.cssText = 'position:absolute;bottom:0;left:0;width:100%;height:60px;background:linear-gradient(180deg, #81C784 0%, #66BB6A 50%, #4CAF50 100%);';
  overlay.appendChild(ground);

  // Trees
  [40, 150, 380, 500].forEach((left, i) => {
    const tree = document.createElement('div');
    tree.style.cssText = `position:absolute;bottom:50px;left:${left}px;transform:scale(${0.8 + i * 0.1});z-index:2;`;
    tree.innerHTML = `<div style="width:8px;height:30px;background:#8D6E63;margin:0 auto;border-radius:2px;"></div>
      <div style="width:36px;height:36px;background:#43A047;border-radius:50%;margin-top:-10px;margin-left:-14px;"></div>`;
    overlay.appendChild(tree);
  });

  // Pick 3 birds for the formation
  const pool = shuffle([...BIRD_VISUALS]);
  const leadBird = pool[0];
  const leftBird = pool[1];
  const rightBird = pool[2];

  // Formation group (birds + banner move as one unit)
  const formation = document.createElement('div');
  formation.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;';
  overlay.appendChild(formation);

  // Build birds positioned in V-formation relative to the group
  // Lead bird center-top, left bird down-left, right bird down-right
  const lead = buildBird(leadBird, { scale: 1.3, direction: 'right', index: 0 });
  lead.style.left = '45%';
  lead.style.top = '25%';
  formation.appendChild(lead);

  const leftWing = buildBird(leftBird, { scale: 1.1, direction: 'right', index: 1 });
  leftWing.style.left = '35%';
  leftWing.style.top = '38%';
  formation.appendChild(leftWing);

  const rightWing = buildBird(rightBird, { scale: 1.1, direction: 'right', index: 2 });
  rightWing.style.left = '55%';
  rightWing.style.top = '38%';
  formation.appendChild(rightWing);

  // Strings from birds to banner
  const stringL = document.createElement('div');
  stringL.style.cssText = `
    position:absolute;left:38%;top:40%;width:2px;height:40px;
    background:#8D6E63;transform:rotate(25deg);z-index:3;
  `;
  formation.appendChild(stringL);

  const stringR = document.createElement('div');
  stringR.style.cssText = `
    position:absolute;left:58%;top:40%;width:2px;height:40px;
    background:#8D6E63;transform:rotate(-25deg);z-index:3;
  `;
  formation.appendChild(stringR);

  // Banner
  const banner = document.createElement('div');
  banner.style.cssText = `
    position:absolute;left:30%;top:50%;width:40%;min-width:200px;max-width:400px;
    height:50px;background:#FFEB3B;border:3px solid #FBC02D;border-radius:12px;
    display:flex;align-items:center;justify-content:center;z-index:5;
    box-shadow:0 4px 12px rgba(0,0,0,0.2);animation:bannerFloat 2s ease-in-out infinite;
  `;
  banner.innerHTML = `<span style="font-size:1.6rem;font-weight:800;color:#E65100;font-family:Nunito,sans-serif;">${message}</span>`;
  formation.appendChild(banner);

  // Confetti particles
  for (let i = 0; i < 20; i++) {
    const confetti = document.createElement('div');
    confetti.style.cssText = `
      position:absolute;top:${Math.random() * 60 + 10}%;
      left:${Math.random() * 100}%;
      width:${6 + Math.random() * 6}px;height:${6 + Math.random() * 6}px;
      background:${['#FFEB3B', '#FF7043', '#4CAF50', '#2196F3', '#E91E63', '#9C27B0'][Math.floor(Math.random() * 6)]};
      border-radius:50%;opacity:0.8;z-index:10;pointer-events:none;
      animation:bannerFloat ${2 + Math.random() * 2}s ease-in-out infinite;
      animation-delay:${Math.random() * 1}s;
    `;
    overlay.appendChild(confetti);
  }

  // TTS
  if (tts) {
    await wait(300);
    tts.speak(message);
  }
  if (audio) {
    audio.playCelebrate();
  }

  // Animate the whole formation flying in from left
  formation.style.transition = 'transform 3s ease-in-out';
  formation.style.transform = 'translateX(-120vw)';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      formation.style.transform = 'translateX(0)';
    });
  });

  // Wait for birds to arrive, pause with banner showing
  await wait(2000);
  await wait(pauseMs);

  // Fly away to the right
  formation.style.transition = 'transform 2.5s ease-in';
  formation.style.transform = 'translateX(120vw)';

  await wait(1000);
  // Fade out overlay
  overlay.style.opacity = '0';
  await wait(500);
  overlay.remove();
}

/**
 * Look up a bird's visual data by name (case-insensitive).
 */
export function getBirdVisual(name) {
  return BIRD_VISUALS.find(b => b.name.toLowerCase() === name.toLowerCase()) || BIRD_VISUALS[0];
}

/**
 * Look up all visual data matching a bird object from gameData.
 */
export function getBirdVisualFrom(birdObj) {
  return getBirdVisual(birdObj.name);
}
