/**
 * Shared application types.
 */

export interface Disposable {
  dispose(): void;
}

export type LifecyclePhase =
  | "created"
  | "initialized"
  | "running"
  | "stopped"
  | "disposed";

export interface Size {
  width: number;
  height: number;
}

export interface DebugSnapshot {
  running: boolean;
  deltaTime: number;
  elapsedSeconds: number;
  width: number;
  height: number;
  pixelRatio: number;
  drawCalls: number;
  triangles: number;
}

/**
 * Typed event catalog for the EventBus.
 * Add new topics here as systems are introduced.
 */
export interface GameEventMap {
  "game.started": void;
  "game.stopped": void;
  "game.disposed": void;
  "player:jumped": void;
  resize: Size;

  /** Active nearby interactable changed (fire only on change), or null. */
  "interaction:target-changed": { id: string; label: string } | null;

  /** Player interacted with a landmark (opened its information panel). */
  "landmark:interacted": { landmarkId: string };

  /** Landmark entered the player's discovered set for the first time. */
  "landmark:discovered": { landmarkId: string };
}