import type { QuestLoadResult } from "../data/QuestDataLoader";
import type { QuestDefinition } from "./types";

export class QuestRegistry {
  readonly definitions: readonly QuestDefinition[];
  readonly issues: readonly string[];
  readonly version: number;

  constructor(result: QuestLoadResult, allowTestData = false) {
    this.issues = result.issues;
    this.version = result.version;
    this.definitions = result.definitions.filter((quest) =>
      quest.status === "approved" || quest.status === "locked" ||
      (allowTestData && quest.isTestData === true),
    );
  }
}
