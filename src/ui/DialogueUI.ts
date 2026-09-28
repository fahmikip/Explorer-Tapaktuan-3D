import type { Disposable } from "../core/types";
import type { EventBus } from "../core/EventBus";
import type { DialogueConfig } from "../config/gameConfig";
import type { DialogueChoice, DialogueNode } from "../dialogue/types";

export interface DialogueUIOptions {
  container: HTMLElement;
  eventBus: EventBus;
  config: DialogueConfig;
  /** Reads the engine's current node (UI never mutates dialogue state). */
  getCurrentNode: () => DialogueNode | null;
  /** Resolves an NPC id to a display name. */
  speakerResolver: (speakerId: string) => string;
  onContinue: () => void;
  onSelectChoice: (choiceId: string) => void;
  onCloseRequest: () => void;
}

/**
 * Dialogue presentation layer. Created once and reused (show/hide/update) —
 * no DOM is rebuilt per conversation. Owns the text reveal timer and the
 * continue/choice/close interaction, then forwards intentions through the
 * provided callbacks. Speaker names always come from the NPC registry via
 * speakerResolver, never from dialogue data.
 */
export class DialogueUI implements Disposable {
  private readonly options: DialogueUIOptions;

  private readonly element: HTMLDivElement;
  private readonly speakerElement: HTMLDivElement;
  private readonly textElement: HTMLParagraphElement;
  private readonly choicesElement: HTMLDivElement;
  private readonly continueButton: HTMLButtonElement;
  private readonly closeButton: HTMLButtonElement;

  private openValue = false;
  private revealToken = 0;
  private revealTimer: number | null = null;
  private fullText = "";
  private revealedLength = 0;

  constructor(options: DialogueUIOptions) {
    this.options = options;

    this.element = document.createElement("div");
    this.element.id = "dialogue-ui";
    this.element.hidden = true;

    const header = document.createElement("header");
    header.className = "dialogue-header";

    this.speakerElement = document.createElement("div");
    this.speakerElement.className = "dialogue-speaker";
    header.appendChild(this.speakerElement);

    this.closeButton = document.createElement("button");
    this.closeButton.className = "dialogue-close";
    this.closeButton.setAttribute("aria-label", "Tutup percakapan");
    this.closeButton.textContent = "\u2715";
    this.closeButton.addEventListener("click", () => this.options.onCloseRequest());
    header.appendChild(this.closeButton);

    const body = document.createElement("div");
    body.className = "dialogue-body";

    this.textElement = document.createElement("p");
    this.textElement.className = "dialogue-text";
    body.appendChild(this.textElement);

    this.choicesElement = document.createElement("div");
    this.choicesElement.className = "dialogue-choices";
    body.appendChild(this.choicesElement);

    this.continueButton = document.createElement("button");
    this.continueButton.className = "dialogue-continue";
    this.continueButton.textContent = "\u25B8";
    this.continueButton.setAttribute("aria-label", "Lanjut");
    this.continueButton.addEventListener("click", () => this.handlePrimary());
    body.appendChild(this.continueButton);

    this.element.appendChild(header);
    this.element.appendChild(body);
    options.container.appendChild(this.element);

    options.eventBus.on("dialogue:started", this.onStarted);
    options.eventBus.on("dialogue:nodeChanged", this.onNodeChanged);
    options.eventBus.on("dialogue:closed", this.onClosed);
    document.addEventListener("keydown", this.handleKeyDown);
  }

  get isOpen(): boolean {
    return this.openValue;
  }

  dispose(): void {
    this.stopReveal();
    this.options.eventBus.off("dialogue:started", this.onStarted);
    this.options.eventBus.off("dialogue:nodeChanged", this.onNodeChanged);
    this.options.eventBus.off("dialogue:closed", this.onClosed);
    document.removeEventListener("keydown", this.handleKeyDown);
    this.element.remove();
  }

  /** Instantly finishes the current reveal if one is in progress. */
  skipReveal(): void {
    if (this.options.config.allowSkip && this.isRevealing()) {
      this.completeReveal();
    }
  }

  private readonly onStarted = (): void => {
    this.element.hidden = false;
    this.openValue = true;
    this.speakCurrent();
  };

  private readonly onNodeChanged = (): void => {
    this.speakCurrent();
  };

  private readonly onClosed = (): void => {
    this.stopReveal();
    this.element.hidden = true;
    this.openValue = false;
  };

  private speakCurrent(): void {
    const node = this.options.getCurrentNode();
    if (!node) return;

    this.stopReveal();
    this.speakerElement.textContent = this.options.speakerResolver(node.speakerId);
    this.renderChoices(node.choices);

    this.fullText = node.text;
    this.revealedLength = 0;
    this.textElement.textContent = "";

    const hasChoices = Boolean(node.choices?.length);
    const isEnd = !node.next && !hasChoices;
    this.continueButton.textContent = isEnd
      ? "Tutup"
      : hasChoices
        ? ""
        : "\u25B8";
    this.continueButton.hidden = hasChoices;

    const token = ++this.revealToken;
    if (!this.options.config.allowSkip) {
      this.textElement.textContent = this.fullText;
      this.updateContinueState();
      return;
    }

    const startTime = performance.now();
    this.revealTimer = window.setInterval(() => {
      if (token !== this.revealToken) return;
      const elapsed = (performance.now() - startTime) / 1000;
      const target = Math.min(
        this.fullText.length,
        Math.floor(elapsed * this.options.config.textRevealSpeed),
      );
      if (target > this.revealedLength) {
        this.revealedLength = target;
        this.textElement.textContent = this.fullText.slice(0, this.revealedLength);
      }
      if (this.revealedLength >= this.fullText.length) {
        this.completeReveal();
      }
    }, 40);
  }

  private renderChoices(choices: DialogueChoice[] | undefined): void {
    this.choicesElement.replaceChildren();
    if (!choices) return;
    for (const choice of choices) {
      const button = document.createElement("button");
      button.className = "dialogue-choice";
      button.textContent = choice.text;
      button.addEventListener("click", () =>
        this.options.onSelectChoice(choice.id),
      );
      this.choicesElement.appendChild(button);
    }
  }

  private handlePrimary(): void {
    if (this.isRevealing()) {
      this.skipReveal();
      return;
    }
    const node = this.options.getCurrentNode();
    if (!node) return;
    if (node.choices?.length) return;
    this.options.onContinue();
  }

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (!this.openValue) return;
    if (event.key === "Escape") {
      if (this.options.config.closeOnEscape) {
        event.preventDefault();
        this.options.onCloseRequest();
      }
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.handlePrimary();
      return;
    }
    if (event.key === "e" || event.key === "E") {
      this.handlePrimary();
    }
  };

  private isRevealing(): boolean {
    return this.revealTimer !== null && this.revealedLength < this.fullText.length;
  }

  private completeReveal(): void {
    this.stopReveal();
    this.revealedLength = this.fullText.length;
    this.textElement.textContent = this.fullText;
    this.updateContinueState();
  }

  private updateContinueState(): void {
    const node = this.options.getCurrentNode();
    const hasChoices = Boolean(node?.choices?.length);
    this.continueButton.hidden = hasChoices;
  }

  private stopReveal(): void {
    if (this.revealTimer !== null) {
      window.clearInterval(this.revealTimer);
      this.revealTimer = null;
    }
    this.revealToken += 1;
  }
}