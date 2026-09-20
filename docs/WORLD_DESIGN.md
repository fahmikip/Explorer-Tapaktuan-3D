# Explore Tapaktuan 3D — WORLD_DESIGN.md

> World building reference. This document defines the creative world design.
> It does NOT claim or invent geographic facts about the real Tapaktuan.

---

## 1. World Philosophy

The world is a **curated, believable, stylized representation** of a tropical
coastal mountain town. It is built as a vertical slice, not a full city copy.

Design intent:

- The environment is the content. It is viewed, walked, admired.
- Space guides curiosity: streets open toward the sea, paths rise toward the mountain.
- Density is controlled — a visit should feel composed, not crowded.

---

## 2. Zone Structure

Zones are **structural categories**, not claims of real administrative or
geographic boundaries. They organize the build and pacing.

| Zone | Working name | Design role |
| --- | --- | --- |
| ZONE 01 | Town | Compact core, shops/marketplace feel, main street |
| ZONE 02 | Residential | Calmer streets, houses, community character |
| ZONE 03 | Coastal | Waterfront, ocean view, open sky |
| ZONE 04 | Mountain / Forest | Slopes, greenery, ascent, quieter atmosphere |
| ZONE 05 | Landmark Area | Anchors of discovery content and viewpoints |

Transitions between zones should be physically plausible and visually communicated
(vegetation density, built density, elevation, soundscape later).

---

## 3. Exploration Design

- Points of interest are distributed so the walk between them is interesting.
- Verticality (coast ↔ mountain) is a defining feature.
- Lighting emphasizes the coastal-mountain relationship (sea horizon, mountain silhouette).
- Navigation aids may exist, but the world itself is the primary guide.

---

## 4. Landmark Design

- Real-world landmarks require verified source data before inclusion.
- Each landmark has a unique ID and a data status.
- Landmark content appears through the Discovery system, not as hard-coded text.
- No fictional landmark may be presented as real. No real landmark name may be
  invented, renamed, or relocated.

---

## 5. Environmental Design

- Tropical vegetation (palms, canopy, scrub) — consistent style, no biome mixing.
- Ocean as a major visible presence (view directions, coastline).
- Mountain as a backdrop and an explorable direction.
- Build materials: coastal/tropical vernacular, stylized, consistent.

---

## 6. Future Expansion Strategy

- New zones/areas are additive: they extend the world without rewriting it.
- World layout stays data-driven (zone metadata, placements, spawn points).
- Content can be expanded per zone without cross-cutting core systems.
- Expansion requires its own review of art direction consistency and performance.

---

## 7. Phase 3 — Procedural Environment Foundation

The Phase 3 world is a **generic procedural coastal environment** built to
establish the technical foundation for future world building. It is **not** a
representation of Tapaktuan; no real geography, roads, buildings or landmarks
were used or assumed.

### 7.1 Terrain concept

- Deterministic seeded island silhouette (height + noise), designed to read as
  "coast → lowland → hills → high ground" when moving inland from the sea.
- Vertex-color elevation ramp communicates the zones through material: sand
  near the shore, grass over the lowlands, hills with rocky caps at the peaks.
- The terrain is intentionally generic so later phases can replace or layer it
  with approved, statused land data.

### 7.2 Environment placement

- Vegetation (palms, bushes, grass) and rocks are placed procedurally with
  rules tuned to believable terrain: kept off steep slopes, off walkways, and
  away from open water.
- Streets/walkways are generic exploration paths (coastal walk, hill trail,
  beach spine) defined in config — navigation structure only, never real roads.

### 7.3 Visual tone

- Warm tropical light (hemisphere + directional sun), soft fog for depth, calm
  ocean with subtle wave. Palette: natural sand, foliage and sea tones per
  [ART_DIRECTION.md](./ART_DIRECTION.md).

### 7.4 Placeholder status

- All Phase 3 visuals are **placeholder / technical art** and are not
  subject to `data/assets.json` registration because they are procedurally
  code-generated (no external asset files are shipped).

---

_This document is part of the project source of truth._