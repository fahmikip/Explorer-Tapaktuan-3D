import * as THREE from "three";
import type { Interactable } from "../interaction/Interactable";
import type { NPCDefinition, NPCState } from "./types";

/**
 * Visual pieces a factory assembles for one NPC. All materials/geometries here
 * are shared with other NPCs (owned by the factory) — an NPC owns nothing.
 */
export interface NPCPieces {
  group: THREE.Group;
  /** Root of the idle bob animation. */
  bobRoot: THREE.Group;
}

/**
 * Runtime NPC entity. Implements the generic Interactable contract; carries no
 * dialogue content — on interaction it only emits "npc:interacted" (the
 * dialogue engine is started by the composition root).
 */
export class NPC implements Interactable {
  readonly definition: NPCDefinition;
  readonly group: THREE.Group;
  readonly radius: number;

  private readonly bobRoot: THREE.Group;
  private readonly onInteractHandler: (() => void) | null;
  private stateValue: NPCState = "idle";
  private bobClock = 0;

  constructor(
    pieces: NPCPieces,
    definition: NPCDefinition,
    interactionRadius: number,
    onInteractHandler: (() => void) | null,
  ) {
    this.group = pieces.group;
    this.bobRoot = pieces.bobRoot;
    this.definition = definition;
    this.radius = interactionRadius;
    this.onInteractHandler = onInteractHandler;
    if (definition.rotationY !== undefined) {
      this.group.rotation.y = definition.rotationY;
    }
  }

  get id(): string {
    return this.definition.id;
  }

  get state(): NPCState {
    return this.stateValue;
  }

  getInteractionPoint(): THREE.Vector3 {
    return this.group.position;
  }

  getInteractionRadius(): number {
    return this.radius;
  }

  canInteract(): boolean {
    return this.stateValue !== "disabled";
  }

  getInteractionLabel(): string {
    return `Bicara dengan ${this.definition.name}`;
  }

  onInteract(): void {
    this.onInteractHandler?.();
  }

  setState(state: NPCState): void {
    this.stateValue = state;
  }

  update(deltaTime: number): void {
    this.bobClock += deltaTime;
    const speed = this.stateValue === "talking" ? 1.4 : 2.2;
    const amplitude = this.stateValue === "talking" ? 0.02 : 0.06;
    this.bobRoot.position.y = Math.sin(this.bobClock * speed) * amplitude;
  }

  dispose(): void {
    this.group.removeFromParent();
  }
}