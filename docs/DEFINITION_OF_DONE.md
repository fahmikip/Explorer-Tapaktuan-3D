# Explore Tapaktuan 3D — DEFINITION_OF_DONE.md

> The quality gate every phase (and significant task) must pass.
> A task is NOT done merely because "it runs."

---

## DOD Checklist

- [ ] Requirements implemented as requested
- [ ] Existing functionality preserved
- [ ] TypeScript compilation succeeds (`npm run typecheck`)
- [ ] Production build succeeds (`npm run build`)
- [ ] No broken imports
- [ ] No obvious console errors during validation
- [ ] No unnecessary dependencies added
- [ ] Source of truth respected (no invented factual content)
- [ ] Architecture respected (correct module, no wrong coupling)
- [ ] Responsive behavior checked (desktop + mobile)
- [ ] Performance considered (draw calls, memory, loading)
- [ ] Documentation updated where affected
- [ ] CHANGELOG updated

---

## Testing Baseline

Minimum validation for every phase:

```text
npm install
npm run build
```

When scripts exist:

```text
npm run lint
npm run test
```

- Test claims require actually executed tests with recorded results.
- Fabricated results are never acceptable.

---

## Quality Gates

| Gate | Requirement |
| --- | --- |
| Build | `npm run build` succeeds |
| Types | `npm run typecheck` succeeds (strict) |
| Data | JSON parses and matches typed models |
| Content | Factual content cited + statused; no hallucination |
| Assets | Registered in `assets.json` with approved status |
| UI/UX | Tokens used; accessible; responsive; no color-only state |
| Perf | Budgets reviewed per phase; no blind over-engineering |

---

## Documentation Requirement

Documentation is part of implementation:

- Architecture change → `TECHNICAL_DESIGN.md`
- Visual direction → `ART_DIRECTION.md`
- World design → `WORLD_DESIGN.md`
- Data structures → `DATA_RULES.md`
- Any change → `CHANGELOG.md`

---

_This document is part of the project source of truth._