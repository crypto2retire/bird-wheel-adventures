# 🐦🚗 Bird & Wheel Adventures

> An autism-friendly educational web game suite built for a 3.5-year-old boy who loves counting, the alphabet, birds, and anything with wheels.

**Live Demo**: [https://bird-wheel-adventures-production.up.railway.app](https://bird-wheel-adventures-production.up.railway.app)

---

## About This Project

This is a parent-built, open-source educational game suite designed specifically for autistic toddlers. Every design decision was backed by research into autism-friendly UI/UX, communication therapy techniques, and special-interest-based learning.

### Key Design Principles

- **Zero Failure States**: No "game over," no penalties, no timers. Every interaction is positive.
- **Predictable Structure**: Every game follows the same flow: Welcome → Goal → Activity → Reward → Transition.
- **Minimal Visual Clutter**: Max 4-5 interactive elements per screen. Soft muted colors. No flashing animations.
- **Large Touch Targets**: Minimum 100×100px for all interactive elements — perfect for little fingers.
- **Special Interest Integration**: Birds and vehicles are the core content, not just decorations.
- **Text-to-Speech First**: Web Speech API provides slow, clear narration to encourage verbal echo.
- **Offline-First PWA**: Works without internet. Installable on any device. No app store required.
- **Parent Settings**: Hidden settings panel for customizing difficulty, sounds, wait times, and motion.

---

## The 8 Mini-Games

| Game | Skill | Description |
|------|-------|-------------|
| **🐦 Bird Counter** | Counting (1-100) | Count birds on screen. Adaptive difficulty. TTS counts together on wrong answers. |
| **🚗 Vehicle ABC** | Alphabet & Phonics | Explore A-Z with vehicles, or play "Find the Letter." |
| **🧠 Memory Match** | Visual Memory | Flip cards to match pairs of birds & vehicles. No timer, unlimited tries. |
| **🗣️ Say the Word!** | Verbal Communication | Echoic training — TTS says a word, child is encouraged to repeat. No speech recognition (unreliable at 3). Trusts the child's attempt. |
| **🗂️ Sort the Flock** | Categorization | Sort birds to nests, vehicles to garages. Color, size, and flying vs. ground categories. |
| **🔍 Find the Bird!** | Receptive Language | Follow spoken directions: "Find the red bird!" or "Find the vehicle with wheels!" |
| **🎡 Wheel Counter** | Counting (special interest) | Count how many wheels each vehicle has. Surprise vehicles included! |
| **🏖️ Free Play** | Exploration | Open scene with birds and vehicles. Tap to interact — fly, drive, chirp, beep. No goals, just play. |

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Build** | Vite | Fast dev server, easy production builds |
| **Language** | Vanilla ES2020+ Modules | Zero framework overhead. Direct DOM/Canvas access. Lightweight for toddlers. |
| **Styling** | CSS Custom Properties + Flexbox/Grid | Responsive, themeable, no dependencies |
| **Animations** | CSS Transitions + Keyframes | Gentle, GPU-accelerated, respects `prefers-reduced-motion` |
| **Audio (TTS)** | Web Speech API | Free, built-in, toddler-friendly voice settings (slow, warm pitch) |
| **Audio (SFX)** | Web Audio API | Low-latency, generated chimes/beeps/chirps (no external audio files) |
| **Storage** | localStorage | Progress & settings saved locally. No login required. |
| **PWA** | Service Worker + Manifest | Offline play, installable on home screen |
| **Deployment** | Railway (Docker) | Auto-deploy from GitHub, free tier available |

---

## Getting Started

### Local Development

```bash
git clone https://github.com/crypto2retire/bird-wheel-adventures.git
cd bird-wheel-adventures
npm install
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Railway

1. Fork this repo to your GitHub account
2. Create a Railway project: `railway init`
3. Deploy: `railway up`

---

## Research & Design

This project was built on a foundation of research. See the [`research/`](./research/) directory for:

- [`autism_game_design.md`](./research/autism_game_design.md) — Autism-friendly UI/UX best practices
- [`communication_games.md`](./research/communication_games.md) — Evidence-based communication therapy gamification
- [`web_game_tech.md`](./research/web_game_tech.md) — Toddler-optimized web tech stack analysis
- [`existing_apps_analysis.md`](./research/existing_apps_analysis.md) — Gap analysis of current autism apps

---

## Customization for Your Child

### Changing Content

All game content is defined in [`src/core/gameData.js`](./src/core/gameData.js). You can easily:

- Add new birds or vehicles (just add `{ name, emoji, ... }` objects)
- Change first words for the "Say the Word!" game
- Adjust wheel counts for vehicles

### Parent Settings

Tap and hold the header logo for 3 seconds to open the parent settings panel:

- Toggle speech, sound effects, and music
- Adjust wait time (3s / 5s / 10s) before auto-advancing in verbal games
- Set difficulty (Easy / Adaptive / Hard)
- Enable "Reduce Motion" for children sensitive to animation

---

## Project Structure

```
bird-wheel-adventures/
├── public/                  # PWA assets (manifest, service worker, icons)
├── src/
│   ├── core/                # Shared engine
│   │   ├── State.js         # localStorage progress & settings
│   │   ├── TTS.js           # Web Speech API wrapper
│   │   ├── AudioManager.js  # Web Audio API sound effects
│   │   └── gameData.js      # Birds, vehicles, words content
│   ├── games/               # 8 mini-game modules
│   │   ├── BirdCounter.js
│   │   ├── VehicleABC.js
│   │   ├── MemoryMatch.js
│   │   ├── SayTheWord.js
│   │   ├── SortTheFlock.js
│   │   ├── FindTheBird.js
│   │   ├── WheelCounter.js
│   │   └── FreePlay.js
│   ├── main.css             # Autism-friendly design system
│   └── main.js              # Home screen, navigation, game router
├── design/
│   └── design.md            # Full game design specification
├── research/                # Research findings
├── index.html               # App shell
├── server.js                # Express production server
├── Dockerfile               # Railway deployment
├── railway.json             # Railway config
└── vite.config.js           # Vite build config
```

---

## Why This Exists

Most autism apps are:
- Expensive ($60–$100/year subscriptions)
- Not customizable to a child's specific interests
- Native-only (locked to one app store / device)
- Not open-source (if the company shuts down, the app dies)
- Treat counting as a drill instead of a passion

This project is:
- **Free forever** — no subscriptions, no ads, no data collection
- **Parent-configurable** — swap in your child's actual interests
- **Cross-device** — any phone, tablet, or laptop with a browser
- **Open-source** — MIT licensed, community-improvable
- **Built around special interests** — birds and vehicles are the core mechanics, not skins

---

## License

MIT License — free to use, modify, and share.

Built with ❤️ by a parent, for their son.
