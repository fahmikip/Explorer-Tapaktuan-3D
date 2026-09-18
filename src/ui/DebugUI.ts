import type { DebugConfig } from "../config/gameConfig";
import type { DebugSnapshot, Disposable } from "../core/types";

/**
 * Lightweight development diagnostics overlay.
 * Development-oriented only; disabled entirely via gameConfig.debug.enabled.
 */
export class DebugUI implements Disposable {
  private readonly element: HTMLDivElement;
  private readonly rows = new Map<string, HTMLSpanElement>();
  private readonly smoothingFactor: number;
  private smoothedFps = 0;
  private frameCount = 0;

  constructor(container: HTMLElement, config: DebugConfig) {
    this.smoothingFactor = config.fpsSmoothingFactor;

    this.element = document.createElement("div");
    this.element.id = "debug-ui";

    const title = document.createElement("div");
    title.className = "debug-title";
    title.textContent = "Explore Tapaktuan 3D";
    this.element.appendChild(title);

    for (const key of [
      "status",
      "fps",
      "delta",
      "resolution",
      "pixel ratio",
      "draw calls",
      "triangles",
      "frame",
      "elapsed",
    ]) {
      const row = document.createElement("div");
      row.className = "debug-row";

      const label = document.createElement("span");
      label.className = "debug-label";
      label.textContent = key;

      const value = document.createElement("span");
      value.className = "debug-value";
      value.textContent = "—";

      row.appendChild(label);
      row.appendChild(value);
      this.element.appendChild(row);
      this.rows.set(key, value);
    }

    container.appendChild(this.element);
  }

  update(snapshot: DebugSnapshot): void {
    this.frameCount += 1;

    const instantFps = snapshot.deltaTime > 0 ? 1 / snapshot.deltaTime : 0;
    this.smoothedFps =
      this.smoothedFps === 0
        ? instantFps
        : instantFps * this.smoothingFactor +
          this.smoothedFps * (1 - this.smoothingFactor);

    this.set("status", snapshot.running ? "RUNNING" : "STOPPED");
    this.set("fps", `${this.smoothedFps.toFixed(1)}`);
    this.set("delta", `${(snapshot.deltaTime * 1000).toFixed(2)} ms`);
    this.set(
      "resolution",
      `${Math.round(snapshot.width)} × ${Math.round(snapshot.height)}`,
    );
    this.set("pixel ratio", `${snapshot.pixelRatio.toFixed(2)}`);
    this.set("draw calls", `${snapshot.drawCalls}`);
    this.set("triangles", `${snapshot.triangles}`);
    this.set("frame", `${this.frameCount}`);
    this.set("elapsed", `${snapshot.elapsedSeconds.toFixed(1)} s`);
  }

  private set(key: string, value: string): void {
    const cell = this.rows.get(key);
    if (cell) cell.textContent = value;
  }

  dispose(): void {
    this.element.remove();
    this.rows.clear();
  }
}