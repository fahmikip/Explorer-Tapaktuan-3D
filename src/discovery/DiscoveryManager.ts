import type { Disposable } from "../core/types";
import type { EventBus } from "../core/EventBus";
import type { DiscoveryStorage } from "./DiscoveryStorage";

/**
 * Tracks which landmark IDs have been discovered. State is stored separately
 * from the visual/runtime layer and persisted through the DiscoveryStorage
 * abstraction. Emits "landmark:discovered" only on first discovery.
 */
export class DiscoveryManager implements Disposable {
  private readonly discovered = new Set<string>();

  constructor(
    private readonly eventBus: EventBus,
    private readonly storage: DiscoveryStorage,
  ) {
    for (const id of storage.load()) {
      this.discovered.add(id);
    }
  }

  isDiscovered(id: string): boolean {
    return this.discovered.has(id);
  }

  getDiscoveredIds(): readonly string[] {
    return Array.from(this.discovered);
  }

  get count(): number {
    return this.discovered.size;
  }

  /**
   * Marks discovered once. Returns true when the state actually changed.
   */
  discover(id: string): boolean {
    if (this.discovered.has(id)) return false;
    this.discovered.add(id);
    this.persist();
    this.eventBus.emit("landmark:discovered", { landmarkId: id });
    return true;
  }

  dispose(): void {
    this.persist();
  }

  private persist(): void {
    this.storage.store(this.getDiscoveredIds());
  }
}