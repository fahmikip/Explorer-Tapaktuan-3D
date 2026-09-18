# Explore Tapaktuan 3D — DATA_RULES.md

> Rules governing all structured data in `/data/*.json` and typed models in `src/`.

---

## 1. Schema Philosophy

- Content is data: landmarks, NPCs, quests, dialogues, achievements, locations,
  and assets live in `/data/*.json`.
- TypeScript models mirror and validate the JSON shapes.
- Logic must not embed large content datasets.
- A schema change is a documented, deliberate event (see CHANGELOG).

---

## 2. File Format Defaults

Every data file begins with:

```json
{
  "version": 1,
  "status": "draft",
  "items": []
}
```

- `version` — schema version of this file (independent per file).
- `status` — data status of the file contents as a whole.

---

## 3. IDs

- Unique IDs, stable forever once released.
- Prefixes by domain: `landmark_001`, `npc_001`, `quest_001`,
  `dialogue_001`, `achievement_001`, `asset_001`, `location_001`.
- Example landmark schema:

```text
id, name, type, description, coordinates, images, audio, sources, status
```

- IDs are never renamed; renaming breaks discoverability and saves.

---

## 4. Data Status System

| Status | Meaning |
| --- | --- |
| draft | Initial data. Not production-ready. |
| review | Needs human verification. |
| verified | Source has been checked. |
| approved | Approved for production. |
| locked | Must not change without explicit authorization. |
| deprecated | No longer valid for active use. |

AI rules:

- `draft` and `review` are never treated as confirmed fact.
- `locked` data is never modified without explicit instruction.
- `deprecated` data is excluded from active use.

---

## 5. Validation

- JSON must parse and satisfy its typed model at load time.
- Invalid required data → meaningful error logged, no silent corruption.
- Missing optional data → safe fallback.
- Loading failure of a content category must not crash the application.

---

## 6. Source Fields

- Factual entities carry `sources` referencing what was checked.
- A factual entry with no credible source cannot reach `approved`.
- Sources are reviewed before `verified` is granted.

---

## 7. Locked Data

- Approved-and-locked entities are frozen.
- Changes require an explicit authorization with a stated reason.
- Changes are logged in the CHANGELOG.

---

## 8. Data-Driven Rules

- Where structure is data-driven, keep logic generic.
- New achievements/quests/landmarks should not require core rewrites.
- Data status changes are reviewed, not silent.

---

## 9. No Hallucination

- Empty arrays and `draft` status are the correct state when content is not yet
  supplied and verified. Do not fill `items` with invented facts to look complete.

---

_This document is part of the project source of truth._