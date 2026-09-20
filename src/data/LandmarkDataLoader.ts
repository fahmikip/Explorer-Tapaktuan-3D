import landmarksJson from "../../data/landmarks.json";
import type {
  DataStatus,
  LandmarkDefinition,
  LandmarkType,
} from "../landmarks/types";

/**
 * Loads and validates landmark data from the /data source of truth.
 * The loader never throws on bad content: it reports issues and keeps only
 * valid definitions, so an empty or degraded registry remains a valid state.
 */
export interface LandmarkValidationIssue {
  /** Set when the issue belongs to a specific item. */
  landmarkId?: string;
  message: string;
}

export interface LandmarkLoadResult {
  version: number;
  definitions: LandmarkDefinition[];
  issues: LandmarkValidationIssue[];
}

const VALID_TYPES: readonly LandmarkType[] = [
  "landmark",
  "poi",
  "viewpoint",
  "information",
  "discovery",
];

const VALID_STATUSES: readonly DataStatus[] = [
  "draft",
  "review",
  "verified",
  "approved",
  "locked",
  "deprecated",
];

export class LandmarkDataLoader {
  /** Loads the bundled source-of-truth file. */
  load(): LandmarkLoadResult {
    return this.loadFromJson(landmarksJson);
  }

  /** Validates arbitrary JSON — useful for tests and future remote data. */
  loadFromJson(input: unknown): LandmarkLoadResult {
    if (!isRecord(input)) {
      return {
        version: 0,
        definitions: [],
        issues: [
          {
            message:
              "Landmark data validation failed: root value is not an object.",
          },
        ],
      };
    }

    if (!Number.isInteger(input.version)) {
      return {
        version: 0,
        definitions: [],
        issues: [
          {
            message:
              "Landmark data validation failed: missing or invalid integer 'version'.",
          },
        ],
      };
    }
    const version = input.version as number;

    if (!Array.isArray(input.items)) {
      return {
        version,
        definitions: [],
        issues: [
          {
            message:
              "Landmark data validation failed: 'items' must be an array.",
          },
        ],
      };
    }

    const issues: LandmarkValidationIssue[] = [];
    const definitions: LandmarkDefinition[] = [];
    const seenIds = new Set<string>();

    for (const raw of input.items) {
      if (!isRecord(raw)) {
        issues.push({ message: "Landmark item is not an object; skipped." });
        continue;
      }

      const idIssues: string[] = [];
      if (typeof raw.id !== "string" || raw.id.trim() === "") {
        idIssues.push("missing or empty 'id'");
      } else if (seenIds.has(raw.id)) {
        issues.push({
          landmarkId: String(raw.id),
          message: `Landmark data validation failed: Duplicate ID: ${String(raw.id)}`,
        });
        continue;
      }
      if (typeof raw.name !== "string" || raw.name.trim() === "") {
        idIssues.push("missing or empty 'name'");
      }
      if (
        typeof raw.type !== "string" ||
        !(VALID_TYPES as readonly string[]).includes(raw.type)
      ) {
        idIssues.push(
          `invalid 'type' (expected one of: ${VALID_TYPES.join(", ")})`,
        );
      }
      if (
        typeof raw.status !== "string" ||
        !(VALID_STATUSES as readonly string[]).includes(raw.status)
      ) {
        idIssues.push(
          `invalid 'status' (expected one of: ${VALID_STATUSES.join(", ")})`,
        );
      }

      if (!isRecord(raw.position)) {
        idIssues.push("missing 'position' object");
      } else {
        if (!isFiniteNumber(raw.position.x) || !isFiniteNumber(raw.position.z)) {
          idIssues.push("'position.x'/'position.z' must be finite numbers");
        }
        if (raw.position.y !== undefined && !isFiniteNumber(raw.position.y)) {
          idIssues.push("'position.y' must be a finite number when present");
        }
      }

      if (raw.interactionRadius !== undefined && !isFiniteNumber(raw.interactionRadius)) {
        idIssues.push("'interactionRadius' must be a finite number when present");
      }
      if (raw.groundOffset !== undefined && !isFiniteNumber(raw.groundOffset)) {
        idIssues.push("'groundOffset' must be a finite number when present");
      }
      if (raw.scale !== undefined && !isFiniteNumber(raw.scale)) {
        idIssues.push("'scale' must be a finite number when present");
      }
      if (raw.isTestData !== undefined && typeof raw.isTestData !== "boolean") {
        idIssues.push("'isTestData' must be a boolean when present");
      }

      if (idIssues.length > 0) {
        const label = typeof raw.id === "string" ? raw.id : "<unknown>";
        issues.push({ landmarkId: label, message: idIssues.join("; ") });
        continue;
      }

      seenIds.add(String(raw.id));
      definitions.push(raw as unknown as LandmarkDefinition);
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