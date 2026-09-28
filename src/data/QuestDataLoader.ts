import questsJson from "../../data/quests.json";
import type { DataStatus } from "../core/types";
import type { QuestDefinition, QuestObjective, QuestObjectiveType } from "../quest/types";

export interface QuestLoadResult {
  version: number;
  definitions: QuestDefinition[];
  issues: string[];
}

const STATUSES: readonly DataStatus[] = ["draft", "review", "verified", "approved", "locked", "deprecated"];
const OBJECTIVE_TYPES: readonly QuestObjectiveType[] = ["discover_landmark", "talk_to_npc", "complete_dialogue"];

export class QuestDataLoader {
  load(): QuestLoadResult {
    return this.loadFromJson(questsJson);
  }

  loadFromJson(input: unknown): QuestLoadResult {
    if (!isRecord(input) || !Number.isInteger(input.version) || !Array.isArray(input.items)) {
      return { version: 0, definitions: [], issues: ["Quest data must contain integer version and items array."] };
    }
    const issues: string[] = [];
    const definitions: QuestDefinition[] = [];
    const seen = new Set<string>();
    for (const [index, raw] of input.items.entries()) {
      const label = isRecord(raw) && typeof raw.id === "string" ? raw.id : `item ${index}`;
      if (!isRecord(raw) || typeof raw.id !== "string" || raw.id.trim() === "" || seen.has(raw.id) ||
          typeof raw.title !== "string" || raw.title.trim() === "" ||
          typeof raw.status !== "string" || !STATUSES.includes(raw.status as DataStatus) ||
          !Number.isInteger(raw.rewardPoints) || (raw.rewardPoints as number) < 0 ||
          !Array.isArray(raw.objectives) || raw.objectives.length === 0 ||
          (raw.isTestData !== undefined && typeof raw.isTestData !== "boolean")) {
        issues.push(`Invalid or duplicate quest ${label}; skipped.`);
        continue;
      }
      const objectives: QuestObjective[] = [];
      const objectiveIds = new Set<string>();
      let valid = true;
      for (const objective of raw.objectives) {
        if (!isRecord(objective) || typeof objective.id !== "string" || objective.id.trim() === "" ||
            objectiveIds.has(objective.id) || typeof objective.type !== "string" ||
            !OBJECTIVE_TYPES.includes(objective.type as QuestObjectiveType) ||
            typeof objective.description !== "string" || objective.description.trim() === "" ||
            !Number.isInteger(objective.count) || (objective.count as number) < 1 ||
            (objective.targetId !== undefined && typeof objective.targetId !== "string")) {
          valid = false;
          break;
        }
        objectiveIds.add(objective.id);
        objectives.push(objective as unknown as QuestObjective);
      }
      if (!valid) {
        issues.push(`Quest ${label} has invalid objectives; skipped.`);
        continue;
      }
      seen.add(raw.id);
      definitions.push({
        id: raw.id, title: raw.title,
        description: typeof raw.description === "string" ? raw.description : undefined,
        status: raw.status as DataStatus, isTestData: raw.isTestData === true,
        rewardPoints: raw.rewardPoints as number, objectives,
      });
    }
    return { version: input.version as number, definitions, issues };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
