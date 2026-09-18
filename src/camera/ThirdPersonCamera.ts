import * as THREE from "three";
import type { ThirdPersonCameraConfig } from "../config/gameConfig";
import type { Disposable } from "../core/types";

/**
 * Smooth third-person follow camera with pointer/touch orbit.
 * Camera orbits the target on a sphere of `distance` radius and always
 * looks back at the target (player).
 */
export class ThirdPersonCamera implements Disposable {
  private readonly canvas: HTMLCanvasElement;
  private readonly config: ThirdPersonCameraConfig;
  private target: THREE.Object3D | null = null;

  private yaw: number;
  private pitch: number;

  private readonly desired = new THREE.Vector3();
  private readonly smoothed = new THREE.Vector3();
  private readonly lookTarget = new THREE.Vector3();

  private dragging = false;
  private lastPointerX = 0;
  private lastPointerY = 0;

  constructor(
    private readonly camera: THREE.PerspectiveCamera,
    config: ThirdPersonCameraConfig,
    canvas: HTMLCanvasElement,
  ) {
    this.config = config;
    this.canvas = canvas;

    this.yaw = config.defaultYaw;
    this.pitch = Math.atan2(config.height, config.distance);
    this.smoothed.copy(this.camera.position);

    if (config.orbitEnabled) {
      canvas.addEventListener("pointerdown", this.handlePointerDown);
      canvas.addEventListener("pointermove", this.handlePointerMove);
      canvas.addEventListener("pointerup", this.handlePointerEnd);
      canvas.addEventListener("pointercancel", this.handlePointerEnd);
    }
  }

  setTarget(target: THREE.Object3D): void {
    this.target = target;
    this.snap();
  }

  /**
   * Teleports the camera to its ideal position (used at init to avoid
   * a long lerp across the scene).
   */
  snap(): void {
    if (!this.target) return;
    this.computeLookTarget();
    this.computeDesiredPosition();
    this.smoothed.copy(this.desired);
    this.camera.position.copy(this.smoothed);
    this.camera.lookAt(this.lookTarget);
  }

  update(deltaTime: number): void {
    if (!this.target) return;

    this.computeLookTarget();
    this.computeDesiredPosition();

    const blend = 1 - Math.exp(-this.config.smoothness * deltaTime);
    this.smoothed.lerp(this.desired, blend);
    this.camera.position.copy(this.smoothed);
    this.camera.lookAt(this.lookTarget);
  }

  dispose(): void {
    if (!this.config.orbitEnabled) return;
    this.canvas.removeEventListener("pointerdown", this.handlePointerDown);
    this.canvas.removeEventListener("pointermove", this.handlePointerMove);
    this.canvas.removeEventListener("pointerup", this.handlePointerEnd);
    this.canvas.removeEventListener("pointercancel", this.handlePointerEnd);
  }

  private computeLookTarget(): void {
    this.lookTarget.set(
      this.target!.position.x,
      this.target!.position.y + this.config.lookAtHeight,
      this.target!.position.z,
    );
  }

  private computeDesiredPosition(): void {
    const cosPitch = Math.cos(this.pitch);
    const sinPitch = Math.sin(this.pitch);
    const dx = Math.sin(this.yaw) * cosPitch;
    const dy = sinPitch;
    const dz = Math.cos(this.yaw) * cosPitch;

    this.desired.set(
      this.lookTarget.x + dx * this.config.distance,
      this.lookTarget.y + dy * this.config.distance,
      this.lookTarget.z + dz * this.config.distance,
    );
  }

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    this.dragging = true;
    this.lastPointerX = event.clientX;
    this.lastPointerY = event.clientY;
    try {
      this.canvas.setPointerCapture(event.pointerId);
    } catch {
      // Capture failure should not break dragging.
    }
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    if (!this.dragging) return;

    const dx = event.clientX - this.lastPointerX;
    const dy = event.clientY - this.lastPointerY;
    this.lastPointerX = event.clientX;
    this.lastPointerY = event.clientY;

    this.yaw -= dx * this.config.orbitSensitivity;
    this.pitch = THREE.MathUtils.clamp(
      this.pitch + dy * this.config.orbitSensitivity,
      this.config.minPitch,
      this.config.maxPitch,
    );
  };

  private readonly handlePointerEnd = (event: PointerEvent): void => {
    this.dragging = false;
    try {
      if (this.canvas.hasPointerCapture(event.pointerId)) {
        this.canvas.releasePointerCapture(event.pointerId);
      }
    } catch {
      // Release failure is safe to ignore.
    }
  };
}