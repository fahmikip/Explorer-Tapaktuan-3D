import type { DialogueLoadResult } from "../data/DialogueDataLoader";
import type { DialogueDefinition } from "./types";

/**
 * Validated dialogue catalog. Duplicates and graph errors are already rejected
 * by the loader; this registry provides lookup. Pure data layer.
 */
export class DialogueRegistry {
  private readonly byId = new Map<string, DialogueDefinition>();
  private readonly definitions: DialogueDefinition[] = [];

  readonly issues: DialogueLoadResult["issues"];
  readonly version: number;

  constructor(result: DialogueLoadResult) {
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

  getById(id: string): DialogueDefinition | undefined {
    return this.byId.get(id);
  }

  getAll(): readonly DialogueDefinition[] {
    return this.definitions;
  }

  resolveNode(dialogueId: string, nodeId: string | undefined): DialogueDefinition["nodes"][number] | undefined {
    if (nodeId === undefined) return undefined;
    return this.byId.get(dialogueId)?.nodes.find((node) => node.id === nodeId);
  }
}