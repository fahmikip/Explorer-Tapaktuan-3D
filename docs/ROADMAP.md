# Explore Tapaktuan 3D — ROADMAP.md

> Phased development plan. Work proceeds phase by phase, on explicit request.
> Future phases are described here but not implemented early.

---

## Phase 0 — Project Foundation

- Documentation: project, game design, technical design, world design, art
  direction, asset guide, data rules, AI rules, roadmap, definition of done.
- Source-of-truth data files (empty/placeholder, clearly statused).
- Initial project scaffolding, README, CHANGELOG.
- **Status: Complete**

## Phase 1 — Three.js Foundation

- Vite + TypeScript + Three.js wired.
- Renderer, scene, camera, lighting, game loop, responsive canvas.
- Load order and dir structure established.
- **Status: Complete**

## Phase 2 — Player

- Character, movement, camera, collision, interaction, mobile controls.
- **Status: Complete** (foundation: player controller, third-person camera,
  simple ground/world, input architecture; world interaction deferred to later).

## Phase 3 — World Prototype

Procedural coastal environment foundation (technical placeholder, not a
Tapaktuan reconstruction).

- Terrain height field, deterministic seeded generation.
- Ocean, beach/coast transition.
- Instanced vegetation and rocks.
- Generic exploration paths.
- Sky, fog, lighting, quality levels, debug tools.
- **Status: Complete** — see `CHANGELOG.md`.

## Phase 4 — Landmark & Discovery

- Landmark registry, interaction, discovery, information UI.
- Data pipeline (`/data/landmarks.json` → validation → registry → spawning),
  generic interaction layer, first-discovery tracking with optional
  persistence, info panel + interaction hint UI, dev-only test landmarks.
- XP/rewards for discovery are not part of Phase 4 (deferred; rewards appear
  with quests/achievements).
- **Status: Complete** — see `CHANGELOG.md`.

## Phase 5 — NPC & Dialogue

- NPC, interaction, dialogue, dialogue UI.

## Phase 6 — Quest

- Quest manager, objectives, rewards, progression.

## Phase 7 — Tourism Layer

- Tourism information, map, gallery, audio guide.

## Phase 8 — Environment

- Day/night, weather, fog, particles, ambience.

## Phase 9 — Achievement

- Achievements, collection, progression, completion.

## Phase 10 — Polish

- Animation polish, camera transitions, UI polish, cinematic moments,
  accessibility, optimization.

## Phase 11 — Release

- Testing, optimization, PWA, GitHub Pages, documentation, production build.

---

## Phase Discipline

- Only the requested phase is worked on.
- Future-phase interfaces appear only as the smallest appropriate abstraction.
- Avoid scope creep.

---

_This document is part of the project source of truth._