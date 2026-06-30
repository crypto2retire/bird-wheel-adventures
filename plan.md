# Plan: Educational Game Suite for 3.5-Year-Old Autistic Son

## User Context
- **Child**: 3.5 years old, autistic, loves counting (to 100), alphabet, matching/memory games, birds, and wheeled vehicles
- **Goal**: Improve verbal communication consistency
- **Deployment**: GitHub + Railway for cross-device access
- **Target**: Browser-based web app (tablet, phone, desktop friendly)

## Architecture
- **Frontend**: React + TypeScript + Vite (modern, fast, cross-device responsive)
- **Backend**: Express API for progress tracking (optional, can be localStorage-first)
- **Deployment**: GitHub Actions → Railway (containerized)
- **Design**: Autism-friendly UI (high contrast, clear visual hierarchy, reduced clutter, predictable patterns, no flashing animations, calm color palette)
- **Audio**: Web Speech API for text-to-speech (encouraging verbal echo), optional speech recognition for verbal responses
- **Assets**: SVG illustrations (birds, vehicles) for crisp rendering at any size

## Stage 1: Research (Parallel Sub-agents)
- **Researcher_A**: Autism-friendly game design principles for toddlers (sensory considerations, UI/UX best practices, cognitive load, reward structures)
- **Researcher_B**: Communication-focused games for autistic children (verbal prompting, echoic training, AAC integration, speech therapy gamification)
- **Researcher_C**: Educational web game tech stacks for toddler-friendly deployment (React game frameworks, Web Audio, Web Speech API, touch optimization)
- **Researcher_D**: Existing autism educational apps/games analysis (what works, what doesn't, feature gaps, success stories)

## Stage 2: Design & Architecture
- Game suite selection (6-8 mini-games targeting different skills)
- Component architecture (shared game engine, audio manager, progress tracker, asset library)
- UI/UX design system (autism-friendly palette, typography, interaction patterns)
- Data model for progress tracking and adaptive difficulty

## Stage 3: Implementation (Swarm Coding)
- Core game engine and shared components
- Mini-game 1: Counting with Birds & Wheels
- Mini-game 2: Alphabet Matching
- Mini-game 3: Memory Match (Birds & Vehicles)
- Mini-game 4: Verbal Echo ("Say the word!" with audio prompts)
- Mini-game 5: Sound Sorting (categorization)
- Mini-game 6: Vehicle Count & Identify
- Mini-game 7: Bird Alphabet Adventure
- Mini-game 8: Free Play / Exploration mode
- Audio manager (text-to-speech, sound effects, background music)
- Progress tracker with adaptive difficulty
- Responsive design for tablets/phones

## Stage 4: Deployment
- GitHub repo creation
- Railway app configuration
- GitHub Actions CI/CD pipeline
- Environment configuration

## Output Files
- `research/` — all research artifacts
- `design/` — architecture docs, game specs, UI specs
- `src/` — implementation source code
- `docs/` — deployment docs, README
