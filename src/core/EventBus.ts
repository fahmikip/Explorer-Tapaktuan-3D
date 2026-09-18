import type { Disposable, GameEventMap } from "./types";

type Listener<K extends keyof GameEventMap> = (payload: GameEventMap[K]) => void;

type ListenerMap = {
  [K in keyof GameEventMap]?: Set<(payload: GameEventMap[K]) => void>;
};

/**
 * Small typed publish/subscribe mechanism.
 * Used for cross-system notifications only; prefer direct dependencies
 * for regular function calls.
 */
export class EventBus implements Disposable {
  private readonly listeners: ListenerMap = {};

  on<K extends keyof GameEventMap>(topic: K, listener: Listener<K>): void {
    const set = this.listeners[topic] as Set<Listener<K>> | undefined;
    if (set) {
      set.add(listener);
    } else {
      this.listeners[topic] = new Set<Listener<K>>([listener]) as ListenerMap[K];
    }
  }

  off<K extends keyof GameEventMap>(topic: K, listener: Listener<K>): void {
    const set = this.listeners[topic] as Set<Listener<K>> | undefined;
    if (!set) return;
    set.delete(listener);
    if (set.size === 0) delete this.listeners[topic];
  }

  emit<K extends keyof GameEventMap>(topic: K, payload: GameEventMap[K]): void {
    const set = this.listeners[topic] as Set<Listener<K>> | undefined;
    if (!set) return;
    for (const listener of set) {
      listener(payload);
    }
  }

  hasListeners(topic: keyof GameEventMap): boolean {
    return Boolean(this.listeners[topic] && this.listeners[topic]!.size > 0);
  }

  dispose(): void {
    for (const topic of Object.keys(this.listeners) as (keyof GameEventMap)[]) {
      this.listeners[topic]?.clear();
    }
  }
}