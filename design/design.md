# Game Suite Design: Bird & Wheel Adventures

## Target Child Profile
- **Age**: 3.5 years old
- **Autism**: Yes, working on consistent verbal communication
- **Strengths**: Counting to 100, alphabet knowledge, excellent matching/memory
- **Special Interests**: Birds, vehicles with wheels
- **Goals**: Encourage verbal communication through play

## Design Principles (from Research)
1. **Zero Failure States**: No wrong answers, no penalties, no game over. Every interaction is positive.
2. **Predictable Structure**: Every game follows the same flow: Welcome → Goal → Activity → Reward → Transition.
3. **Minimal Visual Clutter**: Max 4-5 interactive elements per screen. Soft muted colors.
4. **Large Touch Targets**: Minimum 100×100px for all interactive elements.
5. **Special Interest Integration**: Birds and vehicles are the core content, not just decorations.
6. **TTS-First Audio**: Web Speech API with slow, clear speech. No speech recognition for v1 (unreliable for 3-year-olds).
7. **Parent Settings**: Hidden settings panel for customizing difficulty, sounds, and content.
8. **Offline-First PWA**: Works without internet, installable on any device.

## Color Palette
```css
--bg-primary: #F5F0E8;      /* Warm cream */
--bg-secondary: #E8E0D5;    /* Soft beige */
--accent: #7BA598;          /* Muted sage green */
--accent-hover: #6A9488;    /* Darker sage */
--text-primary: #3D3D3D;    /* Soft charcoal */
--text-secondary: #6B6B6B;  /* Medium gray */
--success: #A8C686;         /* Soft green */
--feedback: #D4A574;        /* Warm amber */
--highlight: #E8D5B7;       /* Warm highlight */
--bird-accent: #9BB8D3;     /* Soft blue (bird sky) */
--vehicle-accent: #C4A882;   /* Warm brown (road) */
```

## Game Suite: 8 Mini-Games

### 1. Bird Counter 🐦
**Skill**: Counting (1-100, adaptive)
**Flow**: Bird(s) appear on screen → TTS asks "How many birds?" → Child taps numbers → TTS counts with them.
**Mechanics**: 
- Level 1: Count 1-5 birds
- Level 2: Count 6-10 birds
- Level 3: Count 11-20 birds
- Level 4+: Count up to 100 in groups
- Each bird tapped chirps and flaps gently
- No penalty for wrong number - bird just doesn't react, encouraging retry
- "Let's count together!" TTS prompt

### 2. Vehicle ABC 🚗
**Skill**: Alphabet recognition and phonics
**Flow**: Vehicle appears → TTS says "A is for Airplane" → Child taps letters to spell vehicle name.
**Mechanics**:
- Each letter is a large vehicle-themed tile
- Tap letter → vehicle sound + letter name spoken
- Complete the alphabet in order OR free explore mode
- Vehicles: A=Airplane, B=Bus, C=Car, D=Dump Truck, E=Excavator, F=Fire Truck, G=Garbage Truck, H=Helicopter, I=Ice Cream Truck, J=Jeep, K=Kart, L=Limousine, M=Motorcycle, N=News Van, O=Oil Tanker, P=Police Car, Q=Quad Bike, R=Race Car, S=School Bus, T=Taxi, U=Utility Truck, V=Van, W=Wagon, X=X-Ray Van, Y=Yacht, Z=Zamboni
- "Can you find the letter...?" TTS prompts

### 3. Memory Match 🧠
**Skill**: Visual memory, matching (already a strength to leverage)
**Flow**: Grid of cards face down → Tap to flip → Match pairs of birds/vehicles.
**Mechanics**:
- 2×2 grid (4 cards) for Level 1
- 2×3 grid (6 cards) for Level 2
- 3×4 grid (12 cards) for Level 3
- 4×4 grid (16 cards) for Level 4
- Matched pair plays a sound (bird chirp or vehicle sound)
- TTS names the item when flipped: "You found a cardinal!"
- No timer, unlimited attempts
- All cards stay flipped until matched or re-tapped

### 4. Say the Word! 🗣️
**Skill**: Verbal communication / echoic training
**Flow**: Picture appears → TTS says the word → Child encouraged to repeat → TTS praises any attempt.
**Mechanics**:
- Shows bird or vehicle image
- TTS: "This is a ROADSTER. Can you say ROADSTER?"
- Big animated mouth/visual cue to speak
- No speech recognition (too unreliable at 3.5) - tap anywhere to continue
- TTS gives enthusiastic praise: "Great trying! You said ROADSTER!"
- Parent can set wait time (3s, 5s, 10s) before auto-continuing
- Includes simple first words: bird, car, wheel, go, more, up, down, fast, slow, red, blue, big, small

### 5. Sort the Flock 🗂️
**Skill**: Categorization, receptive language
**Flow**: Items appear → TTS asks "Put the birds in the nest!" → Child taps birds → Items fly/crawl to correct zone.
**Mechanics**:
- Birds vs Vehicles (Level 1)
- Red vs Blue items (Level 2)
- Big vs Small (Level 3)
- Flying vs Ground vehicles (Level 4)
- Feathers vs Wheels (Level 5)
- TTS gives category prompts
- Correct items animate into their zone with celebration
- Wrong items just stay in place (no negative feedback)
- "The robin goes in the nest!" "The truck goes in the garage!"

### 6. Find the Bird! 🔍
**Skill**: Receptive language, following directions
**Flow**: Scene with multiple items → TTS gives instruction → Child taps correct item.
**Mechanics**:
- "Find the RED bird!" (color + object)
- "Find the BIRD with WHEELS!" (helicopter - trick question, fun!)
- "Find the BIG truck!" (size + object)
- "Find the bird that says CHIRP!" (sound association)
- Correct tap: item animates, TTS praises
- Incorrect tap: item gently shakes, TTS redirects "That's a truck! Try again!"
- Scene always has 2-3 items max to avoid overwhelm

### 7. Wheel Counter 🎡
**Skill**: Counting with special interest twist
**Flow**: Vehicle appears → TTS asks "How many wheels?" → Child taps number.
**Mechanics**:
- Motorcycle = 2 wheels, Car = 4 wheels, Truck = 6 wheels, etc.
- Shows vehicle with visible wheels highlighted
- TTS: "The fire truck has 1, 2, 3, 4, 5, 6 wheels!"
- Reinforces counting in a special-interest context
- Mix of vehicles with different wheel counts
- Unlock "surprise vehicles" (unicycle, 18-wheeler)

### 8. Free Play Sandbox 🏖️
**Skill**: Exploration, creativity, self-directed play
**Flow**: Open scene with birds and vehicles → Child taps to interact → TTS narrates actions.
**Mechanics**:
- Sky scene with birds that fly when tapped
- Road scene with vehicles that drive when tapped
- Tap bird → it chirps, TTS says name, flies a loop
- Tap vehicle → engine sound, TTS says name, drives across screen
- "The blue jay is flying!" "The fire truck is going fast!"
- No goals, just exploration and language exposure
- Parent can toggle which items appear

## Common Game Flow (Every Mini-Game)
```
[Home Screen] → [Game Selection] → [Game Welcome] → [Activity Loop] → [Reward] → [Next Round or Home]
```

## Navigation Structure
- **Home**: Grid of 8 game icons (large, 2×4 or 4×2 grid)
- **Game Screen**: Full-screen game with back button
- **Settings**: Hidden behind tap-and-hold on logo (3 seconds) or parent gesture
- **No menus, no dropdowns, no hamburger icons**

## Audio Design
- **TTS**: Web Speech API, rate 0.85, pitch 1.1, warm voice
- **SFX**: Soft chirps, gentle vehicle sounds, chime for correct
- **No background music by default** (can be enabled in settings)
- **All audio toggleable** individually: Master, TTS, SFX, Music

## Touch & Interaction Design
- Minimum 100×100px tap targets
- Single tap only (no swipe, no drag unless specifically needed)
- No double-tap zoom (CSS touch-action: manipulation)
- No text selection (user-select: none)
- 300-600ms gentle animations
- No flashing, no strobing, no rapid motion

## Responsive Design
- **Mobile phone**: Single column, stacked layout
- **Tablet (primary)**: 2-column grid, landscape preferred
- **Desktop**: Centered game area, max-width 800px
- CSS variables for tile sizes that scale with breakpoint

## Data Model (localStorage)
```json
{
  "settings": {
    "ttsEnabled": true,
    "sfxEnabled": true,
    "musicEnabled": false,
    "difficulty": "adaptive",
    "waitTime": 5,
    "reduceMotion": false
  },
  "progress": {
    "birdCounter": { "level": 1, "stars": 12 },
    "vehicleABC": { "level": 1, "letters": ["A", "B"] },
    "memoryMatch": { "level": 2, "gamesPlayed": 8 },
    "sayTheWord": { "wordsAttempted": ["bird", "car"] },
    "sortTheFlock": { "level": 1 },
    "findTheBird": { "level": 1 },
    "wheelCounter": { "level": 1 },
    "freePlay": { "minutesPlayed": 15 }
  }
}
```

## Tech Stack
- **Build**: Vite (fast dev, easy production build)
- **Language**: Vanilla ES2020+ modules (no framework needed for this scope)
- **Styling**: CSS Custom Properties + Flexbox/Grid
- **Animations**: CSS transitions + keyframes (no heavy animation library)
- **Audio**: Web Speech API (TTS) + Web Audio API (SFX)
- **Storage**: localStorage
- **PWA**: Service worker + manifest.json
- **Deployment**: Railway (static serve from Express or Vite preview)
- **Repo**: GitHub
