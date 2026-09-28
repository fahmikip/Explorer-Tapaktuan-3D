import type { DataStatus } from "../core/types";

/**
 * NPC data contract. Data lives in /data (source of truth); this module only
 * mirrors and validates its shape. No real people are ever represented — any
 * production NPC must be fictional or an explicitly approved representation.
 */

export type NPCState = "idle" | "talking" | "disabled";

export interface NPCPosition {
  x: number;
  z: number;
}

export interface NPCDefinition {
  /** Stable, machine-readable ID (never a display name, never a real person). */
  id: string;
  /** Display name shown in dialogue UI. */
  name: string;
  /** Optional role label (e.g. "Pemandu"). */
  role?: string;
  position: NPCPosition;
  /** Data-driven facing, radians around Y. */
  rotationY?: number;
  /** Overrides the default interaction radius. */
  interactionRadius?: number;
  /** Ground offset above the terrain surface. */
  groundOffset?: number;
  /** Uniform scale for the placeholder visual. */
  scale?: number;
  /** Future 3D asset reference (data-driven, never a name check). */
  assetId?: string;
  /** Dialogue to start on interaction (must exist in /data/dialogues.json). */
  dialogueId?: string;
  /** Explicit developmental/test flag — never production content. */
  isTestData?: boolean;
  /** Data governance status (see DATA_RULES.md). */
  status: DataStatus;
}

export interface NPCDataFile {
  version: number;
  status: DataStatus;
  items: NPCDefinition[];
}