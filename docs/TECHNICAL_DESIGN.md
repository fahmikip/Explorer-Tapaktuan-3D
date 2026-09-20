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
Player            Entity: transform group, placeholder capsule, movement state
PlayerController  Reads InputState → camera-relative direction, accel/decel,
                  rotation, gravity, jump, ground collision, world clamping
PlayerConfig      Tunable movement/capsule parameters (values in gameConfig)
PlayerState       Read-only gameplay snapshot for debug/telemetry

(later phases)
PlayerInteraction  Raycast interaction with interactables  (Phase 4+)
PlayerAnimation    Animation state mapping (per approved assets)
```

### 2.3 World

```text
WorldManager       Orchestration layer: composes world systems under a single
                   worldRoot, exposes height/collision APIs, owns dispose
TerrainSystem      Deterministic seeded height field (falloff + value noise);
                   getHeightAt(x, z) is the single height authority
OceanSystem        Lightweight vertex-wave grid at configurable height
VegetationSystem   Instanced merged-geometry palms/bushes/grass (seeded)
RockSystem         Instanced low-poly rocks (seeded)
PathSystem         Generic terrain-following path ribbons + isOnPath()
AtmosphereSystem   Sky dome, fog, hemisphere + directional sun (shadow by quality)
WorldBounds        Rectangular play-area clamp (central config)
WorldDebugHelper   Dev-only grid/bounds markers (gated by debug.enabled)
DeterministicRandom Seeded PRNG + lattice hash noise utilities
```

`Ground` and `Environment` were removed in Phase 3; flat placeholder ground was
superseded by `TerrainSystem`, and the old environment helper by
`AtmosphereSystem`. All world systems are deterministic for a given
`worldConfig.seed`.

### 2.4 Gameplay

```text
QuestManager       Quest state machine (data-driven)
DiscoveryManager   Landmark discovery state
AchievementManager Achievement evaluation (generic rules)
DialogueManager    Dialogue flow and state
```

### 2.5 Camera

```text
CameraManager      Owns the PerspectiveCamera, aspect updates
ThirdPersonCamera  Smooth follow + pointer/touch orbit (distance, height,
                   lookAtHeight, smoothness — centralized config)
```

### 2.6 Environment

```text
WeatherManager     Modular weather states, no conditional spread
TimeManager        Day/night timeline (independent of gameplay)
AudioManager       Categories, volume control, graceful fallback
```

### 2.7 UI

```text
HUD, DialogUI, MapUI, DiscoveryUI, QuestUI, AchievementUI, PauseMenu
```

UI uses centralized design tokens (CSS custom properties) only.

---

## 3. Folder Structure

```text
src/
├── core/
├── config/            centralized configuration (gameConfig.ts)
├── camera/
│   ├── CameraManager.ts
│   └── ThirdPersonCamera.ts
├── world/
│   ├── WorldManager.ts
│   ├── TerrainSystem.ts
│   ├── OceanSystem.ts
│   ├── VegetationSystem.ts
│   ├── RockSystem.ts
│   ├── PathSystem.ts
│   ├── AtmosphereSystem.ts
│   ├── DeterministicRandom.ts
│   ├── WorldBounds.ts
│   └── WorldDebugHelper.ts
├── player/
│   ├── Player.ts
│   ├── PlayerController.ts
│   ├── PlayerConfig.ts
│   └── PlayerState.ts
├── input/
│   ├── InputManager.ts
│   ├── KeyboardInput.ts
│   └── InputState.ts
├── interaction/
├── ui/
├── npc/
├── dialogue/
├── quest/
├── discovery/
├── achievement/
├── weather/
├── audio/
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

## 11. World Generation & Quality (Phase 3)

### 11.1 Terrain

- Height field: `elevation = falloff(r) * maxHeight + octaveNoise(x, z)`,
  where `r` is the normalized radial distance from world center. A radial
  smoothstep falloff creates the island silhouette (sea level at world edges);
  three octaves of hash-based value noise add rolling contour.
- Seeded by `worldConfig.seed`; `getHeightAt(x, z)` and `getSlopeAt(x, z)` are
  the only height authorities. No system re-derives terrain internally.
- Elevation bands (technical zones, not geographic claims):
  - COAST — below ~1.5 m (sand)
  - LOWLAND — ~1.5–3.8 m (grass)
  - HILLS — ~3.8–6 m (slopes, mixed grass/hill)
  - HIGHGROUND — near terrain max (rock-capped peaks)

### 11.2 Ocean

- Large grid plane at `ocean.height`, with a cheap deterministic vertex wave
  (sum of two sines). Updated per frame; vertex normals recomputed. No shader,
  no transparency, no normal maps.
- Player collision clamps to `max(terrainHeight, oceanHeight)` so the player
  cannot sink below sea level or float in open water.

### 11.3 Vegetation / Rocks

- One `InstancedMesh` per type with a single merged geometry and single
  material (vertex colors baked). Placement is deterministic via a seeded
  PRNG, filtered by height band, slope limit, water margin and path clearance.
- Draw calls stay constant regardless of instance count.

### 11.4 Paths

- `PathDefinition` (id, points, width) in central config → Catmull-Rom curve →
  terrain-following ribbon with sequential indices. `isOnPath(x, z, margin)`
  keeps props off walkways.

### 11.5 Quality Levels

`low | medium | high` (config `world.quality`):

| Setting | low | medium | high |
| --- | --- | --- | --- |
| terrain segments | 48 | 72 | 96 |
| ocean segments | 32 | 40 | 48 |
| vegetation density × | 0.5 | 0.75 | 1 |
| rock density × | 0.5 | 0.75 | 1 |
| shadow map size | off | 512 | 1024 |
| pixel ratio cap | 1 | 1.5 | 2 |

### 11.6 Scene Hierarchy

```text
worldRoot
├── terrain
├── ocean
├── vegetation (instanced palms / bushes / grass)
├── rocks (instances)
├── path-* (per path definition)
└── debugGrid / debugBounds (dev only)
```

---

_This document is part of the project source of truth._