import type { Disposable } from "../core/types";
import type { EventBus } from "../core/EventBus";
import type { QuestDefinition, QuestProgress } from "../quest/types";

export class QuestPanel implements Disposable {
  private readonly root: HTMLElement;
  private readonly list: HTMLDivElement;
  private readonly summary: HTMLDivElement;
  private readonly onProgress = (): void => this.render();
  private readonly onComplete = (): void => this.render();

  constructor(container: HTMLElement, private readonly events: EventBus,
    private readonly getQuests: () => readonly QuestDefinition[],
    private readonly getProgress: () => readonly QuestProgress[],
    private readonly getPoints: () => number) {
    this.root = document.createElement("section");
    this.root.id = "quest-panel";
    this.root.setAttribute("aria-label", "Misi eksplorasi");
    const heading = document.createElement("h2"); heading.textContent = "Misi";
    this.summary = document.createElement("div"); this.summary.className = "quest-summary";
    this.list = document.createElement("div"); this.list.className = "quest-list";
    this.root.append(heading, this.summary, this.list);
    container.appendChild(this.root);
    events.on("quest:progress", this.onProgress);
    events.on("quest:completed", this.onComplete);
    this.render();
  }

  dispose(): void {
    this.events.off("quest:progress", this.onProgress);
    this.events.off("quest:completed", this.onComplete);
    this.root.remove();
  }

  private render(): void {
    const quests = this.getQuests();
    const progress = this.getProgress();
    const byId = new Map(progress.map((item) => [item.questId, item]));
    this.summary.textContent = `${progress.filter((item) => item.completed).length}/${quests.length} selesai · ${this.getPoints()} poin`;
    this.list.replaceChildren();
    if (quests.length === 0) {
      const empty = document.createElement("p"); empty.textContent = "Belum ada misi tersedia."; this.list.appendChild(empty); return;
    }
    for (const quest of quests) {
      const item = document.createElement("article"); item.className = "quest-item";
      const title = document.createElement("h3"); title.textContent = quest.title;
      const objectives = document.createElement("ul");
      const state = byId.get(quest.id);
      for (const objective of quest.objectives) {
        const row = document.createElement("li");
        const amount = state?.objectives[objective.id] ?? 0;
        row.textContent = `${state?.completed || amount >= objective.count ? "✓" : "○"} ${objective.description} (${amount}/${objective.count})`;
        objectives.appendChild(row);
      }
      const reward = document.createElement("p"); reward.className = "quest-reward";
      reward.textContent = state?.completed ? `Selesai · +${quest.rewardPoints} poin` : `Hadiah: ${quest.rewardPoints} poin`;
      item.append(title, objectives, reward); this.list.appendChild(item);
    }
  }
}
