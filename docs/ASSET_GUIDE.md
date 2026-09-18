# Explore Tapaktuan 3D — ASSET_GUIDE.md

> Governance for every production 3D/2D/audio asset in the project.

---

## 1. Purpose

Every production asset is registered in `/data/assets.json`. No asset is used in
production without registration and an approved status. Deprecated assets are
never used in production.

---

## 2. Directory Rules

```text
public/assets/
├── models/     GLB / glTF
├── textures/   PNG / JPG / WebP / KTX2 (later)
├── images/     UI images, banners, gallery photos
├── audio/      Music, ambience, SFX, voice
└── fonts/      Web fonts

public/icons/   UI icons (SVG)
```

Placeholder/draft assets live in the same folders but are clearly marked by status
in `assets.json`, not by untracked loose files.

---

## 3. Naming Conventions

- Lowercase, kebab-case: `palm_tree_coconut.glb`, `sand_grain_01.png`.
- Prefix by category when helpful: `tex_`, `mdl_`, `sfx_`, `mus_`, `fnt_`.
- Version date suffix only when files must coexist (`_v2`).
- No spaces, no uppercase, no Unicode whitespace in filenames.

---

## 4. GLB / glTF Rules

- One logical object per GLB where practical; share materials intelligently.
- Y-up, meters as units, correct orientation.
- Textures embedded only when the asset ships standalone; otherwise external.
- Draco mesh compression used when quality permits.
- Asset scale must be authored at real-world meter scale.

---

## 5. Texture Rules

- Power-of-two dimensions preferred.
- Keep practical resolutions for target platforms (consider mobile memory).
- Filename encodes content, not arbitrary IDs.
- Color textures use sRGB handling per Three.js conventions.

---

## 6. Polygon Guidance

- Budget-conscious by asset class (hero prop > filler prop).
- Vertex/poly budgets are reviewed per phase and recorded per asset.
- LOD authored where the asset appears at multiple distances.
- Excessive subdivision is a review failing, not a style choice.

---

## 7. Scale Rules

- All GLB authored in meters; 1 unit = 1 meter.
- Player height reference approved in the phase where the character lands.
- Proportions checked against the reference to avoid toy-scale or giant-scale mismatch.

---

## 8. Registry Requirements (`assets.json`)

Each asset record:

```text
id           unique asset ID
name         display/reference name
category     model | texture | image | audio | font | icon
format       glb | gltf | png | jpg | webp | mp3 | ogg | woff2 | svg | ...
version      asset version
source       origin (author/producer/store)
author       creator credit
license      license identifier or note
status       draft | testing | approved | locked | deprecated
```

Status flow: `draft → testing → approved → locked | deprecated`.

---

## 9. License Requirements

- Every asset must have a recorded license.
- CC0, CC-BY (with attribution) or permissive commercial licenses preferred.
- Assets without a clear license are NOT used in production.
- Licensing must survive a public GitHub Pages deployment.

---

## 10. Style Consistency Gate

Before approval, every asset passes the consistency gate from
[ART_DIRECTION.md](./ART_DIRECTION.md):

```text
Scale | Polygon density | Texture style | Lighting compatibility |
Material style | Color palette | Visual quality | Performance cost
```

---

_This document is part of the project source of truth._