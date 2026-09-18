/**
 * Tunable player parameters. Values live in gameConfig.player.
 */
export interface PlayerConfig {
  capsuleRadius: number;
  capsuleLength: number;
  moveSpeed: number;
  sprintMultiplier: number;
  acceleration: number;
  deceleration: number;
  rotationSpeed: number;
  gravity: number;
  jumpForce: number;
  spawnPosition: readonly [number, number, number];
}