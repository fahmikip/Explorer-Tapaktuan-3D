import * as THREE from "three";
import type { RockConfig } from "../config/gameConfig";
import type { Disposable } from "../core/types";
import { createSeededRandom, lerp } from "./DeterministicRandom";
import { OceanSystem } from "./OceanSystem";
import { PathSystem } from "./PathSystem";
import { TerrainSystem } from "./TerrainSystem";
import { WorldBounds } from "./WorldBounds";

/**
 * Instanced low-poly rocks. A single merged geometry with per-instance color
 * variation (small palette). Placement is deterministic by seed.
 */
export class RockSystem implements Disposable {
  private readonly meshObject: THREE.InstancedMesh;
  private readonly geometry: THREE.BufferGeometry;
  private readonly material: THREE.MeshStandardMaterial;
  private instanceCountValue = 0;

  constructor(
    config: RockConfig,
    terrain: TerrainSystem,
    ocean: OceanSystem,
    paths: PathSystem,
    bounds: WorldBounds,
    seed: number,
    qualityMultiplier: number,
  ) {
    const geometry = buildRockGeometry();
    const material = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 0.95,
      metalness: 0,
    });

    const area =
      (bounds.maxX - bounds.minX) * (bounds.maxZ - bounds.minZ);
    const planned = config.enabled
      ? Math.max(0, Math.round(config.density * area * qualityMultiplier))
      : 0;

    const mesh = new THREE.InstancedMesh(geometry, material, planned);
    mesh.name = "rocks";
    mesh.receiveShadow = true;
    mesh.castShadow = false;

    const rng = createSeededRandom(seed + 404);
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const euler = new THREE.Euler();
    const palette = new THREE.Color();

    let placed = 0;
    const maxAttempts = planned * 20 + 500;
    for (let attempt = 0; attempt < maxAttempts && placed < planned; attempt += 1) {
      const x = lerp(bounds.minX, bounds.maxX, rng());
      const z = lerp(bounds.minZ, bounds.maxZ, rng());
      const height = terrain.getHeightAt(x, z);

      if (height < ocean.height + config.waterMargin) continue;
      if (terrain.getSlopeAt(x, z) > config.slopeLimit) continue;
      if (paths.isOnPath(x, z, config.pathClearance)) continue;

      position.set(x, height, z);
      euler.set(
        (rng() - 0.5) * 1.2,
        rng() * Math.PI * 2,
        (rng() - 0.5) * 1.2,
      );
      quaternion.setFromEuler(euler);
      const size = lerp(config.scaleMin, config.scaleMax, rng());
      scale.set(
        size * (0.8 + rng() * 0.4),
        size * (0.6 + rng() * 0.5),
        size * (0.8 + rng() * 0.4),
      );
      matrix.compose(position, quaternion, scale);
      mesh.setMatrixAt(placed, matrix);

      palette.set(
        config.colors[
          Math.floor(rng() * config.colors.length) %
            config.colors.length
        ],
      );
      mesh.setColorAt(placed, palette);
      placed += 1;
    }

    mesh.count = placed;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    this.meshObject = mesh;
    this.geometry = geometry;
    this.material = material;
    this.instanceCountValue = placed;
  }

  get mesh(): THREE.InstancedMesh {
    return this.meshObject;
  }

  get instanceCount(): number {
    return this.instanceCountValue;
  }

  update(_deltaTime: number): void {
    // Static system.
  }

  dispose(): void {
    this.meshObject.removeFromParent();
    this.geometry.dispose();
    this.material.dispose();
  }
}

function buildRockGeometry(): THREE.BufferGeometry {
  return new THREE.IcosahedronGeometry(0.8, 0);
}