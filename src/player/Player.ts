import * as THREE from "three";
import type { Disposable } from "../core/types";
import type { PlayerConfig } from "./PlayerConfig";
import type { PlayerState } from "./PlayerState";

const PLAYER_COLOR = "#d97b3b";
const PLAYER_NAME = "player";

/**
 * Player entity. Owns the world-space transform (group), the placeholder
 * capsule mesh, and the movement state. Movement logic lives in PlayerController.
 */
export class Player implements Disposable {
  readonly config: PlayerConfig;
  readonly group: THREE.Group;
  readonly horizontalVelocity = new THREE.Vector3();

  private verticalVelocityValue = 0;
  private yawValue = 0;
  private groundedValue = true;
  private movingValue = false;
  private sprintingValue = false;

  constructor(config: PlayerConfig) {
    this.config = config;
    this.group = new THREE.Group();
    this.group.name = PLAYER_NAME;

    const capsule = new THREE.Mesh(
      new THREE.CapsuleGeometry(
        config.capsuleRadius,
        config.capsuleLength,
        6,
        12,
      ),
      new THREE.MeshStandardMaterial({
        color: PLAYER_COLOR,
        roughness: 0.8,
        metalness: 0,
      }),
    );
    capsule.name = "playerCapsule";
    capsule.castShadow = true;
    capsule.receiveShadow = true;
    capsule.position.y =
      config.capsuleRadius + config.capsuleLength / 2;
    this.group.add(capsule);

    this.group.position.set(...config.spawnPosition);
  }

  get position(): THREE.Vector3 {
    return this.group.position;
  }

  get yaw(): number {
    return this.yawValue;
  }

  set yaw(value: number) {
    this.yawValue = normalizeAngle(value);
  }

  get verticalVelocity(): number {
    return this.verticalVelocityValue;
  }

  set verticalVelocity(value: number) {
    this.verticalVelocityValue = value;
  }

  get grounded(): boolean {
    return this.groundedValue;
  }

  set grounded(value: boolean) {
    this.groundedValue = value;
  }

  get isMoving(): boolean {
    return this.movingValue;
  }

  set isMoving(value: boolean) {
    this.movingValue = value;
  }

  get isSprinting(): boolean {
    return this.sprintingValue;
  }

  set isSprinting(value: boolean) {
    this.sprintingValue = value;
  }

  /**
   * Copies the current state into the provided object (avoids per-frame alloc).
   */
  snapshot(out: PlayerState): void {
    const position = this.group.position;
    out.position.x = position.x;
    out.position.y = position.y;
    out.position.z = position.z;

    out.velocity.x = this.horizontalVelocity.x;
    out.velocity.y = this.verticalVelocity;
    out.velocity.z = this.horizontalVelocity.z;

    out.grounded = this.grounded;
    out.isMoving = this.isMoving;
    out.isSprinting = this.isSprinting;
    out.yaw = this.yaw;
  }

  dispose(): void {
    this.group.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.geometry.dispose();
      if (Array.isArray(object.material)) {
        for (const material of object.material) material.dispose();
      } else {
        object.material.dispose();
      }
    });
    this.group.removeFromParent();
  }
}

function normalizeAngle(angle: number): number {
  let result = angle % (Math.PI * 2);
  if (result > Math.PI) result -= Math.PI * 2;
  if (result < -Math.PI) result += Math.PI * 2;
  return result;
}