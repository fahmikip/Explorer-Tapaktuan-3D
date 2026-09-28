/**
 * Shared application types.
 */

export interface Disposable {
  dispose(): void;
}

/** Data governance status shared by all source-of-truth datasets. */
export type DataStatus =
  | "draft"
  | "review"
  | "verified"
  | "approved"
  | "locked"
  | "deprecated";

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

  /** Player interacted with an NPC. */
  "npc:interacted": { npcId: string };

  /** An NPC dialogue began. */
  "dialogue:started": { dialogueId: string; npcId?: string };

  /** The active node changed inside an active dialogue. */
  "dialogue:nodeChanged": { nodeId: string };

  /** A choice was made inside an active dialogue. */
  "dialogue:choiceSelected": { choiceId: string };

  /** The dialogue ran to its end (completed state). */
  "dialogue:completed": { dialogueId: string };

  /** The dialogue was closed (completed or escaped). */
  "dialogue:closed": { dialogueId: string };

  /** Quest objective progress changed. */
  "quest:progress": { completed: number; total: number; points: number };

  /** A quest completed and its configured points reward was granted. */
  "quest:completed": { questId: string; rewardPoints: number };
}
