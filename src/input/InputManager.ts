import type { Disposable } from "../core/types";

/**
 * Minimal input boundary for future systems.
 *
 * Phase 1 only tracks keyboard state. Mouse, touch, joystick and camera
 * controls arrive with the player phase. No gameplay controls are processed.
 */
export class InputManager implements Disposable {
  private readonly keys = new Set<string>();

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    this.keys.add(event.code);
  };

  private readonly handleKeyUp = (event: KeyboardEvent): void => {
    this.keys.delete(event.code);
  };

  constructor() {
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  }

  isKeyDown(code: string): boolean {
    return this.keys.has(code);
  }

  get pressedKeys(): ReadonlySet<string> {
    return this.keys;
  }

  dispose(): void {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    this.keys.clear();
  }
}