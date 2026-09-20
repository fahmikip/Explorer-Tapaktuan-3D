# Changelog

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