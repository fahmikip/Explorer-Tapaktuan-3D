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
- Content lives in `/data/landmarks.json` and is rendered only after passing the
  data loader validation: approved (`status: "approved"`) items are production
  content; anything flagged `isTestData: true` is visible only in development
  and never ships (see [DATA_RULES.md](./DATA_RULES.md)).

---

## 4A. Landmark Gameplay (Phase 4)

Phase 4 establishes the **system** for landmarks/POIs, not the content. The
spawned markers are test placeholders (named "Uji …"), purely for validating
the pipeline.

Gameplay loop:

- Landmarks are placed in the world at positions declared in data (terrain
  height used automatically when `y` is omitted).
- Approaching a POI shows an interaction hint (`[E] …`).
- Pressing E opens the read-only information panel with the content approved in
  data (descriptions/fields hidden when empty). Test items carry a
  "DEBUG / TEST DATA" badge.
- First viewing marks the landmark as discovered; marker color/icon updates and
  the discovery is persisted (optional).

Marker states are conveyed by three signals — color, glyph and ring — and are
never color-only, keeping the system friendly to color-blind players.

### Test landmark placeholder positions (Phase 4, dev only)

| ID | Type | Position |
| --- | --- | --- |
| `TEST_LANDMARK_01` | landmark | (0, 14) |
| `TEST_VIEWPOINT_01` | viewpoint | (28, 28) |
| `TEST_DISCOVERY_01` | discovery | (-25, 20) |

All are `isTestData: true`, `status: "draft"`, and exist only inside the ~±38 m
play bounds. They are **not** creative content placements — they are development
probes and will be removed/replaced when real approved data arrives.

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