import type { Disposable } from "../core/types";

/**
 * Small bottom-center pill prompting the player about the current
 * interaction target. Hidden when no target is in range.
 */
export class InteractionHint implements Disposable {
  private readonly element: HTMLDivElement;

  constructor(container: HTMLElement) {
    this.element = document.createElement("div");
    this.element.id = "interaction-hint";
    this.element.hidden = true;
    container.appendChild(this.element);
  }

  setTarget(label: string | null): void {
    if (label === null || label === "") {
      this.element.hidden = true;
      return;
    }
    this.element.textContent = `[E] ${label}`;
    this.element.hidden = false;
  }

  dispose(): void {
    this.element.remove();
  }
}