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
EventBus         Typed publish/subscribe (see Core/GameEventMap topics)
InputManager     Unified keyboard/mouse/touch input state
SaveManager      Versioned persistence (localStorage)
```

`GameEventMap` (src/core/types.ts) is the typed event catalog — new topics are
added there as systems are introduced (current: gameplay, resize, and the
`interaction:*` / `landmark:*` topics).

### 2.2 Player

```text
Player            Entity: transform group, placeholder capsule, movement state
PlayerController  Reads InputState → camera-relative direction, accel/decel,
                  rotation, gravity, jump, ground collision, world clamping
PlayerConfig      Tunable movement/capsule parameters (values in gameConfig)
PlayerState       Read-only gameplay snapshot for debug/telemetry

(later phases)
PlayerAnimation    Animation state mapping (per approved assets)
```

### 2.2.1 Interaction (Phase 4)

```text
Interactable        Generic contract (id, point, radius, canInteract,
                    label?, onInteract) — landmarks now; NPCs/quest/signs later
InteractionManager  Nearest-within-radius target detection (squared distances),
                    press-edge interact, onTargetChange (emits
                    "interaction:target-changed")
```

Interaction is deliberately generic: it carries no landmark/domain data, so
future interactables reuse it unchanged. Panels/hints react to bus events;
Game gates interactions while a UI overlay is open.

### 2.2.2 Landmarks & Discovery (Phase 4)

```text
Landmark             Runtime entity: group, ground ring, state icon, optional
                     label; implements Interactable; marker state machine
LandmarkFactory      Procedural placeholder visuals per type (shared materials,
                     per-landmark geometries) — no asset pipeline needed
LandmarkManager      Spawns registry-selected landmarks into the world, syncs
                     marker state with interaction/discovery per frame
LandmarkRegistry     Validated catalog: lookup, getApproved/getTestData,
                     selectVisible(allowTestData)
LandmarkDataLoader   Non-throwing JSON load + validation (duplicates/invalid
                     items rejected with reported issues)
DiscoveryManager     First-discovery tracking, persists through DiscoveryStorage,
                     emits "landmark:discovered" once per landmark
DiscoveryStorage     MemoryStorage / LocalStorageStorage behind one interface
```

Test data renders only when `debug.enabled && debug.showDebugLandmarks &&
import.meta.env.DEV` — never in a production build.

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
DiscoveryManager   Landmark discovery state  (Phase 4)
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
LandmarkInfoPanel  Read-only landmark/POI info (right-side panel / mobile
                   bottom sheet; hides empty fields; "DEBUG / TEST DATA" badge)
InteractionHint    Bottom pill "[E] <label>" when an interactable is in range
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
│   ├── Interactable.ts
│   └── InteractionManager.ts
├── landmarks/
│   ├── types.ts
│   ├── Landmark.ts
│   ├── LandmarkFactory.ts
│   ├── LandmarkManager.ts
│   └── LandmarkRegistry.ts
├── data/
│   └── LandmarkDataLoader.ts
├── discovery/
│   ├── DiscoveryManager.ts
│   └── DiscoveryStorage.ts
├── ui/
│   ├── DebugUI.ts
│   ├── InteractionHint.ts
│   └── LandmarkInfoPanel.ts
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

## 12. Interaction & Landmark System (Phase 4)

### 12.1 Data pipeline

```text
/data/landmarks.json ──LandmarkDataLoader.load()──► validated definitions
        │  (version + status + items; non-throwing validation;
        │   duplicate/invalid items rejected with issues)
        ▼
LandmarkRegistry ── selectVisible(allowTestData) ──► spawn set
        │
        ▼
LandmarkManager → LandmarkFactory.create() → Landmark (Interactable)
```

- Landmark data is imported as a TS module (`import ... from "../../data/landmarks.json"`)
  — Vite JSON import + `resolveJsonModule`. No fetch, no duplication, single
  source of truth in `/data`.
- Only `status === "approved"` items are production content. Test data
  (`isTestData: true`) spawns only under
  `debug.enabled && debug.showDebugLandmarks && import.meta.env.DEV`.

### 12.2 Runtime flow

```text
Per frame (LandmarkManager.update):
  InteractionManager.update(interactHeld, allowed, playerX, playerZ)
    → nearest target within its radius (squared distances, no sqrt)
    → onTargetChange emitted only on target switch
    → press-edge interact → landmark.onInteract()
  LandmarkManager emits "landmark:interacted"
  DiscoveryManager.discover(id) → emits "landmark:discovered" (first time)
  Game opens LandmarkInfoPanel; while open the player input is locked
```

- The panel lock zeroes movement/jump/sprint for `PlayerController` and
  gating `interactAllowed=true` on the bus — a held E cannot re-fire after the
  panel closes (press remains consumed until released).
- Discovered state syncs to marker icons (`?` undiscovered / `!` nearby /
  `✓` discovered) and is persisted via `DiscoveryStorage` when
  `discovery.persist` is true (localStorage key `explore-tapaktuan:discovery:landmarks`).

### 12.3 Landmark visuals

Placeholders are procedural (no assets): a ground ring, a state glyph sprite,
and an optional name label. Type silhouettes differ (podium/pillar, obelisk,
info board, POI post+sphere, discovery bauble). Shared factory materials are
disposed once; each Landmark disposes its owned geometries/label texture.

---

_This document is part of the project source of truth._
### 2.2.3 NPC & Dialogue (Phase 5)

```text
NPCDataLoader / DialogueDataLoader  JSON import, validation, graph checks
NPCRegistry / DialogueRegistry      approved content + gated test content
NPCFactory / NPC                    procedural placeholder visuals;
                                    generic Interactable implementation
NPCManager                          spawn, terrain placement, visibility,
                                    talking state and interaction events
DialogueEngine                      linear/choice state machine and events
DialogueUI                          buttons, keyboard controls, optional
                                    timed reveal, skip and close behavior
```

NPC interaction resolves its configured `dialogueId` in the validated
 dialogue registry. Dialogue speaker IDs are checked against registered NPCs;
speaker display names come from the NPC registry. Draft/test NPCs and dialogue
definitions are available only in development with the corresponding debug
flags. Production content requires approved/locked status.
