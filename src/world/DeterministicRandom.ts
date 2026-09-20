/**
 * Deterministic pseudo-random utilities for world generation.
 * Every procedural placement and height computation derives from an integer
 * seed, so the same seed always produces the same world.
 */

/**
 * Mulberry32 — tiny fast seeded PRNG returning floats in [0, 1).
 */
export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministic hash of integer lattice coordinates + seed,
 * mapped to [0, 1). Used for seamless value-noise sampling.
 */
export function hash2(
  x: number,
  z: number,
  seed: number,
): number {
  let h =
    (Math.imul(x | 0, 374761393) + Math.imul(z | 0, 668265263) +
      Math.imul(seed | 0, 0x85ebca6b)) |
    0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h = h ^ (h >>> 16);
  return (h >>> 0) / 4294967296;
}

export function smoothstep01(t: number): number {
  const value = Math.min(1, Math.max(0, t));
  return value * value * (3 - 2 * value);
}

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}