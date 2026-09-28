# Changelog

## Phase 6

Quest system implemented with no invented production tourism content.

- **Added**: quest types, non-throwing JSON loader/validator and registry with
  approved/locked production filtering and a dev-only test-data gate.
- **Added**: event-driven objectives for landmark discovery, NPC interaction
  and dialogue completion; completion awards configured quest points once.
- **Added**: safe memory/localStorage progress storage and objective progress
  restoration, plus a responsive quest tracker showing completion and rewards.
- **Integrated**: quest tracking subscribes to existing typed gameplay events;
  debug telemetry reports quest completion and points.
- **Test content**: one draft test quest requires a test landmark discovery and
  talking to the test guide, then grants 10 points.
- **Validated**: `npm run build` PASS; browser runtime validation unavailable.
- **Known**: production JavaScript chunk remains over Vite's 500 kB warning
  threshold.

## Phase 5

NPC & Dialogue systems implemented. Current content is draft test data only;
the phase adds no real people or verified Tapaktuan facts.

- **Added**: NPC and dialogue data models, non-throwing loaders, duplicate and
  field validation, dialogue graph/orphan checks, and speaker-ID validation.
- **Added**: NPC/dialogue registries that expose approved/locked production
  data and development test data only behind debug flags and Vite's dev guard.
- **Added**: generic interactable NPC placeholders, terrain placement,
  distance visibility and talking/idle state feedback.
- **Added**: linear and branching dialogue state machine, typed events, and a
  dialogue panel with keyboard/button controls, optional text reveal/skip, and
  Escape close.
- **Integrated**: pressing `E` near an NPC starts its configured dialogue;
  dialogue overlays lock player movement and interaction. Speaker names resolve
  through the NPC registry.
- **Test content**: two draft test NPCs demonstrate linear and choice-based
  conversations; both are excluded from production.
- **Validated**: `npm run build` PASS; browser runtime validation unavailable.
- **Known**: Vite reports the production JavaScript chunk exceeds 500 kB
  minified; splitting is deferred until needed.

## Phase 4

Landmark & Point of Interest System — data-driven landmark pipeline with
interaction, discovery and an information panel.

> This phase establishes the **system**, not the content. The only landmarks
> shipped are development test probes (`isTestData: true`, `status: "draft"`)
> used to validate the pipeline. No real Tapaktuan facts were used or invented.

- **Added**: `src/landmarks/types.ts` — data contract: `LandmarkDefinition`
  (id, name, type, position{x,z,y?}, shortDescription?, description?, image?,
  source?, assetId?, interactionRadius?, groundOffset?, scale?, tags?,
  isTestData?, status) across types `landmark | poi | viewpoint | information |
  discovery` and the `draft…deprecated` data status ladder.
- **Added**: `src/data/LandmarkDataLoader.ts` — non-throwing load + validation
  of `/data/landmarks.json` (imported directly as a TS module via Vite JSON
  import + `resolveJsonModule`, keeping a single source of truth). Duplicate
  IDs, invalid `type`/`status`, missing names and non-finite positions are
  reported as issues and skipped without crashing.
- **Added**: `src/landmarks/LandmarkRegistry.ts` — validated catalog with
  `getById/getAll/getApproved/getTestData/selectVisible(allowTestData)`.
  Only `status==="approved"` items are production; test data is gated behind
  `debug.enabled && debug.showDebugLandmarks && import.meta.env.DEV`, so it can
  never appear in a production build.
- **Added**: generic interaction layer — `src/interaction/Interactable.ts`
  (id, point, radius, canInteract, label?, onInteract — no domain content) and
  `src/interaction/InteractionManager.ts` (nearest-within-radius detection via
  squared distances, press-edge interact, `onTargetChange`). Consumed by
  landmarks now; reusable by NPCs/quest objects later.
- **Added**: discovery layer — `src/discovery/DiscoveryManager.ts`
  (first-discovery Set, emits `landmark:discovered` once per landmark) and
  `src/discovery/DiscoveryStorage.ts` (`MemoryDiscoveryStorage` /
  `LocalStorageDiscoveryStorage` behind one interface, key
  `explore-tapaktuan:discovery:landmarks`, storage failures degrade safely).
- **Added**: `src/landmarks/Landmark.ts` (interactable runtime entity: ground
  ring + glyph state icon `?`→`!`→`✓` + optional name label; state is never
  color-only), `LandmarkFactory.ts` (procedural placeholder visuals per type
  with shared factory materials vs per-landmark geometries) and
  `LandmarkManager.ts` (spawns registry-selected landmarks into the world,
  syncs marker state with interaction/discovery each frame, disposes fully).
- **Added**: `src/ui/LandmarkInfoPanel.ts` (right-side panel / mobile bottom
  sheet via media query, Escape + 44 px close button, hides empty fields,
  "DEBUG / TEST DATA" badge) and `src/ui/InteractionHint.ts` (bottom pill
  `[E] <label>` shown when an interactable is in range).
- **Added**: landmark visual styles + panel/hint styles to `src/styles/main.css`
  using existing design tokens.
- **Added**: `InputState.interact` + `KeyE` mapping in `KeyboardInput`; Game
  gates movement/jump/sprint and interact while the info panel is open (with
  correct press-consumption so a held E cannot re-fire after close).
- **Extended**: `GameEventMap` topics — `"interaction:target-changed"`,
  `"landmark:interacted"`, `"landmark:discovered"`.
- **Extended**: `gameConfig` — `world.landmarks` (default interaction radius,
  ground offset, icon offset/scale, label scale, marker colors, palette),
  `debug.showDebugLandmarks`, `discovery.persist`.
- **Extended**: `DebugUI` telemetry with `landmarks` / `discovered` counts.
- **Data**: `/data/landmarks.json` now contains the three dev test probes
  (`TEST_LANDMARK_01` at (0,14), `TEST_VIEWPOINT_01` at (28,28),
  `TEST_DISCOVERY_01` at (-25,20)), all `isTestData: true` / `status: "draft"`.
- **Validated**: `npm run typecheck` PASS; `npm run build` PASS. Browser
  runtime validation not available (no automation tooling).
- **Architectural decisions**: content stays in `/data/*.json`, logic stays
  generic (`Interactable` carries no landmark knowledge); interaction is a
  shared subsystem rather than a player raycast; discovery persistence is
  swappable behind `DiscoveryStorage`; all placeholder visuals are procedural
  (no asset registration required, `assets.json` remains empty); the chunk
  >500 kB warning remains unchanged (Three.js core, code splitting deferred).

## Phase 3

World Prototype — generic procedural coastal environment foundation.

> This is a **technical/placeholder environment**, not a reconstruction of
> Tapaktuan. No real-world geographic facts, roads, buildings, or landmarks
> were used or invented.

- **Added**: `TerrainSystem` — deterministic seeded height field. Elevation is
  a smooth radial falloff (island silhouette) plus 3 octaves of hash-based
  value noise; vertex-color ramp blends sand → grass → hill → rock by
  elevation band (coast transition). `getHeightAt(x, z)` is the single height
  authority used by the player, paths, vegetation and rocks. Seed centralized
  in `gameConfig.world.seed` (12345).
- **Added**: `OceanSystem` — lightweight grid plane at a configurable height
  with a shader-free, deterministic vertex wave (amplitude/frequency/speed from
  config). No transparency or normal maps.
- **Added**: `VegetationSystem` — instanced, merged-geometry palms, bushes and
  grass tufts. Each type is one `InstancedMesh` sharing one geometry + one
  material; placement is deterministic (seeded PRNG), filtered by terrain
  height, slope, water margin and path clearance.
- **Added**: `RockSystem` — instanced low-poly rocks with per-instance palette
  color variation; deterministic placement with the same filters.
- **Added**: `PathSystem` — generic exploration paths (coastal walk, hill
  trail, beach spine) as terrain-following ribbons defined by point lists in
  config. Purely decorative navigation structure; NOT real roads. Exposes
  `isOnPath()` so props stay off walkways.
- **Added**: `AtmosphereSystem` — procedural `Sky` dome (scale fits the camera
  far plane), scene fog (config-driven), hemisphere ambient and directional sun
  with shadow gated by the active quality level.
- **Added**: `DeterministicRandom` — mulberry32 seeded PRNG and integer-lattice
  hash noise utilities. `worldSeed` fully determines terrain, vegetation, rocks
  and jitter (no `Math.random()` in world generation).
- **Added**: `WorldDebugHelper` — optional grid + bounds marker, gated behind
  `debug.enabled` (never visible in production).
- **Changed**: `WorldManager` is now the orchestration layer composing
  Terrain → Ocean → Paths → Vegetation → Rocks → Atmosphere under a single
  `worldRoot`; `collisionHeightAt()` returns terrain height clamped to sea
  level so the player cannot sink or float in open water.
- **Changed**: `PlayerController` collision moved from flat ground to terrain
  height via the `groundHeightAt` callback; jump, gravity and bounds clamp
  preserved.
- **Changed**: `Renderer` gains a quality-aware `setPixelRatioCap`; `Game`
  wires the active quality level (`low | medium | high`) from config into the
  world and renderer.
- **Extended**: `DebugUI` telemetry now includes player position, velocity,
  grounded state, terrain height, ocean height, world seed, current quality,
  vegetation/rock/path counts alongside FPS, resolution, DPR, draw calls and
  triangles.
- **Fixed**: terrain vertex-color bands now compose cumulatively so the
  sand→grass→hill→rock coast ramp actually renders (previously the later bands
  overwrote earlier ones). Camera far plane raised to 5000 and Sky dome scaled
  to 2000 so the procedural sky is visible instead of depth-clipped.
- **Removed**: `Environment` and `Ground` (Phase 2 flat placeholder) —
  superseded by the modular world systems.
- **Validated**: `npm run typecheck` PASS; `npm run build` PASS; production
  preview serve PASS (HTTP 200). Browser runtime validation not available.
- **Architectural decisions**: no physics engine (height-field collision);
  fully data-driven world tuning in `gameConfig`; three quality levels control
  terrain/ocean segments, vegetation/rock density, shadow resolution and pixel
  ratio; instancing + merged geometries keep draw calls low; all procedural
  visuals are code-generated so `data/assets.json` correctly remains empty.

## Phase 2

World Foundation + Player Controller.

- **Added**: `WorldManager` with `worldRoot` group, `Ground` (flat placeholder
  collision surface), `WorldBounds` (rectangular play-area clamp), and
  `Environment` (background, fog, hemisphere + directional lighting with shadow).
- **Added**: `Player` entity (transform group + placeholder capsule mesh,
  movement state) and `PlayerController` (camera-relative direction,
  frame-rate-independent acceleration/deceleration, smooth yaw rotation,
  gravity, jump with press-edge handling, ground collision, bounds clamping).
- **Added**: `PlayerConfig` (tunable parameters) and `PlayerState` (read-only
  snapshot for debug/telemetry); values centralized in `gameConfig`.
- **Added**: `ThirdPersonCamera` (smooth follow, configurable distance/height/
  lookAtHeight/smoothness, pointer + touch orbit) integrated via `CameraManager`.
- **Added**: input architecture — `InputState` (device-independent), `KeyboardInput`
  (WASD/arrows, Shift sprint, Space jump), `InputManager` facade. Gamepad/touch
  sources can plug in without touching `PlayerController`.
- **Extended**: `DebugUI` now shows player telemetry (position, velocity,
  grounded, movement, facing) alongside engine metrics; disabled via config.
- **Changed**: `Game` composition root now wires world → player → controller →
  camera; fixed single render loop retained; `renderer.pixelRatioCap` respected.
- **Removed**: `DevelopmentScene` static test scene (superseded by the world/player
  system; not removed from Phase 1 architecture, only the placeholder scene).
- **EventBus**: added `player:jumped` event.
- **CSS**: `#game-canvas` uses `touch-action: none` so touch orbit drag works.
- **Validated**: `npm run typecheck` PASS; `npm run build` PASS (24 modules,
  gzip 139.74 kB). Browser runtime validation unavailable (no automation).
- **Architectural decisions**: no physics engine (simple ground-height
  collision); movement fully delta-time based with exponential smoothing;
  per-frame telemetry reuses cached objects to avoid allocation churn;
  `touch-action: none` and Pointer Events unify mouse/touch orbit.

## Phase 1

Three.js Foundation implemented.

- **Added**: `index.html` application shell with `#game-canvas` and `#ui-root`.
- **Added**: CSS foundation with design tokens under `src/styles/main.css`
  (box-sizing reset, full-viewport layout, no scrollbars, responsive canvas).
- **Added**: centralized configuration `src/config/gameConfig.ts`
  (renderer, camera, development scene, debug).
- **Added**: core modules `src/core/*` — `Game` (lifecycle/composition root),
  `Renderer` (WebGLRenderer, color management, tone mapping, DPR cap, shadows
  prepared), `SceneManager` (scene graph + dispose), `EventBus` (typed
  pub/sub), `AssetManager` (registry/cache foundation), `types` (typed events).
- **Added**: `src/camera/CameraManager.ts` (PerspectiveCamera, aspect updates).
- **Added**: minimal `src/input/InputManager.ts` (keyboard state boundary only).
- **Added**: development test scene `src/world/DevelopmentScene.ts`
  (development placeholders only — lights, ground, primitives, grid).
- **Added**: lightweight dev diagnostics `src/ui/DebugUI.ts` (status, FPS,
  delta, resolution, DPR, draw calls, triangles), controlled by config.
- **Added**: `src/vite-env.d.ts` (Vite client types for CSS imports).
- **Changed**: `src/main.ts` now bootstraps the `Game` (initialize + start)
  with readable startup-error handling.
- **Validated**: `npm run typecheck` PASS; `npm run build` PASS;
  production preview serve PASS (HTTP 200).
- **Known**: build reports a >500 kB chunk warning (Three.js core);
  gzip 136.36 kB. Code splitting deferred until content growth requires it.
- **Architectural decisions**: render loop uses `requestAnimationFrame` with a
  delta cap (`maxDeltaTimeSeconds`); `ResizeObserver` on the app container
  handles window/fullscreen/orientation resizes with a single observer;
  dev scene is clearly separated from future world content.

## Phase 0

Project foundation initialized.

- **Added**: documentation suite under `docs/` (PROJECT, GAME_DESIGN,
  TECHNICAL_DESIGN, WORLD_DESIGN, ART_DIRECTION, ASSET_GUIDE, DATA_RULES,
  AI_RULES, ROADMAP, DEFINITION_OF_DONE, CHANGELOG).
- **Added**: source-of-truth data files under `data/` in `draft` status with
  empty `items` arrays (no invented factual content).
- **Added**: project scaffolding — `package.json`, `tsconfig.json`,
  `vite.config.ts`, `index.html`, `.gitignore`, module directory skeleton.
- **Added**: professional `README.md`.
- **Architectural decisions**: data-driven content model; strict TypeScript;
  GitHub Pages-ready base path (`./`); versioned source-of-truth data files.
