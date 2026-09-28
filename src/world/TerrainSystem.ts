import * as THREE from "three";
import type { TerrainConfig } from "../config/gameConfig";
import type { Disposable } from "../core/types";
import { hash2, lerp, smoothstep01 } from "./DeterministicRandom";

/**
 * Procedural island-style terrain with deterministic seeded height function.
 *
 * Elevation is a smooth radial falloff (sea-level at the world edges) stacked
 * with several octaves of hash-based value noise. The same seed always yields
 * the same terrain — this is the single `getHeightAt` authority for the world.
 */
export class TerrainSystem implements Disposable {
  readonly mesh: THREE.Mesh;

  private readonly geometry: THREE.PlaneGeometry;
  private readonly material: THREE.MeshStandardMaterial;
  private readonly config: TerrainConfig;
  private readonly seed: number;
  private readonly falloffScale: number;
  private readonly radialScale: number;

  constructor(
    config: TerrainConfig,
    seed: number,
    width: number,
    depth: number,
    segments: number,
  ) {
    this.config = config;
    this.seed = seed;

    const falloffSpan = Math.max(
      0.001,
      config.falloffEnd - config.falloffStart,
    );
    this.falloffScale = 1 / falloffSpan;
    this.radialScale = 1 / Math.hypot(width / 2, depth / 2);

    this.geometry = new THREE.PlaneGeometry(width, depth, segments, segments);
    this.geometry.rotateX(-Math.PI / 2);

    this.applyHeights(width / 2, depth / 2);
    this.geometry.computeVertexNormals();

    this.material = new THREE.MeshStandardMaterial({
      roughness: 1,
      metalness: 0,
      vertexColors: true,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.name = "terrain";
    this.mesh.receiveShadow = true;
  }

  /**
   * Terrain height authority. Deterministic for a given seed.
   */
  getHeightAt(x: number, z: number): number {
    const radius = Math.hypot(x, z) * this.radialScale;

    const falloff = 1 - smoothstep01((radius - this.config.falloffStart) * this.falloffScale);
    let elevation = falloff * this.config.maxHeight;

    const baseFrequency = 1 / this.config.noiseWavelength;
    let frequency = baseFrequency;
    let amplitude = this.config.noiseAmplitude;
    let octaveSum = 0;
    let noiseWeight = 0;
    for (let i = 0; i < this.config.noiseOctaves; i += 1) {
      octaveSum += valueNoise(x * frequency, z * frequency, this.seed + i) * amplitude;
      noiseWeight += amplitude;
      frequency *= 2;
      amplitude *= 0.5;
    }
    elevation += octaveSum / noiseWeight;

    const pastLand = Math.max(0, (radius - this.config.falloffEnd) / (1 - this.config.falloffEnd));
    elevation -= pastLand * pastLand * this.config.maxHeight * 0.75;

    return elevation;
  }

  /**
   * Approximate terrain gradient (rise over horizontal run) at a point.
   * Used by placement rules to keep props out of impossible slopes.
   */
  getSlopeAt(x: number, z: number): number {
    const step = 1;
    const hx = this.getHeightAt(x + step, z) - this.getHeightAt(x - step, z);
    const hz = this.getHeightAt(x, z + step) - this.getHeightAt(x, z - step);
    return Math.hypot(hx, hz) / (2 * step);
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
    this.mesh.removeFromParent();
  }

  private applyHeights(halfWidth: number, halfDepth: number): void {
    void halfWidth;
    void halfDepth;

    const position = this.geometry.getAttribute("position") as THREE.BufferAttribute;
    const colorAttribute = new THREE.BufferAttribute(
      new Float32Array(position.count * 3),
      3,
    );
    const sand = new THREE.Color(this.config.colors.sand);
    const grass = new THREE.Color(this.config.colors.grass);
    const hill = new THREE.Color(this.config.colors.hill);
    const rock = new THREE.Color(this.config.colors.rock);
    const scratch = new THREE.Color();

    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i);
      const z = position.getZ(i);
      const elevation = this.getHeightAt(x, z);
      position.setY(i, elevation);

      scratch.copy(sand);
      this.band(scratch, grass, elevation, this.config.beachHeight, 0.8);
      this.band(scratch, hill, elevation, this.config.grassHeight, 1.2);
      this.band(scratch, rock, elevation, this.config.hillHeight, 1.6);

      const jitter = hash2(x * 3.7, z * 3.1, this.seed + 9001) * 0.07 - 0.035;
      scratch.offsetHSL(0, 0, jitter);

      colorAttribute.setXYZ(i, scratch.r, scratch.g, scratch.b);
    }

    this.geometry.setAttribute("color", colorAttribute);
  }

  /**
   * Cumulatively blends the surface color toward `to` as elevation passes the
   * band centered at `center`. Each call refines the previous band, producing a
   * coast→grass→hill→rock ramp instead of overwriting the earlier colors.
   */
  private band(
    color: THREE.Color,
    to: THREE.Color,
    elevation: number,
    center: number,
    width: number,
  ): void {
    const t = smoothstep01((elevation - (center - width * 0.5)) / width);
    color.lerp(to, t);
  }
}

function valueNoise(x: number, z: number, seed: number): number {
  const x0 = Math.floor(x);
  const z0 = Math.floor(z);
  const tx = x - x0;
  const tz = z - z0;
  const sx = smoothstep01(tx);
  const sz = smoothstep01(tz);

  const a = lerp(hash2(x0, z0, seed), hash2(x0 + 1, z0, seed), sx);
  const b = lerp(hash2(x0, z0 + 1, seed), hash2(x0 + 1, z0 + 1, seed), sx);
  return lerp(a, b, sz) - 0.5;
}
