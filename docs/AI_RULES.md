# Explore Tapaktuan 3D — AI_RULES.md

> Binding rules for any AI assistant working on this repository.

---

## 1. Zero-Hallucination Policy

NEVER invent factual information about Tapaktuan, Aceh Selatan — its history,
culture, geography, landmarks, traditions, institutions, historical figures,
distances, locations, or tourism facts.

All information is classified:

```text
REAL / VERIFIED
FICTIONAL / CREATIVE
PLACEHOLDER
UNVERIFIED
```

- `UNKNOWN` never silently becomes `FACT`.
- Plausibility is not evidence.

---

## 2. Source-of-Truth Rules

Authoritative documents:

```text
/docs/PROJECT.md
/docs/GAME_DESIGN.md
/docs/TECHNICAL_DESIGN.md
/docs/WORLD_DESIGN.md
/docs/ART_DIRECTION.md
/docs/ASSET_GUIDE.md
/docs/DATA_RULES.md
/docs/AI_RULES.md
/docs/ROADMAP.md
/docs/DEFINITION_OF_DONE.md
/docs/CHANGELOG.md
```

Authoritative data:

```text
/data/locations.json
/data/landmarks.json
/data/npcs.json
/data/quests.json
/data/dialogues.json
/data/achievements.json
/data/assets.json
```

On conflict: report the conflict. Do not choose randomly.

---

## 3. AI Stop Protocol

If required information is missing, ambiguous, contradictory, or unverified:

- DO NOT guess.
- DO NOT invent.
- DO NOT make up a "reasonable" answer.
- DO NOT silently substitute another location.
- DO NOT silently change the requirement.

Stop the affected implementation and report:

```text
BLOCKED

Issue:
[description]

Affected:
[file/system/feature]

Why this matters:
[reason]

Required information:
[what is needed]

Suggested options:
[optional]
```

Unrelated, unblocked work may continue.

---

## 4. Coding Rules

- Strict TypeScript, clear naming, small modules, single responsibility.
- No giant classes, no duplicated logic, no magic numbers.
- Data-driven content; no hard-coded datasets.
- Graceful error handling; no hidden failures; no silent state corruption.
- Respect the current phase; no premature implementation of future phases.
- Landmark/test content follows the data pipeline: `/data/landmarks.json` →
  validation → registry → spawning. Do not inject landmark content directly
  into system code; do not set `isTestData: true` items to `approved`; test
  placeholders are development probes only and are not creative content.

---

## 5. Modification Rules

- Never modify `locked` data without explicit instruction.
- Never silently change approved direction.
- Every significant change is proposed → reviewed → approved → implemented →
  tested → documented.
- Assets must be registered and approved before production use.

---

## 6. Review Requirements

Before finishing any task, review:

- Architecture placement
- Duplication
- Coupling
- Data-driven correctness
- Performance impact
- Maintainability
- Source-of-truth compliance (was any factual content invented or altered?)

---

## 7. Reporting

- Report actual commands, actual results, actual blockers.
- Never claim tests passed without running them.
- Mark statuses honestly: Completed / Partially Completed / Blocked.

---

_This document is part of the project source of truth._