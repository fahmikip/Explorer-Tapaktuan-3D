import type { Disposable } from "../core/types";
import type { EventBus } from "../core/EventBus";
import type { DialogueRegistry } from "./DialogueRegistry";
import type { DialogueEngineState, DialogueNode } from "./types";

/**
 * Forward-only dialogue state machine. Nodes advance through `next` (single
 * flow) or `choices` (basic branching). Choices are validated at load time;
 * the engine trusts the registry and degrades to "complete" on any missing
 * reference rather than crashing.
 */
export class DialogueEngine implements Disposable {
  constructor(
    private readonly registry: DialogueRegistry,
    private readonly eventBus: EventBus,
  ) {}

  private dialogueIdValue: string | null = null;
  private currentNodeValue: DialogueNode | null = null;
  private stateValue: DialogueEngineState = "idle";

  get state(): DialogueEngineState {
    return this.stateValue;
  }

  isActive(): boolean {
    return this.stateValue === "active";
  }

  get dialogueId(): string | null {
    return this.dialogueIdValue;
  }

  getCurrentNode(): DialogueNode | null {
    return this.currentNodeValue;
  }

  /**
   * Starts a dialogue. Returns false (with no event) when the dialogue is
   * unknown or empty — the caller decides how to surface that.
   */
  start(dialogueId: string, npcId?: string): boolean {
    const definition = this.registry.getById(dialogueId);
    if (!definition || definition.nodes.length === 0 || this.stateValue === "active") {
      return false;
    }
    this.dialogueIdValue = dialogueId;
    this.currentNodeValue = definition.nodes[0];
    this.stateValue = "active";
    this.eventBus.emit("dialogue:started", { dialogueId, npcId });
    this.eventBus.emit("dialogue:nodeChanged", {
      nodeId: this.currentNodeValue.id,
    });
    return true;
  }

  /** True when the current node expects a choice selection before advancing. */
  hasChoices(): boolean {
    return Boolean(this.currentNodeValue?.choices?.length);
  }

  /** Advances via `next`, or completes when the node ends the dialogue. */
  continue(): void {
    if (!this.isActive() || !this.currentNodeValue) return;
    if (this.hasChoices()) return;
    const next = this.currentNodeValue.next;
    if (!next) {
      this.complete();
      return;
    }
    const target = this.registry.resolveNode(this.dialogueIdValue ?? "", next);
    if (!target) {
      this.complete();
      return;
    }
    this.moveTo(target);
  }

  selectChoice(choiceId: string): void {
    if (!this.isActive() || !this.currentNodeValue) return;
    const choice = this.currentNodeValue.choices?.find(
      (candidate) => candidate.id === choiceId,
    );
    if (!choice) return;
    this.eventBus.emit("dialogue:choiceSelected", { choiceId });
    const target = this.registry.resolveNode(this.dialogueIdValue ?? "", choice.next);
    if (!target) {
      this.complete();
      return;
    }
    this.moveTo(target);
  }

  /** Marks the dialogue completed and reports it. */
  complete(): void {
    if (this.stateValue !== "active") return;
    this.stateValue = "completed";
    if (this.dialogueIdValue) {
      this.eventBus.emit("dialogue:completed", {
        dialogueId: this.dialogueIdValue,
      });
    }
  }

  /** Ends the dialogue and returns to idle (completed or escaped). */
  close(): void {
    if (this.stateValue === "idle") return;
    if (this.dialogueIdValue) {
      this.eventBus.emit("dialogue:closed", {
        dialogueId: this.dialogueIdValue,
      });
    }
    this.dialogueIdValue = null;
    this.currentNodeValue = null;
    this.stateValue = "idle";
  }

  dispose(): void {
    this.close();
  }

  private moveTo(node: DialogueNode): void {
    this.currentNodeValue = node;
    this.eventBus.emit("dialogue:nodeChanged", { nodeId: node.id });
  }
}