import type { Disposable } from "../core/types";
import type { LandmarkDisplayInfo } from "../landmarks/types";

export interface LandmarkInfoPanelOptions {
  onOpen?: () => void;
  onClose?: () => void;
}

/**
 * Read-only information panel for a landmark/POI.
 * Right-side panel on desktop, bottom sheet on small screens; hides DOM
 * nodes for empty fields and never fabricates content it wasn't given.
 */
export class LandmarkInfoPanel implements Disposable {
  private readonly element: HTMLDivElement;
  private readonly nameElement: HTMLSpanElement;
  private readonly typeElement: HTMLSpanElement;
  private readonly testBadge: HTMLDivElement;
  private readonly shortDescriptionElement: HTMLParagraphElement;
  private readonly descriptionElement: HTMLParagraphElement;
  private readonly sourceElement: HTMLParagraphElement;
  private readonly closeButton: HTMLButtonElement;
  private readonly options: LandmarkInfoPanelOptions;

  private openValue = false;

  constructor(container: HTMLElement, options: LandmarkInfoPanelOptions = {}) {
    this.options = options;

    this.element = document.createElement("div");
    this.element.id = "landmark-info-panel";
    this.element.hidden = true;

    const header = document.createElement("header");
    header.className = "landmark-panel-header";
    this.element.appendChild(header);

    const titleBlock = document.createElement("div");
    titleBlock.className = "landmark-panel-titles";
    this.nameElement = document.createElement("span");
    this.nameElement.className = "landmark-panel-name";
    this.typeElement = document.createElement("span");
    this.typeElement.className = "landmark-panel-type";
    titleBlock.appendChild(this.nameElement);
    titleBlock.appendChild(this.typeElement);
    header.appendChild(titleBlock);

    this.testBadge = document.createElement("div");
    this.testBadge.className = "landmark-panel-badge";
    this.testBadge.textContent = "DEBUG / TEST DATA";
    this.testBadge.hidden = true;
    header.appendChild(this.testBadge);

    this.closeButton = document.createElement("button");
    this.closeButton.className = "landmark-panel-close";
    this.closeButton.setAttribute("aria-label", "Tutup");
    this.closeButton.textContent = "\u2715";
    this.closeButton.addEventListener("click", () => this.close());
    header.appendChild(this.closeButton);

    const body = document.createElement("div");
    body.className = "landmark-panel-body";

    this.shortDescriptionElement = document.createElement("p");
    this.shortDescriptionElement.className = "landmark-panel-short";
    body.appendChild(this.shortDescriptionElement);

    this.descriptionElement = document.createElement("p");
    this.descriptionElement.className = "landmark-panel-description";
    body.appendChild(this.descriptionElement);

    this.sourceElement = document.createElement("p");
    this.sourceElement.className = "landmark-panel-source";
    body.appendChild(this.sourceElement);

    this.element.appendChild(body);
    container.appendChild(this.element);

    document.addEventListener("keydown", this.handleKeyDown);
  }

  get isOpen(): boolean {
    return this.openValue;
  }

  open(info: LandmarkDisplayInfo): void {
    this.nameElement.textContent = info.name;
    this.typeElement.textContent = typeLabel(info.type);

    this.showIfPresent(this.shortDescriptionElement, info.shortDescription);
    this.showIfPresent(this.descriptionElement, info.description);
    if (info.source && !info.isTestData) {
      this.sourceElement.hidden = false;
      this.sourceElement.textContent = `Sumber: ${info.source}`;
    } else {
      this.sourceElement.hidden = true;
    }

    this.testBadge.hidden = info.isTestData !== true;

    this.element.hidden = false;
    this.openValue = true;
    this.options.onOpen?.();
  }

  close(): void {
    if (!this.openValue) return;
    this.element.hidden = true;
    this.openValue = false;
    this.options.onClose?.();
  }

  dispose(): void {
    document.removeEventListener("keydown", this.handleKeyDown);
    this.element.remove();
  }

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Escape" && this.openValue) {
      this.close();
    }
  };

  private showIfPresent(
    element: HTMLElement,
    value: string | undefined,
  ): void {
    if (value && value.trim() !== "") {
      element.hidden = false;
      element.textContent = value;
    } else {
      element.hidden = true;
    }
  }
}

function typeLabel(type: LandmarkDisplayInfo["type"]): string {
  switch (type) {
    case "landmark":
      return "Landmark";
    case "poi":
      return "Poin";
    case "viewpoint":
      return "Titik Pandang";
    case "information":
      return "Informasi";
    case "discovery":
      return "Temuan";
  }
}