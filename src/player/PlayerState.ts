export interface Vec3Tuple {
  x: number;
  y: number;
  z: number;
}

/**
 * Read-only gameplay snapshot of the player for debug/telemetry.
 */
export interface PlayerState {
  position: Vec3Tuple;
  velocity: Vec3Tuple;
  grounded: boolean;
  isMoving: boolean;
  isSprinting: boolean;
  yaw: number;
}