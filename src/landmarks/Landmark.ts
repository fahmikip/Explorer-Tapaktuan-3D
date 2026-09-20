import * as THREE from "three";
import type { Interactable } from "../interaction/Interactable";
import type { LandmarkDefinition, LandmarkType } from "./types";

export type LandmarkMarkerState = "undiscovered" | "nearby" | "discovered";

/** Visual pieces the factory assembles for one landmark. */
export interface LandmarkPieces {
  group: THREE.Group;
  ring: THREE.Mesh;
  icon: THREE.Sprite;
  label: THREE.Sprite | null;
  /** Geometries owned exclusively by this landmark (disposed with it). */
  ownedGeometries: THREE.BufferGeometry[];
  /** Texture owned by this landmark (the name label), if any. */
  ownedTexture: THREE.Texture | null;
}

/**
 * Runtime landmark entity. Owns its world group and interaction behaviors;
 * visual/label state follows the MarkerState. All data comes from the
 * definition — no fabricated content lives here.
 */
export class Landmark implements Interactable {
  readonly definition: LandmarkDefinition;
  readonly group: THREE.Group;
  readonly radius: number;

  private readonly pieces: LandmarkPieces;
  private readonly onInteractHandler: (() => void) | null;
  private readonly ringByState: Record<LandmarkMarkerState, THREE.Material>;
  private readonly iconByState: Record<LandmarkMarkerState, THREE.SpriteMaterial>;

  private discoveredValue = false;
  private stateValue: LandmarkMarkerState = "undiscovered";
  private readonly baseIconY: number;
  private bobClock = 0;

  constructor(
    pieces: LandmarkPieces,
    definition: LandmarkDefinition,
    interactionRadius: number,
    ringByState: Record<LandmarkMarkerState, THREE.Material>,
    iconByState: Record<LandmarkMarkerState, THREE.SpriteMaterial>,
    onInteractHandler: (() => void) | null,
  ) {
    this.pieces = pieces;
    this.group = pieces.group;
    this.definition = definition;
    this.radius = interactionRadius;
    this.ringByState = ringByState;
    this.iconByState = iconByState;
    this.onInteractHandler = onInteractHandler;
    this.baseIconY = pieces.icon.position.y;
  }

  get id(): string {
    return this.definition.id;
  }

  get isDiscovered(): boolean {
    return this.discoveredValue;
  }

  getInteractionPoint(): THREE.Vector3 {
    return this.group.position;
  }

  getInteractionRadius(): number {
    return this.radius;
  }

  canInteract(): boolean {
    return true;
  }

  getInteractionLabel(): string {
    return interactionLabelFor(this.definition.type);
  }

  onInteract(): void {
    this.onInteractHandler?.();
  }

  setDiscovered(discovered: boolean): void {
    if (this.discoveredValue === discovered) return;
    this.discoveredValue = discovered;
    this.applyState();
  }

  setState(state: LandmarkMarkerState, labelVisible: boolean): void {
    this.stateValue = state;
    this.applyState();
    const label = this.pieces.label;
    if (label) label.visible = labelVisible;
  }

  update(deltaTime: number): void {
    this.bobClock += deltaTime;
    this.pieces.icon.position.y =
      this.baseIconY + Math.sin(this.bobClock * 2.2) * 0.08;
  }

  dispose(): void {
    this.pieces.group.removeFromParent();
    for (const geometry of this.pieces.ownedGeometries) {
      geometry.dispose();
    }
    this.pieces.ownedTexture?.dispose();
  }

  private applyState(): void {
    const state = this.discoveredValue ? "discovered" : this.stateValue;
    this.pieces.ring.material = this.ringByState[state];
    this.pieces.icon.material = this.iconByState[state];
  }
}

function interactionLabelFor(type: LandmarkType): string {
  switch (type) {
    case "viewpoint":
      return "Lihat pemandangan";
    case "information":
      return "Baca informasi";
    case "poi":
      return "Periksa poin";
    case "discovery":
      return "Periksa";
    case "landmark":
      return "Periksa landmark";
  }
}