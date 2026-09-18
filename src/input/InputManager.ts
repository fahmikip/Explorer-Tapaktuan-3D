import type { Disposable } from "../core/types";
import type { InputState } from "./InputState";
import { KeyboardInput } from "./KeyboardInput";

/**
 * Input facade. Aggregates input sources into a single InputState read.
 * Future sources (TouchInput, GamepadInput, virtual joystick) plug in here
 * without changing PlayerController.
 */
export class InputManager implements Disposable {
  private readonly keyboard: KeyboardInput;

  constructor() {
    this.keyboard = new KeyboardInput();
  }

  getState(): InputState {
    return this.keyboard.read();
  }

  isKeyDown(code: string): boolean {
    return this.keyboard.isKeyDown(code);
  }

  dispose(): void {
    this.keyboard.dispose();
  }
}