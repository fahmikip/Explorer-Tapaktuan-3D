# Explore Tapaktuan 3D — GAME_DESIGN.md

> Gameplay design reference. This document describes the intended experience.
> It does not itself verify any real-world facts.

---

## 1. Core Experience

Explore Tapaktuan 3D is an **interactive tourism + exploration game + digital
storytelling** experience.

The player is a visitor exploring a stylized tropical coastal mountain world.
The core emotional arc is: curiosity → discovery → learning → satisfaction.

---

## 2. Gameplay Loop

```text
Move through the world
  ↓
Notice a point of interest (landmark, object, NPC)
  ↓
Approach and interact
  ↓
Receive verified information or dialogue
  ↓
Earn discovery progress / XP
  ↓
Open quests and achievements
  ↓
Decide what to explore next
```

The loop is intrinsically motivated by world curiosity, not by combat or resource
management.

---

## 3. Player

### 3.1 Identity

- A visitor / traveler exploring Tapaktuan.
- No defined background story is required by the core design.
- Perspective: third-person character view.

### 3.2 Capabilities

- Walk and run (Shift sprint where appropriate).
- Jump where appropriate (design decision per phase).
- Interact with points of interest (E key on desktop / on-screen button on mobile).
- Move using WASD on desktop, virtual joystick on mobile.

### 3.3 Comfort

- Camera follows smoothly; never clips through walls without mitigation.
- Movement feels grounded but not sluggish.
- Mobile controls never conflict with desktop controls.

---

## 4. Exploration

- The world is a curated vertical slice, not an endless open world.
- Exploration is rewarded through discovery and information.
- The environment guides attention via composition, lighting, and landmarks —
  not via intrusive quest markers (markers allowed but minimal in style).

### 4.1 Zones (structural)

Zones are **structural design categories**, not claims about real geographic boundaries:

- ZONE 01 — Town
- ZONE 02 — Residential
- ZONE 03 — Coastal
- ZONE 04 — Mountain / Forest
- ZONE 05 — Landmark Area

---

## 5. Discovery System

Mechanic:

```text
UNDISCOVERED
  ↓
PLAYER APPROACHES
  ↓
INTERACTION
  ↓
DISCOVERED
  ↓
INFORMATION UNLOCKED
  ↓
XP / ACHIEVEMENT
```

- Each landmark has a unique ID.
- Discovery state is persisted per save.
- Discovery data references approved content only.
- Re-approaching a discovered landmark may allow revisiting information.

---

## 6. NPC System

NPCs may provide:

- Directions
- Gameplay information
- Tourism information
- Quest initiation
- Fictional storytelling

Rules:

- Any factual historical/cultural content an NPC gives must reference approved source data.
- Fictional dialogue is fine, but must never be presented as factual history.

---

## 7. Quest System

Quest categories:

```text
exploration
discovery
information
collection
story
```

Design rules:

- Quests are data-driven (id, title, description, type, objectives, rewards,
  prerequisites, status).
- Quest logic is NOT tightly coupled to individual NPCs or landmarks.
- Progression is tracked in a versioned save.

---

## 8. Achievement System

Achievement categories:

```text
exploration
discovery
knowledge
completion
```

Design rules:

- Generic achievement engine; adding new achievements does not require core rewrites.
- Examples in related data remain placeholders until approved.

---

## 9. Progression

Two lightweight, non-combat progression layers:

1. **Discovery progress** — world knowledge unlocked by finding and interacting.
2. **Achievements** — long-term goals across categories.

No leveling, stats, gear, or combat progression.

---

## 10. UX Philosophy

- Modern tourism application + exploration game.
- Clean, premium, minimal, readable, cinematic, responsive.
- Avoid: excessive gaming HUD, neon UI, fantasy RPG chrome, clutter.
- State is communicated by more than color alone (accessibility).
- Reduced-motion and audio controls must be available.

---

## 11. Content Rules

- Every piece of factual content requires a source and a status.
- Creative content (effects, transitions, dialogue flavor) may be designed freely,
  but must not present itself as factual history.
- Placeholder content must be clearly marked as placeholder.

---

_This document is part of the project source of truth._