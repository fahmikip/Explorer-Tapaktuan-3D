# Explore Tapaktuan 3D — PROJECT.md

> **Where the Mountain Meets the Sea**

---

## 1. Project Identity

| Field | Value |
| --- | --- |
| Project name | Explore Tapaktuan 3D |
| Tagline | Where the Mountain Meets the Sea |
| Project type | Interactive 3D Tourism Experience |
| Primary platform | Desktop web browser, Mobile web browser |
| Deployment target | GitHub Pages |
| Primary technology | TypeScript, Three.js, Vite, HTML5, CSS3 |
| 3D asset format | GLB / glTF |
| Architecture philosophy | Modular, Data Driven, Maintainable, Performance Conscious |

---

## 2. Vision

Explore Tapaktuan 3D is an interactive, browser-based tourism experience inspired by
Tapaktuan, Aceh Selatan.

The user enters a 3D world, explores the environment, discovers locations, interacts
with selected objects and NPCs, reads or listens to verified information, completes
exploration activities, and unlocks achievements.

The experience should feel like:

- Interactive tourism
- Exploration game
- Digital storytelling

It must NOT feel like:

- A generic 3D demo
- A technical Three.js showcase
- A random open-world game
- A fantasy RPG
- A generic AI-generated city
- An inaccurate virtual representation of Tapaktuan

---

## 3. Core Experience Flow

```text
ENTER
  ↓
EXPLORE
  ↓
DISCOVER
  ↓
INTERACT
  ↓
LEARN
  ↓
COMPLETE ACTIVITIES
  ↓
UNLOCK
  ↓
CONTINUE EXPLORING
```

---

## 4. Objectives

1. Provide a believable, stylized 3D representation of the Tapaktuan coastal mountain environment.
2. Deliver verified tourism information through exploration, landmarks, NPCs, and audio.
3. Offer structured activities (discovery, quests, achievements) that deepen engagement.
4. Keep the experience accessible on desktop and mobile browsers.
5. Establish a maintainable, data-driven codebase that survives future content expansion.

---

## 5. Scope

### In scope

- 3D world prototype with terrain, ocean, buildings, vegetation, and mountains.
- Player movement, camera, interaction, and collision on desktop and mobile.
- Landmark & discovery system with verified information.
- NPC system with dialogue and directions.
- Quest system (exploration, discovery, information, collection, story).
- Tourism layer: information, map, gallery, audio guide.
- Environment system: day/night, weather, ambience.
- Achievement system.
- Local save persistence (versioned).
- Deployment to GitHub Pages.

### Out of scope (non-goals)

- Combat, health bars, or RPG combat mechanics.
- Multiplayer or networked features.
- Photorealistic reconstruction of Tapaktuan.
- Real-time traffic, public transport simulation, or city simulation.
- User-generated content.
- Forced monetization or advertising.
- Native mobile apps (web only).

---

## 6. Platforms

- Desktop: Chrome, Edge, Firefox, Safari (recent two major versions).
- Mobile: iOS Safari, Android Chrome (recent two major versions).
- Orientation: landscape and portrait supported; UI must adapt responsibly.

---

## 7. Technology

| Layer | Choice | Reason |
| --- | --- | --- |
| Language | TypeScript (strict) | Type safety, maintainability |
| 3D engine | Three.js | WebGL abstraction, ecosystem, maturity |
| Build tool | Vite | Fast dev server, modern bundling, GitHub Pages friendly |
| Markup/Style | HTML5, CSS3 | Native, fast, no framework lock-in |
| 3D assets | GLB / glTF | Standard, compressible, supported by Three.js |
| Persistence | localStorage | Versioned save structure, no backend required |

---

## 8. Principles

1. **Correctness** — Never invent or present unverified facts as real-world information.
2. **Consistency** — One visual language, one data philosophy, one code style.
3. **Maintainability** — Small modules, single responsibility, clear interfaces.
4. **Modularity** — Systems are independent and data-driven where appropriate.
5. **Performance** — Target browsers and mobile; always consider rendering and memory cost.
6. **Accessibility** — Readable text, keyboard usability, clear feedback, reduced motion.
7. **Documentation** — Docs are part of the implementation, not an afterthought.
8. **Controlled change** — Phased development; no scope creep; documented decisions.

---

## 9. Status

- Phase 0 — Project Foundation: **Complete**
- Phase 1 — Three.js Foundation: **Complete**
- Phase 2 — World Foundation + Player Controller: **Complete**
- Phase 3 — World Prototype (procedural coastal environment foundation): **Complete**
- Phase 4 — Landmark & POI System: **Complete**
- Phase 5 — NPC & Dialogue: **Complete**
- Phase 6 — Quest: **Complete**

See [ROADMAP.md](./ROADMAP.md) and [CHANGELOG.md](./CHANGELOG.md).

---

## 10. Governance

- The **PROJECT CONSTITUTION** (master prompt) is the highest-level rule set.
- Immediate authority below it: `docs/` documents, then `data/` sources of truth,
  then technical architecture, approved design, current phase, and existing code.
- Conflicts are reported, never silently resolved.

---

## 11. Amendments

### Phase 2

- **STATEMENT of position**: the visitor experience is the destination; the
  development scene is not representative of Tapaktuan. Every development-phase
  visual ("DEV") is placeholder geometry. Development visuals are never
  presented as, confused with, or substituted for, the real-world location;
  all description and guidance copy ("PROD") and all guest-facing visuals and
  mechanics are delivered under the REQUIREMENTS-DOC-AWARE AND PROD-COPY-ONLY
  rules and verified data rules.
- **Phase 2 scope**: World Foundation + Player Controller only (ground, world
  bounds, environment, third-person camera, player controller, input).
  Deep-click world interaction, landmarks, points of interest, and all future
  tourism systems are explicitly out of scope for Phase 2.
- **Phase 2 record**: Completed — see [CHANGELOG.md](./CHANGELOG.md) for the
  implemented modules and validation results.

### Phase 3

- **STATEMENT of position**: the Phase 3 world is a generic procedural
  coastal environment foundation (terrain, ocean, vegetation, rocks, generic
  paths, atmosphere). It is placeholder/technical art and **not** a
  reconstruction of Tapaktuan; no real geographic facts, roads, buildings or
  landmarks were used or invented.
- **Phase 3 scope**: procedural environment foundation only — terrain height
  field, ocean, coast transition, instanced vegetation and rocks, generic
  paths, sky/fog/lighting, quality levels, debug tools, terrain-player
  collision integration. NPCs, dialogue, quests, achievements, landmarks,
  tourism content, day/night and weather simulation are explicitly out of
  scope for Phase 3.
- **Phase 3 record**: Completed — see [CHANGELOG.md](./CHANGELOG.md) for the
  implemented modules, fixes and validation results.

### Phase 4

- **STATEMENT of position**: Phase 4 adds the landmark & POI **system**, not
  landmark **content**. The only landmarks present are development test probes
  (`isTestData: true`, `status: "draft"`, named "Uji …") used to validate the
  pipeline. No real Tapaktuan facts, names, positions or descriptions were
  used or invented; real approved landmark data can be added to
  `/data/landmarks.json` and flows through the same pipeline unchanged.
- **Phase 4 scope**: data model + non-throwing loader/validator, registry,
  generic `Interactable` interaction layer (E-key, nearest-within-radius,
  hint), discovery tracking with optional persistence, procedural placeholder
  landmark visuals, info panel (desktop/mobile) and interaction hint UI,
  GameEventMap + config additions, dev-only test landmarks and panel-open
  input lock. XP/rewards for discovery, NPCs, dialogue, quests, achievements,
  map/gallery and audio guides are explicitly out of scope for Phase 4.
- **Phase 4 record**: Completed — see [CHANGELOG.md](./CHANGELOG.md) for the
  implemented modules and validation results.

---

_This document is part of the project source of truth._

### Phase 5

- **STATEMENT of position**: NPCs and dialogues are systems, not tourism
  content. Current NPCs and dialogue are explicitly marked draft test data;
  no real people or Tapaktuan facts are represented.
- **Phase 5 scope**: validated data-driven NPC/dialogue catalogs, generic
  interactable NPC placeholders, proximity visibility, linear and branching
  dialogue state, keyboard/button UI, and dev-only test data. Quests,
  achievements, production NPCs, and verified tourism content remain outside
  this phase.
- **Phase 5 record**: Complete — see [CHANGELOG.md](./CHANGELOG.md).

### Phase 6

- **STATEMENT of position**: the quest system is content-neutral. The only
  quest is explicitly marked draft test data and does not present tourism
  information as verified fact.
- **Phase 6 scope**: validated quest definitions, discovery/NPC interaction
  objectives, event-driven progression, reward points, optional local
  persistence, and an active quest tracker. Achievements remain Phase 9.
- **Phase 6 record**: Complete — see [CHANGELOG.md](./CHANGELOG.md).
