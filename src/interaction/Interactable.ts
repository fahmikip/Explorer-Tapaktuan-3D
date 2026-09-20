import * as THREE from "three";

/**
 * Anything the player can approach and trigger (landmarks now; NPCs, signs,
 * quest objects, collectibles later). Generic — no domain data here.
 */
export interface Interactable {
  readonly id: string;

  /** World-space point used for distance checks. */
  getInteractionPoint(): THREE.Vector3;

  /** Reach radius in meters for the location read by this phase. */
  getInteractionRadius(): number;

  /** Whether interaction is allowed right now. */
  canInteract(): boolean;

  /** Short action label for the interaction hint, if present. */
  getInteractionLabel?(): string;

  /** Called exactly once per press when the target is active. */
  onInteract(): void;
}