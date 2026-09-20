import * as THREE from "three";
import type { Disposable } from "../core/types";
import type { InputState } from "../input/InputState";
import { Player } from "./Player";
import { WorldBounds } from "../world/WorldBounds";

export interface PlayerControllerOptions {
  groundHeightAt: (x: number, z: number) => number;
  onJump?: () => void;
}

const UP = new THREE.Vector3(0, 1, 0);

/**
 * Translates InputState into player movement: camera-relative direction,
 * frame-rate-independent acceleration/deceleration, smooth rotation,
 * gravity, jump, ground collision, and world-bound clamping.
 */
export class PlayerController implements Disposable {
  private readonly forward = new THREE.Vector3();
  private readonly right = new THREE.Vector3();
  private readonly desired = new THREE.Vector3();
  private readonly targetVelocity = new THREE.Vector3();
  private readonly up = UP.clone();

  private jumpConsumed = false;

  constructor(
    private readonly player: Player,
    private readonly camera: THREE.Camera,
    private readonly bounds: WorldBounds,
    private readonly options: PlayerControllerOptions,
  ) {}

  update(deltaTime: number, input: InputState): void {
    const config = this.player.config;

    this.camera.getWorldDirection(this.forward);
    this.forward.y = 0;
    if (this.forward.lengthSq() > 1e-6) {
      this.forward.normalize();
    } else {
      this.forward.set(0, 0, 1);
    }
    this.right.crossVectors(this.up, this.forward);

    this.desired.set(0, 0, 0);
    this.desired.addScaledVector(this.forward, input.moveZ);
    this.desired.addScaledVector(this.right, input.moveX);

    const hasMoveInput = this.desired.lengthSq() > 1e-6;
    if (hasMoveInput) this.desired.normalize();

    const maxSpeed = input.sprint
      ? config.moveSpeed * config.sprintMultiplier
      : config.moveSpeed;
    const rate = hasMoveInput ? config.acceleration : config.deceleration;
    const blend = 1 - Math.exp(-rate * deltaTime);

    this.targetVelocity.copy(this.desired).multiplyScalar(maxSpeed);
    this.player.horizontalVelocity.lerp(this.targetVelocity, blend);

    const horizontalSpeed = Math.hypot(
      this.player.horizontalVelocity.x,
      this.player.horizontalVelocity.z,
    );

    if (hasMoveInput && horizontalSpeed > 0.01) {
      const targetYaw = Math.atan2(
        this.player.horizontalVelocity.x,
        this.player.horizontalVelocity.z,
      );
      const yawBlend = 1 - Math.exp(-config.rotationSpeed * deltaTime);
      this.player.yaw = lerpAngle(this.player.yaw, targetYaw, yawBlend);
    }

    const wantJump = input.jump && !this.jumpConsumed;
    if (wantJump && this.player.grounded) {
      this.player.verticalVelocity = config.jumpForce;
      this.player.grounded = false;
      this.jumpConsumed = true;
      this.options.onJump?.();
    }
    if (!input.jump) this.jumpConsumed = false;

    if (!this.player.grounded) {
      this.player.verticalVelocity -= config.gravity * deltaTime;
    }

    const position = this.player.position;
    position.x += this.player.horizontalVelocity.x * deltaTime;
    position.z += this.player.horizontalVelocity.z * deltaTime;
    position.y += this.player.verticalVelocity * deltaTime;

    const groundY = this.options.groundHeightAt(position.x, position.z);
    if (position.y <= groundY) {
      position.y = groundY;
      this.player.verticalVelocity = 0;
      this.player.grounded = true;
    }

    this.bounds.clampPosition(position);
    this.player.group.rotation.y = this.player.yaw;

    this.player.isMoving = hasMoveInput && horizontalSpeed > 0.05;
    this.player.isSprinting = input.sprint && this.player.isMoving;
  }

  dispose(): void {
    // No listeners or resources owned by the controller.
  }
}

function lerpAngle(current: number, target: number, t: number): number {
  const delta = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + delta * t;
}