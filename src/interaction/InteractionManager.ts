import type { Disposable } from "../core/types";
import type { Interactable } from "./Interactable";

export interface InteractionManagerOptions {
  /** Fired only when the active target changes to a different object. */
  onTargetChange?: (target: Interactable | null) => void;
}

/**
 * Generic nearby-interactable detector. Tracks registered Interactables,
 * each frame picks the nearest one within its own radius, and converts a
 * fresh interact press (edge) into onInteract(). Press-edge handling mirrors
 * the PlayerController jump pattern (consumed until released).
 *
 * Uses squared distances — no per-frame sqrt.
 */
export class InteractionManager implements Disposable {
  private readonly targets = new Map<string, Interactable>();
  private readonly options: InteractionManagerOptions;

  private currentTargetValue: Interactable | null = null;
  private interactConsumed = false;

  constructor(options: InteractionManagerOptions = {}) {
    this.options = options;
  }

  get currentTarget(): Interactable | null {
    return this.currentTargetValue;
  }

  add(target: Interactable): void {
    this.targets.set(target.id, target);
  }

  remove(id: string): void {
    this.targets.delete(id);
    if (this.currentTargetValue?.id === id) {
      this.setCurrentTarget(null);
    }
  }

  clear(): void {
    this.targets.clear();
    this.setCurrentTarget(null);
  }

  update(
    hasInteractInput: boolean,
    interactAllowed: boolean,
    playerX: number,
    playerZ: number,
  ): void {
    let nearest: Interactable | null = null;
    let nearestSquared = Infinity;

    for (const target of this.targets.values()) {
      if (!target.canInteract()) continue;
      const point = target.getInteractionPoint();
      const dx = point.x - playerX;
      const dz = point.z - playerZ;
      const distanceSquared = dx * dx + dz * dz;
      const radiusSquared = target.getInteractionRadius() ** 2;
      if (distanceSquared <= radiusSquared && distanceSquared < nearestSquared) {
        nearest = target;
        nearestSquared = distanceSquared;
      }
    }

    if (nearest?.id !== this.currentTargetValue?.id) {
      this.setCurrentTarget(nearest);
    }

    if (hasInteractInput && interactAllowed && !this.interactConsumed) {
      this.interactConsumed = true;
      this.currentTargetValue?.onInteract();
    }
    if (!hasInteractInput) {
      this.interactConsumed = false;
    }
  }

  dispose(): void {
    this.clear();
  }

  private setCurrentTarget(target: Interactable | null): void {
    this.currentTargetValue = target;
    this.options.onTargetChange?.(target);
  }
}