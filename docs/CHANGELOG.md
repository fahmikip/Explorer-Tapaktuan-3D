# Changelog

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