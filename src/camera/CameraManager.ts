import * as THREE from "three";
import type { CameraConfig } from "../config/gameConfig";
import type { Disposable } from "../core/types";
import { ThirdPersonCamera } from "./ThirdPersonCamera";

/**
 * Owns the main PerspectiveCamera and the third-person follow behavior.
 * Exposes aspect updates for resize handling.
 */
export class CameraManager implements Disposable {
  private readonly camera: THREE.PerspectiveCamera;
  private readonly thirdPerson: ThirdPersonCamera;

  constructor(config: CameraConfig, canvas: HTMLCanvasElement) {
    this.camera = new THREE.PerspectiveCamera(
      config.fov,
      1,
      config.near,
      config.far,
    );
    this.thirdPerson = new ThirdPersonCamera(this.camera, config.thirdPerson, canvas);
  }

  get activeCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  setTarget(target: THREE.Object3D): void {
    this.thirdPerson.setTarget(target);
  }

  update(deltaTime: number): void {
    this.thirdPerson.update(deltaTime);
  }

  updateAspect(width: number, height: number): void {
    if (width <= 0 || height <= 0) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  dispose(): void {
    this.thirdPerson.dispose();
  }
}