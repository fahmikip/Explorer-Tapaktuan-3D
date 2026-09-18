/**
 * Unified gameplay input state produced by any input source.
 * Consumed by PlayerController; independent of raw DOM/device events.
 */
export interface InputState {
  /** Strafe axis: -1 left, 1 right, 0 neutral. */
  moveX: number;
  /** Forward axis: -1 backward, 1 forward, 0 neutral. */
  moveZ: number;
  /** Jump requested (held). Edge handling lives in the consumer. */
  jump: boolean;
  /** Sprint requested (held). */
  sprint: boolean;
}

export function createIdentityInputState(): InputState {
  return {
    moveX: 0,
    moveZ: 0,
    jump: false,
    sprint: false,
  };
}