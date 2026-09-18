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
  resize: Size;
}