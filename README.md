# GreatCalc

GreatCalc is a premium-grade desktop calculator for Windows built with `Tauri + React + TypeScript + Vite + Tailwind`.

It combines high-end visual polish with reliable daily usability:
- standard calculations
- scientific tools
- programmer workspace
- unit and currency conversion
- graphing in real time
- persistent history, favorites, memory, and preferences

## Stack

- Frontend: React 19, TypeScript, Vite, TailwindCSS, Zustand
- Motion/UI polish: Framer Motion, Lucide icons
- Graphs: Recharts
- Math engine: Math.js (safe parser flow, no `eval`)
- Desktop shell: Tauri 2
- Testing: Vitest + React Testing Library

## Installation

1. Install Node.js 20+ (24+ recommended).
2. Install Rust toolchain (required for Tauri desktop build):
   - https://www.rust-lang.org/tools/install
3. Install Microsoft Visual Studio C++ Build Tools + WebView2 runtime (for Tauri on Windows).
4. Install dependencies:

```bash
npm install
```

## Run (Web Dev)

```bash
npm run dev
```

## Run (Desktop Tauri Dev)

```bash
npm run tauri:dev
```

## Build

Web production build:

```bash
npm run build:web
```

Desktop bundle build:

```bash
npm run build:desktop
```

Collect web artifacts into `Releases/web`:

```bash
npm run build:web:release
```

Collect web + desktop artifacts into `Releases/`:

```bash
npm run build:all
```

## Tests

Run test suite:

```bash
npm run test
```

Coverage:

```bash
npm run test:coverage
```

Type check:

```bash
npm run typecheck
```

Lint:

```bash
npm run lint
```

## Features

### Core calculator modes

- Standard mode
- Scientific mode
- Programmer mode (bitwise ops + base switching: BIN/OCT/DEC/HEX)
- Unit converter
- Currency converter via provider abstraction
- Graph mode with real-time function plotting

### Functional depth

- Parentheses and robust expression handling
- Percent support
- Powers, roots, logs, trig
- Constants `pi` and `e`
- Degree/Radian switch
- Memory actions (`MC`, `MR`, `M+`, `M-`, `MS`)
- Keyboard support (input + mode shortcuts)
- Language preference in Settings (50 most-used world languages)
- Copy result
- Friendly error handling
- Persistence across sessions

### Data and persistence

- History of calculations
- Favorites (saved formulas)
- Persistent theme/mode/state via storage
- Currency rates with provider fallback and cache

## Architecture (Layered)

`src/` is split by responsibilities:

- `components/` presentation layer (UI cards, keypad, panels)
- `state/` app state and actions (Zustand)
- `engine/` math parser/evaluator and graph sampling
- `format/` number/programmer formatting
- `converters/` unit conversion catalog and logic
- `providers/` data providers (currency abstraction)
- `persistence/` storage keys and state persistence boundaries
- `desktop/` desktop-bound helper bindings (clipboard, env detection)
- `hooks/` keyboard + theme synchronization

Key design principles:
- no `eval`
- strong typing
- separated domains for extensibility
- state and engine decoupled from presentation

## Implemented WOW details

- Layered glass cards with restrained ambient gradients
- Purposeful microinteractions on controls
- Animated transitions between mode modules
- Real-time graph rendering with smooth chart animation
- Premium composition, spacing, depth, and typography
- Clean empty states and discoverable side panels
- Compact mode toggle for focused daily use

## Future improvements

1. Add symbolic math helpers (factorization, equation solving)
2. Add plugin system for custom converter domains
3. Implement local encrypted sync profile export/import
4. Add optional high-precision decimal mode with arbitrary precision controls
5. Optimize bundle size with mode-level code splitting
6. Add snapshot visual regression tests for UI polish consistency

## Project status

Verified locally:
- `npm run typecheck` ✅
- `npm run lint` ✅
- `npm run test` ✅ (19 tests)
- `npm run build` ✅

Release folders:
- `Releases/web` <- Vite production output
- `Releases/desktop` <- Tauri bundle output (copied from `src-tauri/target/release/bundle`)

Note: this environment did not include Rust tooling initially, so only web-side validation was executed here. Tauri desktop commands are configured and ready once Rust is installed.
