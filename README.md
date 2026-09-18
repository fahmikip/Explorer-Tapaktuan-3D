# Explore Tapaktuan 3D

**Where the Mountain Meets the Sea**

An interactive, browser-based 3D tourism experience inspired by Tapaktuan,
Aceh Selatan. Explore a stylized tropical coastal world, discover verified
landmarks, interact with the environment, and learn through guided exploration.

> **Status:** Phase 0 (Project Foundation) — **Complete**.

---

## Tech Stack

- **TypeScript** (strict)
- **Three.js** (GLB / glTF)
- **Vite**
- **HTML5 / CSS3**

## Getting Started

```bash
npm install
npm run dev        # start dev server
npm run build      # typecheck + production build
npm run typecheck  # strict TypeScript check only
npm run preview    # preview the production build
```

Requires Node.js 20.19+ / 22.12+.

## Roadmap

| Phase | Deliverable | Status |
| --- | --- | --- |
| 0 | Project Foundation | ✅ Complete |
| 1 | Three.js Foundation | Pending |
| 2 | Player | Pending |
| 3 | World Prototype | Pending |
| 4 | Landmark & Discovery | Pending |
| 5 | NPC & Dialogue | Pending |
| 6 | Quest | Pending |
| 7 | Tourism Layer | Pending |
| 8 | Environment | Pending |
| 9 | Achievement | Pending |
| 10 | Polish | Pending |
| 11 | Release (GitHub Pages) | Pending |

## Repository Structure

```text
docs/   Project documentation (source of truth)
data/   Content data (JSON, versioned + statused)
src/    TypeScript modules
public/ Static assets (models, textures, images, audio, fonts, icons)
tests/  Tests (added when testable logic appears)
```

## Source of Truth

This project follows a strict governance model. Real-world information about
Tapaktuan must be **verified and statused** before use; the AI never invents
facts. See:

- [PROJECT.md](./docs/PROJECT.md)
- [GAME_DESIGN.md](./docs/GAME_DESIGN.md)
- [TECHNICAL_DESIGN.md](./docs/TECHNICAL_DESIGN.md)
- [WORLD_DESIGN.md](./docs/WORLD_DESIGN.md)
- [ART_DIRECTION.md](./docs/ART_DIRECTION.md)
- [ASSET_GUIDE.md](./docs/ASSET_GUIDE.md)
- [DATA_RULES.md](./docs/DATA_RULES.md)
- [AI_RULES.md](./docs/AI_RULES.md)
- [ROADMAP.md](./docs/ROADMAP.md)
- [DEFINITION_OF_DONE.md](./docs/DEFINITION_OF_DONE.md)
- [CHANGELOG.md](./docs/CHANGELOG.md)

## License

To be determined. No assets are licensed for production use until documented
in `data/assets.json`.