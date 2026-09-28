/**
 * Landmark & Point of Interest data model.
 * These types mirror the /data source-of-truth files. No real-world
 * Tapaktuan facts are encoded here — this is a generic data contract.
 */

import type { DataStatus } from "../core/types";

export type { DataStatus } from "../core/types";

export type LandmarkType =
  | "landmark"
  | "poi"
  | "viewpoint"
  | "information"
  | "discovery";

export interface LandmarkPosition {
  x: number;
  z: number;
  /** Optional manual elevation. When omitted, terrain height is used. */
  y?: number;
}

export interface LandmarkDefinition {
  /** Stable, machine-readable ID (never a display name). */
  id: string;
  /** Display name. Placeholder-only until approved real data exists. */
  name: string;
  type: LandmarkType;
  position: LandmarkPosition;
  shortDescription?: string;
  description?: string;
  image?: string;
  /** Source reference shown when displayed (never fabricated). */
  source?: string;
  /** Future 3D asset reference (data-driven, never a name check). */
  assetId?: string;
  /** Overrides the default interaction radius for this landmark. */
  interactionRadius?: number;
  /** Ground offset above the surface. */
  groundOffset?: number;
  /** Uniform scale multiplier for the placeholder visual. */
  scale?: number;
  tags?: string[];
  /** Explicitly marks development/test data (never silently real). */
  isTestData?: boolean;
  /** Data governance status. See DATA_RULES.md. */
  status: DataStatus;
}

export interface LandmarkDataFile {
  version: number;
  status: DataStatus;
  items: LandmarkDefinition[];
}

/** Read-only snapshot that the information panel renders. */
export interface LandmarkDisplayInfo {
  id: string;
  name: string;
  type: LandmarkType;
  shortDescription?: string;
  description?: string;
  source?: string;
  isTestData?: boolean;
  discovered: boolean;
}