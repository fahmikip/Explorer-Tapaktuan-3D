# Explore Tapaktuan 3D — TECHNICAL_DESIGN.md

> Technical architecture reference. Implementations must respect this document.

---

## 1. Architecture Overview

Modular architecture. Systems are independent where practical and communicate
through an `EventBus` and typed data models — never through ad-hoc globals.

```text
Entry                    src/main.ts
  ↓
Core bootstrap           Game, SceneManager, Renderer, AssetManager,
                         EventBus, InputManager, SaveManager
  ↓
Domain modules           Player, World, Gameplay, Environment, UI
  ↓
Data layer               /data/*.json (typed) + /src typed models
```

---

## 2. Modules

### 2.1 Core

```text
Game             Application lifecycle and composition root
SceneManager     Scene graph construction and registration
Renderer         WebGL renderer setup, resize, frame
AssetManager     GLB/texture/audio loading, caching, fallback
EventBus         Typed publish/subscribe
InputManager     Unified keyboard/mouse/touch input state
SaveManager      Versioned persistence (localStorage)
```

### 2.2 Player

```text
PlayerController   Composition root for the player
PlayerMovement     WASD / joystick locomotion, sprint, jump
PlayerInput        Maps raw input to movement intent
PlayerInteraction  Raycast interaction with interactables
PlayerAnimation    Animation state mapping (per approved assets)
```

### 2.3 World

```text
WorldManager       Zone loading and lifecycle
Terrain            Ground mesh/height data
Environment        Decorative layer (filler vegetation, props)
Buildings          Structure placement (data-driven)
Vegetation         Clusters with instancing where valuable
Ocean              Water surface (per approved art direction)
```

### 2.4 Gameplay

```text
QuestManager       Quest state machine (data-driven)
DiscoveryManager   Landmark discovery state
AchievementManager Achievement evaluation (generic rules)
DialogueManager    Dialogue flow and state
```

### 2.5 Environment

```text
WeatherManager     Modular weather states, no conditional spread
TimeManager        Day/night timeline (independent of gameplay)
AudioManager       Categories, volume control, graceful fallback
```

### 2.6 UI

```text
HUD, DialogUI, MapUI, DiscoveryUI, QuestUI, AchievementUI, PauseMenu
```

UI uses centralized design tokens (CSS custom properties) only.

---

## 3. Folder Structure

```text
src/
├── core/
├── player/
├── camera/
├── world/
├── interaction/
├── npc/
├── dialogue/
├── quest/
├── discovery/
├── achievement/
├── weather/
├── audio/
├── ui/
└── main.ts

data/
├── locations.json
├── landmarks.json
├── npcs.json
├── quests.json
├── dialogues.json
├── achievements.json
└── assets.json

public/
└── assets/
    ├── models/
    ├── textures/
    ├── images/
    ├── audio/
    └── fonts/
```

---

## 4. Data Flow

```text
/data/*.json
    ↓ (typed load + validation)
Managers (Scenario, Landmark, NPC, Quest, Dialogue, Achievement, Asset)
    ↓
Gameplay systems
    ↓
UI / Render
```

- Content lives in JSON, never hard-coded in logic.
- Each data file declares a `version` and a `status`.

---

## 5. Asset Loading Strategy

- GLB loaded through `AssetManager` with caching.
- Missing/failed assets: log a meaningful error, substitute a safe fallback,
  never crash the application.
- Registration requirement: every production asset must exist in `/data/assets.json`.
- Lazy loading preferred: load what the player is near; no blind preload of everything.

---

## 6. State Management

- No global mutable state scattered across modules.
- Managers own their state and expose read APIs.
- Save format is versioned (`saveVersion`), enabling future migrations.
- Persisted data: progress, discoveries, quests, achievements, settings.

---

## 7. Performance Strategy

Considered at every phase:

- Polygon budget and LOD
- Draw call reduction (instancing, merged geometry where appropriate)
- Texture size and compression
- Frustum culling, occlusion awareness
- Lazy loading of distant content
- Object pooling where appropriate (e.g., particles, effects)
- Memory tracking and cleanup on scene/zone changes

Do not optimize blindly — inspect or measure before major changes.

---

## 8. Deployment Strategy

- Target: GitHub Pages.
- Vite `base: "./"` so assets resolve under sub-path deployments.
- Static build (`npm run build`), preview-verified before release.
- PWA support planned for Phase 11 (offline/caching), not before.

---

## 9. Dependency Policy

- No library is added "because it is convenient."
- Evaluate: need, existing capability, bundle size, maintenance, compatibility, license.
- Three.js is the rendering engine; it is not replaced without explicit authorization.
- All significant dependencies are documented here and in the CHANGELOG.

---

## 10. Environment & Config

- TypeScript strict mode, `noEmit`, moduleResolution `bundler`.
- Build = `tsc --noEmit && vite build`.
- Lint/test scripts added in the phase where testable logic first appears.

---

_This document is part of the project source of truth._