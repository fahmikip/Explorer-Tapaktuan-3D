import * as THREE from "three";
import type { OceanConfig } from "../config/gameConfig";
import type { Disposable } from "../core/types";

/**
 * Lightweight ocean: a large grid flattened at sea level with a subtle
 * vertex-based wave. Deterministic (no randomness) and shader-free.
 */
export class OceanSystem implements Disposable {
  readonly mesh: THREE.Mesh;
  readonly height: number;

  private readonly geometry: THREE.BufferGeometry;
  private readonly material: THREE.MeshStandardMaterial;
  private readonly config: OceanConfig;
  private time = 0;

  constructor(config: OceanConfig, segments: number) {
    this.config = config;
    this.height = config.height;

    const grid = segments + 1;
    const count = grid * grid;
    const positions = new Float32Array(count * 3);

    for (let j = 0; j < grid; j += 1) {
      for (let i = 0; i < grid; i += 1) {
        const x = (i / segments - 0.5) * config.size;
        const z = (j / segments - 0.5) * config.size;
        const index = j * grid + i;
        positions[index * 3] = x;
        positions[index * 3 + 1] = config.height;
        positions[index * 3 + 2] = z;
      }
    }

    const indices: number[] = [];
    for (let j = 0; j < segments; j += 1) {
      for (let i = 0; i < segments; i += 1) {
        const a = j * grid + i;
        const b = a + 1;
        const c = a + grid;
        const d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    this.geometry.setIndex(indices);
    this.geometry.computeVertexNormals();

    this.material = new THREE.MeshStandardMaterial({
      color: config.color,
      roughness: config.roughness,
      metalness: config.metalness,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.name = "ocean";
    this.mesh.receiveShadow = true;
  }

  update(deltaTime: number): void {
    this.time += deltaTime;

    const position = this.geometry.getAttribute(
      "position",
    ) as THREE.BufferAttribute;
    const amplitude = this.config.waveAmplitude;
    const frequency = this.config.waveFrequency;
    const speed = this.config.waveSpeed;
    const grid = position.count;

    for (let i = 0; i < grid; i += 1) {
      const x = position.getX(i);
      const z = position.getZ(i);
      const wave =
        Math.sin(x * frequency + this.time * speed) +
        Math.sin(z * frequency * 0.6 + this.time * speed * 0.8);
      position.setY(i, this.height + wave * amplitude);
    }

    position.needsUpdate = true;
    this.geometry.computeVertexNormals();
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
    this.mesh.removeFromParent();
  }
}