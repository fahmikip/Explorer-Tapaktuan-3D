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
- Phase 2 — Pending (explicit authorization required)

See [ROADMAP.md](./ROADMAP.md) and [CHANGELOG.md](./CHANGELOG.md).

---

## 10. Governance

- The **PROJECT CONSTITUTION** (master prompt) is the highest-level rule set.
- Immediate authority below it: `docs/` documents, then `data/` sources of truth,
  then technical architecture, approved design, current phase, and existing code.
- Conflicts are reported, never silently resolved.

---

_This document is part of the project source of truth._