# Explore Tapaktuan 3D — ART_DIRECTION.md

> Visual direction reference. All assets and visuals must conform to this document.

---

## 1. Visual Style

**Stylized Realistic**

- Realistic proportions and believable materials, simplified and stylized for
  performance and cohesion.
- Feel: tropical, coastal, mountainous, natural, believable, cinematic, modern.

Avoid:

- Fantasy architecture
- Random sci-fi elements
- Anime aesthetic
- Cartoon / toy aesthetic
- Excessive neon
- Random futuristic objects
- Unrelated biome assets

---

## 2. Environment Style

- Warm tropical light; sea reflects sky; mountain haze reads natural.
- Vegetation: stylized-realistic palms and broadleaf canopy; consistent palette.
- Architecture: coastal/tropical vernacular forms, tasteful detail, no exotic fanciful shapes.
- Water: believable stylized ocean surface; calm-to-moderate condition.

---

## 3. Character Style

- NPCs fit the same stylized-realistic language as the environment.
- No disproportionate cartoon features.
- Clothing/props reference coastal community life and visitors — never as claims
  about real individuals.

---

## 4. Lighting

- Sun as primary source with warm key and cooler fill/sky bounce.
- Time of day (Phase 8) shifts hue/temperature coherently with the palette.
- Golden-hour and sunset look are design targets (coastal + sea).
- Ambient levels must keep readability (contrast between surfaces).

---

## 5. Materials

- PBR (base color, roughness, metalness) in GLB assets where applicable.
- Consistent roughness response: organic mats (vegetation, ground), glossier
  coastal materials (water, painted surfaces) without gimmick chrome.
- Avoid noisy textures and heavy normal overuse at distance.

---

## 6. Color Philosophy

- Grounded in warm natural hues (sand, sea, foliage, wood, stone).
- Accents used sparingly and deliberately (signage, UI highlights).
- No neons; no overly saturated toy colors.
- Sky/sea/mountain color relationship is the visual anchor of the globe.

---

## 7. UI Visual Direction

- Modern tourism application + exploration game.
- Clean, premium, minimal, readable, cinematic, responsive.
- Centralized design tokens (CSS custom properties) only — no scattered colors.
- Avoid excessive glassmorphism, gradients, or animation.
- Clear focus/contrast states; never rely on color alone for state.

---

## 8. Consistency Rules

Before introducing an asset, verify against:

```text
Scale
Polygon density
Texture style
Lighting compatibility
Material style
Color palette
Visual quality
Performance cost
```

Mixed or incompatible visual languages are not permitted without explicit approval.

---

_This document is part of the project source of truth._