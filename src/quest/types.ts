import type { DataStatus } from "../core/types";

export type QuestObjectiveType =
  | "discover_landmark"
  | "talk_to_npc"
  | "complete_dialogue";

export interface QuestObjective {
  id: string;
  type: QuestObjectiveType;
  description: string;
  targetId?: string;
  count: number;
}

export interface QuestDefinition {
  id: string;
  title: string;
  description?: string;
  status: DataStatus;
  isTestData?: boolean;
  rewardPoints: number;
  objectives: QuestObjective[];
}

export interface QuestProgress {
  questId: string;
  objectives: Record<string, number>;
  completed: boolean;
}
