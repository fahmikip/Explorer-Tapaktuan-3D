import type { NPCLoadResult } from "../data/NPCDataLoader";
import type { NPCDefinition } from "./types";

/**
 * Validated NPC catalog. Duplicates are already rejected by the loader; this
 * registry provides lookup and status filtering. Pure data layer.
 */
export class NPCRegistry {
  private readonly byId = new Map<string, NPCDefinition>();
  private readonly definitions: NPCDefinition[] = [];

  readonly issues: NPCLoadResult["issues"];
  readonly version: number;

  constructor(result: NPCLoadResult) {
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

  getById(id: string): NPCDefinition | undefined {
    return this.byId.get(id);
  }

  getAll(): readonly NPCDefinition[] {
    return this.definitions;
  }

  /** Approved/locked NPCs only — safe to present as production content. */
  getApproved(): NPCDefinition[] {
    return this.definitions.filter(
      (item) => item.status === "approved" || item.status === "locked",
    );
  }

  getTestData(): NPCDefinition[] {
    return this.definitions.filter((item) => item.isTestData === true);
  }

  /** What the world may spawn. Approved/locked always; test only on demand. */
  selectVisible(allowTestData: boolean): NPCDefinition[] {
    const selected: NPCDefinition[] = [];
    for (const definition of this.definitions) {
      if (definition.status === "approved" || definition.status === "locked") {
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