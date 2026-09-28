import type { Disposable, GameEventMap } from "../core/types";
import type { EventBus } from "../core/EventBus";
import type { QuestDefinition, QuestObjectiveType, QuestProgress } from "./types";

export interface QuestStorage {
  load(): unknown;
  store(progress: readonly QuestProgress[], points: number): void;
}

export class MemoryQuestStorage implements QuestStorage {
  private value: { progress: QuestProgress[]; points: number } = { progress: [], points: 0 };
  load(): unknown { return this.value; }
  store(progress: readonly QuestProgress[], points: number): void {
    this.value = { progress: progress.map(copyProgress), points };
  }
}

export class LocalStorageQuestStorage implements QuestStorage {
  private readonly key = "explore-tapaktuan:quests:v1";
  load(): unknown {
    try { const raw = window.localStorage.getItem(this.key); return raw ? JSON.parse(raw) as unknown : null; }
    catch { return null; }
  }
  store(progress: readonly QuestProgress[], points: number): void {
    try { window.localStorage.setItem(this.key, JSON.stringify({ progress, points })); }
    catch { /* Continue without persistence when storage is unavailable. */ }
  }
}

/** Event-driven objective tracker. Every selected quest is active immediately. */
export class QuestManager implements Disposable {
  private readonly progressById = new Map<string, QuestProgress>();
  private pointsValue = 0;
  private readonly onDiscovery = (event: GameEventMap["landmark:discovered"]): void => this.record("discover_landmark", event.landmarkId);
  private readonly onNpc = (event: GameEventMap["npc:interacted"]): void => this.record("talk_to_npc", event.npcId);
  private readonly onDialogue = (event: GameEventMap["dialogue:completed"]): void => this.record("complete_dialogue", event.dialogueId);

  constructor(
    private readonly quests: readonly QuestDefinition[],
    private readonly events: EventBus,
    private readonly storage: QuestStorage,
  ) {
    this.restore();
    events.on("landmark:discovered", this.onDiscovery);
    events.on("npc:interacted", this.onNpc);
    events.on("dialogue:completed", this.onDialogue);
  }

  get progress(): readonly QuestProgress[] { return this.quests.map((quest) => copyProgress(this.ensure(quest))); }
  get points(): number { return this.pointsValue; }

  dispose(): void {
    this.events.off("landmark:discovered", this.onDiscovery);
    this.events.off("npc:interacted", this.onNpc);
    this.events.off("dialogue:completed", this.onDialogue);
    this.persist();
  }

  private record(type: QuestObjectiveType, targetId: string): void {
    let changed = false;
    for (const quest of this.quests) {
      const progress = this.ensure(quest);
      if (progress.completed) continue;
      for (const objective of quest.objectives) {
        if (objective.type !== type || (objective.targetId && objective.targetId !== targetId)) continue;
        const current = progress.objectives[objective.id] ?? 0;
        if (current >= objective.count) continue;
        progress.objectives[objective.id] = current + 1;
        changed = true;
      }
      if (quest.objectives.every((objective) => (progress.objectives[objective.id] ?? 0) >= objective.count)) {
        progress.completed = true;
        this.pointsValue += quest.rewardPoints;
        this.events.emit("quest:completed", { questId: quest.id, rewardPoints: quest.rewardPoints });
      }
    }
    if (changed) {
      this.persist();
      this.events.emit("quest:progress", { completed: this.quests.filter((quest) => this.ensure(quest).completed).length, total: this.quests.length, points: this.pointsValue });
    }
  }

  private ensure(quest: QuestDefinition): QuestProgress {
    let progress = this.progressById.get(quest.id);
    if (!progress) { progress = { questId: quest.id, objectives: {}, completed: false }; this.progressById.set(quest.id, progress); }
    return progress;
  }

  private restore(): void {
    const raw = this.storage.load();
    if (!isRecord(raw)) return;
    this.pointsValue = typeof raw.points === "number" && Number.isFinite(raw.points) && raw.points >= 0 ? raw.points : 0;
    if (!Array.isArray(raw.progress)) return;
    const activeIds = new Set(this.quests.map((quest) => quest.id));
    for (const value of raw.progress) {
      if (!isRecord(value) || typeof value.questId !== "string" || !activeIds.has(value.questId) || !isRecord(value.objectives)) continue;
      const quest = this.quests.find((item) => item.id === value.questId)!;
      const objectives: Record<string, number> = {};
      for (const objective of quest.objectives) {
        const amount = value.objectives[objective.id];
        if (typeof amount === "number" && Number.isInteger(amount)) objectives[objective.id] = Math.max(0, Math.min(objective.count, amount));
      }
      const completed = quest.objectives.every((objective) => (objectives[objective.id] ?? 0) >= objective.count);
      this.progressById.set(quest.id, { questId: quest.id, objectives, completed });
    }
  }

  private persist(): void { this.storage.store(this.progress, this.pointsValue); }
}

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function copyProgress(value: QuestProgress): QuestProgress { return { questId: value.questId, objectives: { ...value.objectives }, completed: value.completed }; }
