import npcsJson from "../../data/npcs.json";
import type { DataStatus } from "../core/types";
import type { NPCDefinition } from "../npc/types";

/**
 * Loads and validates NPC data from /data (source of truth). Never throws on
 * bad content: issues are reported and only valid definitions are kept, so an
 * empty or degraded registry remains a valid state.
 */
export interface NPCValidationIssue {
  npcId?: string;
  message: string;
}

export interface NPCLoadResult {
  version: number;
  definitions: NPCDefinition[];
  issues: NPCValidationIssue[];
}

const VALID_STATUSES: readonly DataStatus[] = [
  "draft",
  "review",
  "verified",
  "approved",
  "locked",
  "deprecated",
];

export class NPCDataLoader {
  load(): NPCLoadResult {
    return this.loadFromJson(npcsJson);
  }

  loadFromJson(input: unknown): NPCLoadResult {
    if (!isRecord(input)) {
      return {
        version: 0,
        definitions: [],
        issues: [{ message: "NPC data validation failed: root is not an object." }],
      };
    }
    if (!Number.isInteger(input.version)) {
      return {
        version: 0,
        definitions: [],
        issues: [
          { message: "NPC data validation failed: missing or invalid integer 'version'." },
        ],
      };
    }
    const version = input.version as number;
    if (!Array.isArray(input.items)) {
      return {
        version,
        definitions: [],
        issues: [{ message: "NPC data validation failed: 'items' must be an array." }],
      };
    }

    const issues: NPCValidationIssue[] = [];
    const definitions: NPCDefinition[] = [];
    const seenIds = new Set<string>();

    for (const raw of input.items) {
      if (!isRecord(raw)) {
        issues.push({ message: "NPC item is not an object; skipped." });
        continue;
      }

      const errors: string[] = [];
      if (typeof raw.id !== "string" || raw.id.trim() === "") {
        errors.push("missing or empty 'id'");
      } else if (seenIds.has(raw.id)) {
        issues.push({
          npcId: String(raw.id),
          message: `NPC data validation failed: Duplicate ID: ${String(raw.id)}`,
        });
        continue;
      }
      if (typeof raw.name !== "string" || raw.name.trim() === "") {
        errors.push("missing or empty 'name'");
      }
      if (typeof raw.status !== "string" || !(VALID_STATUSES as readonly string[]).includes(raw.status)) {
        errors.push(`invalid 'status' (expected one of: ${VALID_STATUSES.join(", ")})`);
      }
      if (!isRecord(raw.position)) {
        errors.push("missing 'position' object");
      } else if (
        !isFiniteNumber(raw.position.x) ||
        !isFiniteNumber(raw.position.z)
      ) {
        errors.push("'position.x'/'position.z' must be finite numbers");
      }
      if (raw.rotationY !== undefined && !isFiniteNumber(raw.rotationY)) {
        errors.push("'rotationY' must be a finite number when present");
      }
      if (raw.interactionRadius !== undefined && !isFiniteNumber(raw.interactionRadius)) {
        errors.push("'interactionRadius' must be a finite number when present");
      }
      if (raw.groundOffset !== undefined && !isFiniteNumber(raw.groundOffset)) {
        errors.push("'groundOffset' must be a finite number when present");
      }
      if (raw.scale !== undefined && !isFiniteNumber(raw.scale)) {
        errors.push("'scale' must be a finite number when present");
      }
      if (raw.dialogueId !== undefined && typeof raw.dialogueId !== "string") {
        errors.push("'dialogueId' must be a string when present");
      }
      if (raw.isTestData !== undefined && typeof raw.isTestData !== "boolean") {
        errors.push("'isTestData' must be a boolean when present");
      }

      if (errors.length > 0) {
        const label = typeof raw.id === "string" ? raw.id : "<unknown>";
        issues.push({ npcId: label, message: errors.join("; ") });
        continue;
      }

      seenIds.add(String(raw.id));
      definitions.push(raw as unknown as NPCDefinition);
    }

    return { version, definitions, issues };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}