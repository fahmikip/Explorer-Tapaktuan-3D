import * as THREE from "three";
import type { PathConfig, PathDefinition } from "../config/gameConfig";
import type { Disposable } from "../core/types";
import { TerrainSystem } from "./TerrainSystem";

/**
 * Generic exploration paths (dirt trails / coastal walkways) laid on the
 * terrain surface. Purely decorative navigation structure — NOT real roads.
 * Paths follow the terrain height and keep a clear ribbon of their configured width.
 */
export class PathSystem implements Disposable {
  private readonly meshes: THREE.Mesh[] = [];
  private readonly geometries: THREE.BufferGeometry[] = [];
  private readonly materials: THREE.Material[] = [];
  private readonly sampled: { x: number; z: number; halfWidth: number }[][] = [];

  constructor(config: PathConfig, terrain: TerrainSystem) {
    if (!config.enabled) return;

    for (const definition of config.paths) {
      const { mesh, geometry, samples } = this.buildPath(definition, terrain, config);
      this.meshes.push(mesh);
      this.geometries.push(geometry);
      const material = mesh.material;
      if (Array.isArray(material)) {
        this.materials.push(...material);
      } else {
        this.materials.push(material);
      }
      this.sampled.push(samples);
    }
  }

  get pathCount(): number {
    return this.meshes.length;
  }

  /**
   * True when the point lies on any path (within its half-width + margin).
   * Used to keep vegetation and rocks off walkways.
   */
  isOnPath(x: number, z: number, margin: number): boolean {
    for (const samples of this.sampled) {
      const halfWidth = samples.length > 0 ? samples[0].halfWidth : 0;
      const limit = halfWidth + margin;
      const squared = limit * limit;
      for (const point of samples) {
        const dx = x - point.x;
        const dz = z - point.z;
        if (dx * dx + dz * dz <= squared) return true;
      }
    }
    return false;
  }

  update(_deltaTime: number): void {
    // Static system.
  }

  dispose(): void {
    for (const mesh of this.meshes) {
      mesh.removeFromParent();
    }
    for (const geometry of this.geometries) {
      geometry.dispose();
    }
    for (const material of this.materials) {
      material.dispose();
    }
    this.meshes.length = 0;
    this.geometries.length = 0;
    this.materials.length = 0;
    this.sampled.length = 0;
  }

  private buildPath(
    definition: PathDefinition,
    terrain: TerrainSystem,
    config: PathConfig,
  ): {
    mesh: THREE.Mesh;
    geometry: THREE.BufferGeometry;
    samples: { x: number; z: number; halfWidth: number }[];
  } {
    const curve = new THREE.CatmullRomCurve3(
      definition.points.map(([x, z]) => new THREE.Vector3(x, 0, z)),
    );

    const length = Math.max(1, curve.getLength());
    const samples = Math.max(2, Math.ceil(length / config.step));

    const centers: { x: number; z: number }[] = [];
    const lefts: number[] = [];
    const rights: number[] = [];
    const halfWidth = definition.width / 2;

    for (let i = 0; i <= samples; i += 1) {
      const t = i / samples;
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

      const left = new THREE.Vector3().copy(point).addScaledVector(normal, halfWidth);
      const right = new THREE.Vector3().copy(point).addScaledVector(normal, -halfWidth);

      left.y = terrain.getHeightAt(left.x, left.z) + config.heightOffset;
      right.y = terrain.getHeightAt(right.x, right.z) + config.heightOffset;

      lefts.push(left.x, left.y, left.z);
      rights.push(right.x, right.y, right.z);
      centers.push({ x: point.x, z: point.z });
    }

    const verticesPerSide = samples + 1;
    const position = new Float32Array(verticesPerSide * 2 * 3);
    const indices: number[] = [];

    for (let i = 0; i <= samples; i += 1) {
      const base = i * 6;
      position[base] = rights[i * 3];
      position[base + 1] = rights[i * 3 + 1];
      position[base + 2] = rights[i * 3 + 2];
      position[base + 3] = lefts[i * 3];
      position[base + 4] = lefts[i * 3 + 1];
      position[base + 5] = lefts[i * 3 + 2];
    }

    for (let i = 0; i < samples; i += 1) {
      const r0 = i * 2;
      const l0 = i * 2 + 1;
      const r1 = r0 + 2;
      const l1 = l0 + 2;
      indices.push(r0, r1, l0, l0, r1, l1);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      color: definition.color,
      roughness: 1,
      metalness: 0,
    });
    material.polygonOffset = true;
    material.polygonOffsetFactor = 1;
    material.polygonOffsetUnits = 1;

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = `path-${definition.id}`;
    mesh.receiveShadow = true;

    return { mesh, geometry, samples: centers.map((c) => ({ ...c, halfWidth })) };
  }
}