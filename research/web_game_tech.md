# Web-Based Toddler Educational Game Suite — Technology Stack Research

**Research Date:** 2026-06-23  
**Target Audience:** Toddlers aged 3–4 years  
**Focus:** Cross-device web games with optional autism-friendly design considerations

---

## Executive Summary

For a web-based educational game suite targeting toddlers (3–4 years old), **plain HTML5/CSS/JavaScript with a lightweight component approach** is recommended over a full React framework. The primary design constraints are: (1) large touch targets for unrefined motor skills, (2) reliable offline-first operation, (3) gentle, non-flashing animations, (4) text-to-speech for verbal echo encouragement, and (5) optional speech recognition with significant accuracy caveats for this age group. A **Progressive Web App (PWA)** architecture with `localStorage`/`IndexedDB` persistence provides the best offline-first, cross-device experience.

---

## 1. Frontend Framework: React vs. Plain HTML/CSS/JS

### Recommendation: Vanilla HTML5/CSS/JS with Web Components or a Micro-Framework

| Criterion | React | Plain HTML5/CSS/JS |
|-----------|-------|-------------------|
| Bundle Size | ~40KB+ (React + ReactDOM gzipped) | ~0KB baseline |
| Startup Time | Hydration overhead | Instant |
| Game Loop Control | Requires refs/canvas bridges | Direct DOM/Canvas access |
| 60fps Animation | Possible but needs optimization | Easier with direct `requestAnimationFrame` |
| Learning Curve | Moderate | Low for simple interactions |
| State Complexity | Overkill for toddler games | `localStorage` + simple objects suffice |

**Key Research Findings:**

Leading toddler educational games (e.g., *Toca Boca* series, *HappyClicks*, *Kakadoo*, *Find Them All*) prioritize **simplicity over framework sophistication** [^1][^2][^3]. The Toca Boca design philosophy demonstrates that toddlers discover gestures intuitively when interfaces are self-evident — "with some gracious gesture he got back to the home screen… no one could have taught this" [^4].

HTML5 games marketed for this demographic emphasize: [^5]
- Simple touch and click controls for children
- Colorful graphics and attractive animations
- Fully responsive design (mobile, tablet, desktop)
- Offline play capability
- Clean, well-structured source code

**Architecture Suggestion:**
Use a **modular vanilla JS architecture** with ES modules:

```javascript
// src/engine/Game.js
export class Game {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.state = {};
    this.scenes = new Map();
    this.currentScene = null;
    this.loopId = null;
  }

  start() {
    const loop = () => {
      this.update();
      this.render();
      this.loopId = requestAnimationFrame(loop);
    };
    loop();
  }

  stop() { cancelAnimationFrame(this.loopId); }
  update() { if (this.currentScene) this.currentScene.update(); }
  render() { if (this.currentScene) this.currentScene.render(this.ctx); }
}
```

For DOM-based games (drag-drop, matching), plain JS with **CSS-driven animations** is sufficient. Only adopt React if the project grows beyond ~10 mini-games with shared complex UI state.

---

## 2. Audio: Text-to-Speech, Sound Effects & Music

### 2.1 Text-to-Speech (Web Speech API — `SpeechSynthesis`)

**Status:** Well-supported in modern browsers (Chrome, Edge, Safari, Firefox).  
**Best For:** Encouraging verbal echo, reading instructions aloud, naming objects.

**Browser Support Matrix:**

| Browser | `speechSynthesis` | Child-Friendly Voices | Notes |
|---------|-------------------|----------------------|-------|
| Chrome/Edge | ✅ Full | Multiple | Best voice selection |
| Safari | ✅ Full | Samantha, Fred | Requires user gesture for audio init |
| Firefox | ✅ Partial | Limited | Fewer premium voices |

**Implementation Pattern:**

```javascript
class ToddlerSpeech {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voice = null;
    this.onReady = new Promise((resolve) => {
      if (this.synth.getVoices().length) resolve();
      else this.synth.onvoiceschanged = () => resolve();
    });
  }

  async speak(text, { rate = 0.85, pitch = 1.1, volume = 0.9 } = {}) {
    await this.onReady;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = rate;      // Slower for toddlers
    utter.pitch = pitch;    // Slightly higher pitch is engaging
    utter.volume = volume;
    utter.voice = this.voice || this.synth.getVoices().find(v => v.lang === 'en-US');
    this.synth.speak(utter);
    return new Promise(resolve => utter.onend = resolve);
  }

  cancel() { this.synth.cancel(); }
}
```

**Recommendations:** [^6]
- Set `rate` to **0.8–0.9** for toddlers (slower than default)
- Use a **warm, clear voice** (e.g., "Google US English" or "Samantha" on macOS)
- Always provide a **visual indicator** while speaking (e.g., gentle mouth animation on a character)
- Chunk long text into sentences; Chrome has a ~15-second utterance limit bug [^7]
- For production fallback, consider the **HTML5-Speak-Easy** wrapper or Azure Cognitive Services polyfill [^8]

### 2.2 Sound Effects (Web Audio API)

Use the **Web Audio API** (not HTML5 `<audio>`) for:
- Low-latency feedback sounds (tap, correct, incorrect, win)
- Simultaneous overlapping sounds (e.g., background music + tap sound)
- Dynamic pitch/time modifications

```javascript
class AudioManager {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.sounds = new Map();
  }

  async load(name, url) {
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    this.sounds.set(name, await this.ctx.decodeAudioData(buf));
  }

  play(name, { volume = 1, pitch = 1 } = {}) {
    if (!this.sounds.has(name)) return;
    const source = this.ctx.createBufferSource();
    source.buffer = this.sounds.get(name);
    const gain = this.ctx.createGain();
    gain.gain.value = volume;
    source.playbackRate.value = pitch;
    source.connect(gain).connect(this.ctx.destination);
    source.start();
  }
}
```

**Asset Strategy:** Use short **OGG/MP3** dual-format sound files (<2 seconds each). Preload critical sounds; lazy-load secondary ones.

### 2.3 Background Music

**Recommendation:** Make background music **optional and off by default** for autism-friendly design. When enabled:

- Use very low volume (0.15–0.25)
- Prefer simple, repetitive, soothing melodies
- Allow instant mute via always-visible toggle
- Respect `prefers-reduced-sound` / `prefers-reduced-motion` media queries
- Avoid sudden dynamic range changes

---

## 3. Touch & Input Optimization

### 3.1 Tap Targets

For toddlers, touch targets must be significantly larger than adult standards:

| Standard | Minimum Size | Recommended for Toddlers |
|----------|------------|----------------------|
| WCAG 2.1 | 44×44px | **80×80px minimum** |
| Apple HIG | 44×44pt | **88×88pt** |
| Toddler-optimized games | N/A | **100×100px–120×120px** |

**Research Evidence:** Apps like *App For Kids* (ages 1–3) and *HappyClicks* use "big colorful pictures" and "simple, toddler-ready design" where "every button, picture, and feature is perfectly sized for tiny hands" [^9][^10]. *Kakadoo* notes that "intuitive controls and captivating gameplay ensure that even the kids can enjoy and benefit" [^2].

### 3.2 Drag-and-Drop

Implement **custom drag-and-drop** rather than native HTML5 DnD (which is desktop-oriented and has poor touch support):

```javascript
// Touch-friendly drag-drop using pointer events
element.addEventListener('pointerdown', (e) => {
  const drag = { el: e.target, startX: e.clientX, startY: e.clientY };
  
  const onMove = (ev) => {
    const dx = ev.clientX - drag.startX;
    const dy = ev.clientY - drag.startY;
    drag.el.style.transform = `translate(${dx}px, ${dy}px)`;
  };
  
  const onUp = (ev) => {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onUp);
    // Snap logic here
  };
  
  document.addEventListener('pointermove', onMove);
  document.addEventListener('pointerup', onUp);
});
```

**Drag-and-Drop Libraries:**
- **Interact.js** (~40KB) — Multi-touch, pointer events, snap-to-grid
- **Plain JS with Pointer Events** — Sufficient for simple toddler games

### 3.3 Gesture Handling

- **Avoid complex gestures** (swipe, pinch, rotate) entirely for ages 3–4
- Use **single tap** as the primary interaction
- Use **tap-and-hold** sparingly (e.g., for confirming a choice)
- Provide **generous hit areas** that extend beyond visual boundaries by 10–15px
- Implement **touch cancellation** if the user drags far from the start point (reject accidental drags)

### 3.4 Preventing Accidental Interactions

```css
/* Prevent double-tap zoom, text selection, and context menu */
.game-container {
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}
```

---

## 4. Speech Recognition for "Say the Word" Games

### 4.1 Accuracy Reality Check

**This is the most critical finding.** Speech recognition for children performs significantly worse than for adults:

| Age Group | Typical WER (Word Error Rate) | Notes |
|-----------|---------------------------|-------|
| Adults | ~5% | Baseline |
| All children | 11–18% | 2–3x worse than adults |
| Ages 6–10 | 15–21% | Formant modification helps |
| **Ages 4–6** | **Up to 35%** | **Very challenging** |
| **Ages 3–4** | **Unknown / Likely >35%** | **Limited research data** |

**Key Reasons:** [^11][^12]
- Children's fundamental frequency (F0) is 250–400 Hz vs. adult 85–180 Hz
- Higher pitch and formant frequencies confuse acoustic models trained on adult voices
- Mispronunciations ("wabbit" for "rabbit"), disfluencies, and incomplete sentences
- Shorter vocal tracts produce different resonance patterns
- Limited child-specific training data in general ASR models

### 4.2 Recommendations for Toddlers (3–4)

**Option A: Web Speech API (Free, Limited)**
- `SpeechRecognition` is available in Chrome/Edge only (WebKit requires prefixed `webkitSpeechRecognition`)
- **Child accuracy is poor** for ages 3–4 with generic models
- **Use only for:** Simple yes/no, single-word commands with a small grammar list

```javascript
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 3;

// Constrain to known words for better accuracy
const grammar = new SpeechGrammarList();
grammar.addFromString('cat dog bird fish apple', 1);
recognition.grammars = grammar;
```

**Option B: UG Labs Child-Native ASR (Commercial)**
- Claims **95%+ accuracy for ages 3–16** [^13]
- The only ASR specifically trained on child voices
- Requires API subscription and cloud connectivity
- **May be the only viable option** for reliable "say the word" gameplay at age 3–4

**Option C: Avoid ASR for Age 3–4; Use TTS + Visual Confirmation Instead**
- Have the game say the word via TTS
- Child repeats it (or doesn't) — no technical verification needed
- Reward attempt with visual/audio feedback
- This aligns with **speech therapy best practices** where the goal is practice, not perfection [^14]

**Architecture Decision:** For the initial release, **use TTS-only with visual encouragement**. If ASR is required, treat UG Labs as the primary candidate and implement Web Speech API as a free fallback with gracefully degraded accuracy.

---

## 5. State Management & Offline-First Design

### 5.1 localStorage + IndexedDB Strategy

For toddler games, state is relatively simple: progress per mini-game, stars/achievements, settings, and parent preferences.

**Storage Hierarchy:**

| Data Type | Storage | Size | Example |
|-----------|---------|------|---------|
| Settings | `localStorage` | < 5KB | Sound on/off, music volume, difficulty |
| Progress | `localStorage` | < 10KB | Stars per level, completion flags |
| Game Data | `IndexedDB` | < 50KB | Cached image manifests, audio metadata |
| Assets | Cache API (Service Worker) | > 1MB | Images, sounds, fonts |

**Implementation Example:**

```javascript
class GameState {
  constructor(namespace = 'toddlerGame') {
    this.ns = namespace;
  }

  get(key) {
    try { return JSON.parse(localStorage.getItem(`${this.ns}:${key}`)); }
    catch { return null; }
  }

  set(key, value) {
    localStorage.setItem(`${this.ns}:${key}`, JSON.stringify(value));
  }

  // Child-safe: no sensitive data, no PII
  exportProgress() {
    return { ...this.get('progress'), exportedAt: Date.now() };
  }
}
```

### 5.2 Offline-First Architecture (PWA)

A **Progressive Web App** is strongly recommended for toddler games:

```javascript
// service-worker.js
const CACHE_NAME = 'toddler-game-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/scripts/game.js',
  '/assets/audio/tap.mp3',
  // ... other critical assets
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});
```

**Benefits for Toddler Games:** [^15]
- Works without internet (airplane mode, travel, limited data plans)
- No app store approval process
- "Add to Home Screen" feels like a native app
- Parents can control device usage without ads/network distractions

**Cross-Device Sync (Optional Future):**
- Use a simple QR-code or short code pairing system for parent accounts
- Sync via encrypted cloud storage (Firebase, Supabase, or custom backend)
- **Always keep local data as the source of truth** — sync is additive only

---

## 6. Responsive Design for Phone, Tablet & Desktop

### 6.1 Breakpoint Strategy

Use a **mobile-first** approach (toddlers primarily use tablets/phones):

```css
/* Base: Mobile phones (portrait) */
:root {
  --tile-size: 80px;
  --font-large: 1.5rem;
  --spacing: 12px;
}

/* Small tablets / large phones */
@media (min-width: 500px) {
  :root { --tile-size: 100px; --font-large: 2rem; --spacing: 16px; }
}

/* Tablets (primary target) */
@media (min-width: 768px) {
  :root { --tile-size: 120px; --font-large: 2.5rem; --spacing: 24px; }
}

/* Desktop / large tablets */
@media (min-width: 1200px) {
  :root { --tile-size: 140px; --font-large: 3rem; }
}
```

### 6.2 Game Canvas / Play Area Scaling

For canvas-based games, use a **fit-to-screen** strategy with a fixed aspect ratio:

```javascript
function resizeGame() {
  const aspect = 4 / 3; // Standard tablet ratio
  const w = window.innerWidth;
  const h = window.innerHeight;
  const scale = Math.min(w / (aspect * 100), h / 100);
  
  canvas.style.width = `${aspect * 100 * scale}px`;
  canvas.style.height = `${100 * scale}px`;
}
window.addEventListener('resize', resizeGame);
```

For DOM-based games, use **CSS Grid with `clamp()`** for fluid sizing:

```css
.game-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(var(--tile-size), 1fr));
  gap: var(--spacing);
  padding: var(--spacing);
  max-width: 800px;
  margin: 0 auto;
}
```

### 6.3 Device-Specific Considerations

| Device | Key Design Choice |
|--------|----------------|
| **Phone** | Single-column layout, larger tap targets (relative to screen), bottom-aligned controls |
| **Tablet** | Primary target; 2-column grid, generous spacing, landscape preferred for games |
| **Desktop** | Centered game area with decorative side panels; mouse hover states as bonus feedback |

**Research Evidence:** Games like *Learn ABC* and *Find Them All* explicitly advertise "fully responsive design (mobile, tablet, desktop)" and "optimized for phone and tablet" as core features [^5][^16].

---

## 7. Performance: Lightweight Rendering & 60fps

### 7.1 Rendering Strategy

| Technique | Best For | Performance |
|-----------|----------|-------------|
| **CSS Transforms** | UI animations, transitions, simple movement | Excellent (GPU-accelerated) |
| **Canvas 2D** | Custom drawing, particle effects, complex scenes | Good |
| **DOM + CSS** | Drag-drop, matching, simple puzzle games | Excellent for simple games |
| **WebGL** | 3D, heavy shaders | Overkill for toddler games |

**Recommendation:** Use **DOM + CSS** for most mini-games (matching, sorting, drag-drop). Use **Canvas 2D** only for drawing/art games or if particle effects are needed.

### 7.2 Animation Library Selection

For toddler games, select libraries that support **calm, controllable animations** (no flashing, no rapid movement):

| Library | Size | Best For | Autism-Friendly |
|---------|------|----------|-----------------|
| **Animate.css** | ~7KB min | Simple entrance/exit animations | ✅ Respect `prefers-reduced-motion` |
| **Anime.js** | ~16KB min | Timeline sequences, gentle easing | ✅ Highly configurable |
| **GSAP** | ~30KB+ min | Complex, high-performance needs | ✅ Supports `prefers-reduced-motion` |
| **Lottie** | ~30KB+ player | Vector animations from After Effects | ✅ Smooth vector rendering |

**Recommendation:** Start with **Anime.js** or **Animate.css**. Both are lightweight and support smooth easing. [^17][^18]

**Critical Animation Rules for Toddlers & Autism:** [^19][^20]
- **No flashing** — avoid any element that blinks more than 3 times per second
- **No unexpected motion** — animations should be user-triggered or clearly predictable
- **Respect `prefers-reduced-motion`** — disable non-essential animations when this is set
- **Use calm easing** — `ease-out` and `ease-in-out` feel gentler than `linear` or `ease-in`
- **Keep durations moderate** — 300–600ms for feedback; avoid instant jarring changes

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 7.3 Asset Loading Strategy

```javascript
class AssetLoader {
  constructor() {
    this.cache = new Map();
  }

  async preload(criticalAssets) {
    await Promise.all(criticalAssets.map(a => this.load(a)));
  }

  load(url) {
    if (this.cache.has(url)) return this.cache.get(url);
    const ext = url.split('.').pop();
    const promise = ext === 'mp3' || ext === 'ogg' 
      ? this.loadAudio(url) 
      : this.loadImage(url);
    this.cache.set(url, promise);
    return promise;
  }

  loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }
}
```

**Loading Best Practices:**
- Show a **simple loading screen** with a slowly filling progress bar (no spinning loaders — these can frustrate toddlers)
- Load **critical assets first** (tap sounds, first level images)
- Lazy-load **subsequent levels** while child plays
- Use **WebP** for images with PNG fallback (~30% smaller)
- Use **sprite sheets** for multiple small icons to reduce HTTP requests

---

## 8. Autism-Friendly Design Guidelines (CSS & UX)

### 8.1 Color Palette

```css
:root {
  /* Soft, muted tones — avoid pure white/black */
  --bg-primary: #F5F0E8;      /* Warm cream */
  --bg-secondary: #E8E0D5;    /* Soft beige */
  --accent: #7BA598;          /* Muted sage green */
  --accent-hover: #6A9488;    /* Slightly darker */
  --text-primary: #3D3D3D;    /* Soft charcoal, not pure black */
  --text-secondary: #6B6B6B;  /* Medium gray */
  --success: #A8C686;         /* Soft green */
  --feedback: #D4A574;        /* Warm amber */
}
```

**Design Rules:** [^19][^20][^21]
- ✅ Use soft, muted colors; avoid pure white (`#FFFFFF`) or pure black (`#000000`)
- ✅ High contrast is good, but avoid extreme luminance differences
- ✅ Avoid garish, highly saturated color palettes
- ✅ Be consistent — same colors mean same things across all games

### 8.2 Layout & Interaction

- **Consistent layouts** — navigation, buttons, and game elements stay in the same positions
- **Single-page-per-game** — show all content without scrolling where possible
- **No popups, chatbots, or coach marks** — these are "patches for designs that need simplifying" [^22]
- **No time pressure** — no countdowns, timers, or urgency mechanics
- **Clear feedback** — audio + visual confirmation for every action; never rely solely on icons
- **Text labels with icons** — avoid icon-only buttons
- **Allow up to 5 attempts** before showing a correct answer in quiz-style games [^21]

### 8.3 Motion & Sensory

- **No flashing** — avoid blinking, strobing, or rapid color changes
- **Respect `prefers-reduced-motion`** — this is critical
- **Avoid hard-to-control animations** — no parallax scrolling, no auto-playing videos
- **Touch sensitivity** — prevent accidental selections; allow touch cancellation
- **Optional sound** — all audio should be toggleable; start muted for sensitive users

---

## 9. Recommended Tech Stack Summary

| Layer | Recommendation | Rationale |
|-------|---------------|-----------|
| **Language** | Vanilla ES2020+ (modules) | Lightweight, no build overhead, direct browser API access |
| **Styling** | CSS Custom Properties + Flexbox/Grid | Responsive, themeable, no framework dependency |
| **Build Tool** | Vite (optional) | Fast dev server, optional bundling for production |
| **Game Loop** | `requestAnimationFrame` + custom state manager | Direct control, minimal overhead |
| **Animations** | Anime.js or Animate.css | Lightweight, calm easing, `prefers-reduced-motion` support |
| **Audio (TTS)** | Web Speech API `SpeechSynthesis` | Free, built-in, good voice selection |
| **Audio (SFX)** | Web Audio API | Low latency, overlapping sounds, dynamic control |
| **Speech Recognition** | Web Speech API (fallback) / UG Labs (primary) | Child accuracy is poor with generic models |
| **Storage** | `localStorage` + IndexedDB + Cache API (PWA) | Offline-first, reliable, no backend needed |
| **Drag & Drop** | Interact.js or custom Pointer Events | Touch-optimized, snap-to-grid support |
| **Deployment** | Static hosting + PWA manifest | Works offline, no app store, instant updates |

---

## 10. Code Architecture Blueprint

```
kids-game-suite/
├── public/
│   ├── index.html
│   ├── manifest.json          # PWA manifest
│   ├── service-worker.js      # Offline caching
│   └── assets/
│       ├── images/            # Sprite sheets, backgrounds
│       ├── audio/             # SFX, optional music
│       └── icons/             # App icons
├── src/
│   ├── core/
│   │   ├── Game.js            # Base game loop, scene manager
│   │   ├── State.js           # localStorage wrapper
│   │   ├── AudioManager.js    # Web Audio + SpeechSynthesis
│   │   ├── InputManager.js    # Touch/mouse/pointer abstraction
│   │   └── Renderer.js        # Canvas or DOM renderer switch
│   ├── ui/
│   │   ├── Button.js          # Large, accessible button component
│   │   ├── Tile.js            # Game tile with tap feedback
│   │   ├── ProgressBar.js     # Gentle loading indicator
│   │   └── SpeechBubble.js    # Visual TTS indicator
│   ├── games/
│   │   ├── matching/          # Memory / matching game
│   │   ├── sorting/           # Color / shape / size sorting
│   │   ├── tracing/           # Letter / shape tracing (Canvas)
│   │   ├── echo/              # "Say the word" with TTS
│   │   └── puzzle/            # Simple jigsaw puzzle
│   ├── utils/
│   │   ├── colors.js          # Autism-friendly palette
│   │   ├── animations.js      # Reusable calm transitions
│   │   └── responsive.js      # Breakpoint + scale helpers
│   └── main.js                # Entry point, router, PWA init
└── package.json               # Optional: Vite for bundling
```

---

## References

[^1]: Kakadoo Games. "Toddler games 2-5 year olds." https://kakadoo.games/toddler-games/

[^2]: Tinybeans. "10 Creative Toddler Games That Are Fun & Educational." https://tinybeans.com/games-for-young-toddlers/

[^3]: The Bump. "19 Best Educational Toddler Apps." https://www.thebump.com/a/best-apps-for-two-year-olds

[^4]: Kaspersky. "Pitting wits with a tablet: 10 best mobile games for kids." https://www.kaspersky.com/blog/best-tablet-games-for-kids/9985/

[^5]: CodeCanyon. "Learn ABC – Kids Alphabet Learning Game (HTML5 & Android)." https://codecanyon.net/item/learn-abc-kids-alphabet-learning-game-html5-android/61587874

[^6]: ARSA Technology. "Streamlining EdTech: Simplifying Text-to-Speech API Integration for Mobile and Web." https://arsa.technology/blog/streamlining-edtech

[^7]: GitHub - seangibat. "HTML5-Speak-Easy: Web Speech API Speech Synthesis Wrapper." https://github.com/seangibat/HTML5-Speak-Easy

[^8]: GitHub - compulim. "web-speech-cognitive-services: Polyfill Web Speech API with Cognitive Services." https://github.com/compulim/web-speech-cognitive-services

[^9]: BlueStacks. "App For Kids - Free Kids Game." https://www.bluestacks.com/apps/education/app-for-kids-free-on-pc.html

[^10]: HappyClicks. "Touch / Tap Games for Toddlers." https://www.happyclicks.net/touch-tap-games/

[^11]: The Learning Agency. "Closing the Child Speech Recognition Gap." https://the-learning-agency.com/guides-resources/closing-the-child-speech-recognition-gap

[^12]: Milvus. "How does speech recognition differ in children compared to adults?" https://milvus.io/ai-quick-reference/how-does-speech-recognition-differ-in-children-compared-to-adults

[^13]: UG Labs. "Speech Recognition — Child-Native ASR." https://www.uglabs.io/speech-recognition

[^14]: PMC. "Application of Digital Games for Speech Therapy in Children." https://pmc.ncbi.nlm.nih.gov/articles/PMC9061057/

[^15]: LearningGame.org. "9 Best Learning Games You Can Play Offline Without Internet in 2026." https://www.learninggame.org/are-there-any-learning-games-that-can-be-played-offline-without-an-internet-connection/

[^16]: Find Them All. "Free app for kids | Find Them All: looking for animals." https://www.find-them-all.com/

[^17]: Dev.to. "Top 10 JavaScript Animation Libraries in 2025." https://dev.to/hadil/top-10-javascript-animation-libraries-in-2025-2ch5

[^18]: SitePoint. "The Best JavaScript & CSS Animation Libraries for UI Designers." https://www.sitepoint.com/our-top-9-animation-libraries/

[^19]: AbilityNet. "How I use tech & how to make a website autism-friendly." https://abilitynet.org.uk/news-blogs/world-autism-awareness-week-how-i-use-tech-how-make-website-autism-friendly

[^20]: Smart Interface Design Patterns. "How To Design For Autistic People." https://smart-interface-design-patterns.com/articles/design-autism/

[^21]: Ministry of Testing. "Autism-aware application design: Tips for software testers." https://www.ministryoftesting.com/insights/autism-aware-application-design-tips-for-software-testers

[^22]: Peeters, S. "A Web Development Project with and for Autistic People." https://scg.unibe.ch/archive/projects/Peet18a.pdf
