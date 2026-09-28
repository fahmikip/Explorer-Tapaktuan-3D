import type { DataStatus } from "../core/types";

/**
 * Dialogue data contract. Content lives in /data (source of truth). Nodes form
 * a simple forward graph (next / choices) validated at load time. Speaker is
 * referenced by NPC ID — speaker display names come from the NPC registry.
 */

export interface DialogueChoice {
  id: string;
  text: string;
  /** Target node id within the SAME dialogue. */
  next: string;
}

export interface DialogueNode {
  /** Unique within the dialogue. */
  id: string;
  /** References an NPC id (resolved to a display name by the NPC registry). */
  speakerId: string;
  text: string;
  /** Target node id within the SAME dialogue. May be omitted to end. */
  next?: string;
  choices?: DialogueChoice[];
}

export interface DialogueDefinition {
  /** Stable, machine-readable ID. */
  id: string;
  status: DataStatus;
  isTestData?: boolean;
  /** Optional navigation/backlog title. */
  title?: string;
  nodes: DialogueNode[];
}

export interface DialogueDataFile {
  version: number;
  status: DataStatus;
  items: DialogueDefinition[];
}

export type DialogueEngineState = "idle" | "active" | "completed";
