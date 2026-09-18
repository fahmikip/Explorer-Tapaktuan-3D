import * as THREE from "three";
import type { WorldBoundsConfig } from "../config/gameConfig";
import type { Disposable } from "../core/types";

/**
 * Rectangular horizontal play area. Clamps player motion to keep it in-world.
 */
export class WorldBounds implements Disposable {
  constructor(private readonly config: WorldBoundsConfig) {
    if (config.minX >= config.maxX || config.minZ >= config.maxZ) {
      throw new Error(
        `Invalid world bounds: minX/maxX=${config.minX}/${config.maxX}, minZ/maxZ=${config.minZ}/${config.maxZ}`,
      );
    }
  }

  get minX(): number {
    return this.config.minX;
  }

  get maxX(): number {
    return this.config.maxX;
  }

  get minZ(): number {
    return this.config.minZ;
  }

  get maxZ(): number {
    return this.config.maxZ;
  }

  contains(x: number, z: number): boolean {
    return x >= this.minX && x <= this.maxX && z >= this.minZ && z <= this.maxZ;
  }

  /**
   * Moves the given position inside the play area (if outside).
   */
  clampPosition(position: THREE.Vector3): void {
    position.x = THREE.MathUtils.clamp(position.x, this.minX, this.maxX);
    position.z = THREE.MathUtils.clamp(position.z, this.minZ, this.maxZ);
  }

  dispose(): void {
    // No resources owned by the bounds itself.
  }
}