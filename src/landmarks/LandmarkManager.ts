import type { Disposable } from "../core/types";
import type { EventBus } from "../core/EventBus";
import { Landmark } from "./Landmark";
import type { LandmarkMarkerState, LandmarkPieces } from "./Landmark";
import { LandmarkFactory } from "./LandmarkFactory";
import { LandmarkRegistry } from "./LandmarkRegistry";
import type { InteractionManager } from "../interaction/InteractionManager";
import type { DiscoveryManager } from "../discovery/DiscoveryManager";
import type { WorldManager } from "../world/WorldManager";

export interface LandmarkManagerOptions {
  registry: LandmarkRegistry;
  factory: LandmarkFactory;
  interaction: InteractionManager;
  discovery: DiscoveryManager;
  eventBus: EventBus;
  world: WorldManager;
  defaultInteractionRadius: number;
  /** Configuration ground offset for the world terrain. */
  groundOffset: number;
  /** Whether test data may render this session (dev gate only). */
  allowTestData: boolean;
  /** Always show name labels (debug convenience). */
  showLabels: boolean;
}

/**
 * Spawns the selected landmark set into the world, keeps their marker state in
 * sync with the shared interaction target reader, forwards interactions to
 * discovery + event bus, and cleans up everything on dispose.
 */
export class LandmarkManager implements Disposable {
  private readonly options: LandmarkManagerOptions;
  private readonly landmarks: Landmark[] = [];
  private disposed = false;

  private readonly onDiscovered = (payload: { landmarkId: string }): void => {
    const landmark = this.find(payload.landmarkId);
    if (landmark) landmark.setDiscovered(true);
  };

  constructor(options: LandmarkManagerOptions) {
    this.options = options;
    this.spawn();
    options.eventBus.on("landmark:discovered", this.onDiscovered);
  }

  get visibleCount(): number {
    return this.landmarks.length;
  }

  /** Interaction state is driven ONCE per frame by the composition root; the
   *  manager only reads the current target to sync its marker visuals. */
  update(deltaTime: number): void {
    const currentTargetId = this.options.interaction.currentTarget?.id ?? null;

    for (const landmark of this.landmarks) {
      landmark.update(deltaTime);
      const state: LandmarkMarkerState =
        landmark.id === currentTargetId ? "nearby" : "undiscovered";
      const labelVisible =
        this.options.showLabels || landmark.id === currentTargetId;
      landmark.setState(state, labelVisible);
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.options.eventBus.off("landmark:discovered", this.onDiscovered);
    for (const landmark of this.landmarks) {
      this.options.interaction.remove(landmark.id);
      this.options.world.remove(landmark.group);
      landmark.dispose();
    }
    this.landmarks.length = 0;
  }

  private spawn(): void {
    const { options } = this;
    const definitions = options.registry.selectVisible(options.allowTestData);

    for (const definition of definitions) {
      const baseY =
        (definition.position.y ??
          options.world.getHeightAt(definition.position.x, definition.position.z)) +
        (definition.groundOffset ?? options.groundOffset);

      const pieces: LandmarkPieces = options.factory.create(definition, baseY);
      const radius =
        definition.interactionRadius ?? options.defaultInteractionRadius;

      const landmark = new Landmark(
        pieces,
        definition,
        radius,
        options.factory.markerRingMaterials,
        options.factory.markerIconMaterials,
        () => this.handleInteract(definition.id),
      );

      landmark.setDiscovered(options.discovery.isDiscovered(definition.id));
      options.world.add(landmark.group);
      options.interaction.add(landmark);
      this.landmarks.push(landmark);
    }
  }

  private find(id: string): Landmark | undefined {
    for (const landmark of this.landmarks) {
      if (landmark.id === id) return landmark;
    }
    return undefined;
  }

  private handleInteract(landmarkId: string): void {
    this.options.eventBus.emit("landmark:interacted", { landmarkId });
    this.options.discovery.discover(landmarkId);
  }
}