import type { Disposable } from "../core/types";
import type { InputState } from "./InputState";

const KEY_FORWARD = new Set(["KeyW", "ArrowUp"]);
const KEY_BACKWARD = new Set(["KeyS", "ArrowDown"]);
const KEY_LEFT = new Set(["KeyA", "ArrowLeft"]);
const KEY_RIGHT = new Set(["KeyD", "ArrowRight"]);
const KEY_SPRINT = new Set(["ShiftLeft", "ShiftRight"]);
const KEY_JUMP = "Space";

/**
 * Keyboard input source mapping raw key state to InputState.
 */
export class KeyboardInput implements Disposable {
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

  read(): InputState {
    const forward =
      this.pressed(KEY_FORWARD) ? 1 : 0;
    const backward =
      this.pressed(KEY_BACKWARD) ? 1 : 0;
    const left =
      this.pressed(KEY_LEFT) ? 1 : 0;
    const right =
      this.pressed(KEY_RIGHT) ? 1 : 0;

    return {
      moveX: right - left,
      moveZ: forward - backward,
      jump: this.isKeyDown(KEY_JUMP),
      sprint: this.pressed(KEY_SPRINT),
    };
  }

  private pressed(codes: ReadonlySet<string>): boolean {
    for (const code of codes) {
      if (this.keys.has(code)) return true;
    }
    return false;
  }

  dispose(): void {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    this.keys.clear();
  }
}