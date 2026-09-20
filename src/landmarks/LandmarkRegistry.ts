import type { LandmarkLoadResult, LandmarkValidationIssue } from "../data/LandmarkDataLoader";
import type { LandmarkDefinition } from "./types";

/**
 * Validated landmark catalog. Owns the loaded definitions (duplicates already
 * rejected by the loader), provides lookup, and filters by data status.
 * Pure data layer — contains no Three.js or UI logic.
 */
export class LandmarkRegistry {
  private readonly byId = new Map<string, LandmarkDefinition>();
  private readonly definitions: LandmarkDefinition[] = [];

  readonly issues: LandmarkValidationIssue[];
  readonly version: number;

  constructor(result: LandmarkLoadResult) {
    this.issues = result.issues;
    this.version = result.version;
    for (const definition of result.definitions) {
      this.byId.set(definition.id, definition);
      this.definitions.push(definition);
    }
  }

  has(id: string): boolean {
    return this.byId.has(id);
  }

  getById(id: string): LandmarkDefinition | undefined {
    return this.byId.get(id);
  }

  getAll(): readonly LandmarkDefinition[] {
    return this.definitions;
  }

  /** Approved data only — safe to present as production content. */
  getApproved(): LandmarkDefinition[] {
    return this.definitions.filter((item) => item.status === "approved");
  }

  /** Explicitly flagged test data (isTestData). Never production content. */
  getTestData(): LandmarkDefinition[] {
    return this.definitions.filter((item) => item.isTestData === true);
  }

  /**
   * What the world may render. Approved definitions always qualify; test
   * data only qualifies when the explicit debug/test switch is on.
   */
  selectVisible(allowTestData: boolean): LandmarkDefinition[] {
    const selected: LandmarkDefinition[] = [];
    for (const definition of this.definitions) {
      if (definition.status === "approved") {
        selected.push(definition);
        continue;
      }
      if (allowTestData && definition.isTestData === true) {
        selected.push(definition);
      }
    }
    return selected;
  }
}