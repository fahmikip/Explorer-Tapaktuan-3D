import * as THREE from "three";
import type { Disposable } from "./types";

/**
 * Manages the active scene graph and safe object add/remove/cleanup.
 * A single scene is sufficient for now; scene transitions are a later concern.
 */
export class SceneManager implements Disposable {
  private readonly scene: THREE.Scene;

  constructor() {
    this.scene = new THREE.Scene();
  }

  get activeScene(): THREE.Scene {
    return this.scene;
  }

  add(object: THREE.Object3D): void {
    this.scene.add(object);
  }

  remove(object: THREE.Object3D): void {
    this.scene.remove(object);
  }

  /**
   * Release GPU resources owned by the current scene graph.
   */
  dispose(): void {
    this.scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh) return;

      mesh.geometry.dispose();

      const material = mesh.material;
      if (Array.isArray(material)) {
        for (const entry of material) entry.dispose();
      } else if (material) {
        material.dispose();
      }
    });

    this.scene.clear();
  }
}