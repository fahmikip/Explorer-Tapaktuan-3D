import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type {
  VegetationConfig,
  VegetationTypeConfig,
} from "../config/gameConfig";
import type { Disposable } from "../core/types";
import { createSeededRandom, lerp } from "./DeterministicRandom";
import { OceanSystem } from "./OceanSystem";
import { PathSystem } from "./PathSystem";
import { TerrainSystem } from "./TerrainSystem";
import { WorldBounds } from "./WorldBounds";

/**
 * Instanced placeholder vegetation (palms, bushes, grass tufts).
 * Each type renders through a single InstancedMesh sharing one merged geometry
 * and one material (vertex colors baked in). Placement is fully deterministic.
 */
export class VegetationSystem implements Disposable {
  private readonly meshesList: THREE.InstancedMesh[] = [];
  private readonly geometries: THREE.BufferGeometry[] = [];
  private readonly materials: THREE.Material[] = [];
  private totalInstances = 0;

  constructor(
    config: VegetationConfig,
    terrain: TerrainSystem,
    ocean: OceanSystem,
    paths: PathSystem,
    bounds: WorldBounds,
    seed: number,
    qualityMultiplier: number,
  ) {
    if (!config.enabled) return;

    const area =
      (bounds.maxX - bounds.minX) * (bounds.maxZ - bounds.minZ);
    const waterMargin = config.waterMargin;

    this.meshesList.push(
      this.plant(
        config.palm,
        "palm",
        () => buildPalmGeometry(config.colors.trunk, config.colors.leaf),
        terrain,
        ocean,
        paths,
        bounds,
        waterMargin,
        seed + 101,
        area,
        qualityMultiplier,
      ),
    );
    this.meshesList.push(
      this.plant(
        config.bush,
        "bush",
        () => buildBushGeometry(config.colors.bush),
        terrain,
        ocean,
        paths,
        bounds,
        waterMargin,
        seed + 202,
        area,
        qualityMultiplier,
      ),
    );
    this.meshesList.push(
      this.plant(
        config.grass,
        "grass",
        () => buildGrassGeometry(config.colors.grass),
        terrain,
        ocean,
        paths,
        bounds,
        waterMargin,
        seed + 303,
        area,
        qualityMultiplier,
      ),
    );
  }

  get meshes(): readonly THREE.InstancedMesh[] {
    return this.meshesList;
  }

  get instanceCount(): number {
    return this.totalInstances;
  }

  update(_deltaTime: number): void {
    // Static system; nothing to animate.
  }

  dispose(): void {
    for (const mesh of this.meshesList) {
      mesh.removeFromParent();
    }
    for (const geometry of this.geometries) {
      geometry.dispose();
    }
    for (const material of this.materials) {
      material.dispose();
    }
    this.meshesList.length = 0;
    this.geometries.length = 0;
    this.materials.length = 0;
  }

  private plant(
    type: VegetationTypeConfig,
    name: string,
    build: () => THREE.BufferGeometry,
    terrain: TerrainSystem,
    ocean: OceanSystem,
    paths: PathSystem,
    bounds: WorldBounds,
    waterMargin: number,
    seed: number,
    area: number,
    qualityMultiplier: number,
  ): THREE.InstancedMesh {
    if (!type.enabled) return this.emptyMesh(name);

    const geometry = build();

    const material = new THREE.MeshStandardMaterial({
      roughness: 0.9,
      metalness: 0,
      vertexColors: true,
    });

    const planned = Math.max(
      0,
      Math.round(type.density * area * qualityMultiplier),
    );
    const mesh = new THREE.InstancedMesh(geometry, material, planned);
    mesh.name = name;

    const rng = createSeededRandom(seed);
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const euler = new THREE.Euler();

    let placed = 0;
    const maxAttempts = planned * 20 + 500;
    for (let attempt = 0; attempt < maxAttempts && placed < planned; attempt += 1) {
      const x = lerp(bounds.minX, bounds.maxX, rng());
      const z = lerp(bounds.minZ, bounds.maxZ, rng());
      const height = terrain.getHeightAt(x, z);

      if (height < ocean.height + waterMargin) continue;
      if (height < type.minHeight || height > type.maxHeight) continue;
      if (terrain.getSlopeAt(x, z) > type.slopeLimit) continue;
      if (paths.isOnPath(x, z, type.pathClearance)) continue;

      position.set(x, height, z);
      euler.set(
        (rng() - 0.5) * 0.12,
        rng() * Math.PI * 2,
        (rng() - 0.5) * 0.12,
      );
      quaternion.setFromEuler(euler);
      const size = lerp(type.scaleMin, type.scaleMax, rng());
      scale.set(size, size, size);
      matrix.compose(position, quaternion, scale);
      mesh.setMatrixAt(placed, matrix);
      placed += 1;
    }

    mesh.count = placed;
    mesh.instanceMatrix.needsUpdate = true;
    mesh.receiveShadow = true;
    mesh.castShadow = false;

    this.geometries.push(geometry);
    this.materials.push(material);
    this.totalInstances += placed;
    return mesh;
  }

  private emptyMesh(name: string): THREE.InstancedMesh {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.MeshBasicMaterial();
    this.geometries.push(geometry);
    this.materials.push(material);
    const mesh = new THREE.InstancedMesh(geometry, material, 0);
    mesh.name = name;
    return mesh;
  }
}

function buildPalmGeometry(trunkColor: string, leafColor: string): THREE.BufferGeometry {
  const trunk = new THREE.CylinderGeometry(0.1, 0.18, 1.6, 5, 1);
  trunk.translate(0, 0.8, 0);
  applyColor(trunk, trunkColor);

  const pieces: THREE.BufferGeometry[] = [trunk];
  const leafCount = 6;
  for (let k = 0; k < leafCount; k += 1) {
    const leaf = new THREE.PlaneGeometry(1.2, 0.35);
    leaf.rotateZ(-Math.PI / 2 + 0.3);
    leaf.translate(0.15, 1.5, 0);
    const spoke = new THREE.Matrix4().makeRotationY((k / leafCount) * Math.PI * 2);
    leaf.applyMatrix4(spoke);
    applyColor(leaf, leafColor);
    pieces.push(leaf);
  }

  return nonNull(mergeGeometries(pieces, false));
}

function buildBushGeometry(color: string): THREE.BufferGeometry {
  const bush = new THREE.IcosahedronGeometry(0.5, 0);
  bush.scale(1, 0.6, 1);
  applyColor(bush, color);
  return bush;
}

function buildGrassGeometry(color: string): THREE.BufferGeometry {
  const pieces: THREE.BufferGeometry[] = [];
  const bladeCount = 5;
  for (let k = 0; k < bladeCount; k += 1) {
    const blade = new THREE.PlaneGeometry(0.14, 0.55);
    blade.translate(0, 0.275, 0);
    const spoke = new THREE.Matrix4().makeRotationY((k / bladeCount) * Math.PI);
    blade.applyMatrix4(spoke);
    applyColor(blade, color);
    pieces.push(blade);
  }
  return nonNull(mergeGeometries(pieces, false));
}

function applyColor(geometry: THREE.BufferGeometry, hex: string): void {
  const color = new THREE.Color(hex);
  const position = geometry.getAttribute("position") as THREE.BufferAttribute;
  const attribute = new THREE.BufferAttribute(
    new Float32Array(position.count * 3),
    3,
  );
  for (let i = 0; i < position.count; i += 1) {
    attribute.setXYZ(i, color.r, color.g, color.b);
  }
  geometry.setAttribute("color", attribute);
}

function nonNull<T>(value: T | null): T {
  if (!value) throw new Error("Failed to merge placeholder geometry.");
  return value;
}