import * as THREE from "three";
import type { CameraConfig } from "../config/gameConfig";
import type { Disposable } from "../core/types";

/**
 * Owns the main PerspectiveCamera.
 * Supports configurable FOV/near/far, aspect updates on resize,
 * and will later expose a target to follow the player.
 */
export class CameraManager implements Disposable {
  private readonly camera: THREE.PerspectiveCamera;

  constructor(config: CameraConfig) {
    this.camera = new THREE.PerspectiveCamera(
      config.fov,
      1,
      config.near,
      config.far,
    );
    this.camera.position.set(...config.position);
    this.camera.lookAt(new THREE.Vector3(...config.lookAt));
  }

  get activeCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  updateAspect(width: number, height: number): void {
    if (width <= 0 || height <= 0) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  dispose(): void {
    // No GPU resources owned by the camera; nothing to free yet.
  }
}