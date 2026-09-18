import * as THREE from "three";
import type { WorldConfig } from "../config/gameConfig";
import type { Disposable } from "../core/types";

/**
 * Placeholder ground: a flat plane usable as a collision surface.
 * Intended to be replaced by phase-specific terrain later.
 */
export class Ground implements Disposable {
  readonly mesh: THREE.Mesh;

  constructor(config: WorldConfig) {
    this.mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(config.width, config.depth),
      new THREE.MeshStandardMaterial({
        color: config.ground.color,
        roughness: config.ground.roughness,
        metalness: config.ground.metalness,
      }),
    );
    this.mesh.name = "ground";
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.position.y = config.groundHeight;
    this.mesh.receiveShadow = true;
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    const material = this.mesh.material;
    if (Array.isArray(material)) {
      for (const entry of material) entry.dispose();
    } else {
      material.dispose();
    }
    this.mesh.removeFromParent();
  }
}