import * as THREE from "three";
import type { GameConfig } from "../config/gameConfig";
import { EventBus } from "./EventBus";
import { Renderer } from "./Renderer";
import { SceneManager } from "./SceneManager";
import { AssetManager } from "./AssetManager";
import { CameraManager } from "../camera/CameraManager";
import { InputManager } from "../input/InputManager";
import { DebugUI } from "../ui/DebugUI";
import { WorldManager } from "../world/WorldManager";
import { Player } from "../player/Player";
import { PlayerController } from "../player/PlayerController";
import type { PlayerState } from "../player/PlayerState";
import type { DebugSnapshot, Disposable, LifecyclePhase, Size } from "./types";

export class GameInitializationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GameInitializationError";
  }
}

/**
 * Central application lifecycle and composition root.
 * Orchestrates systems; it does not hold implementation detail.
 */
export class Game implements Disposable {
  private readonly config: GameConfig;
  private readonly eventBus = new EventBus();
  private readonly clock = new THREE.Clock();
  private readonly playerState: PlayerState = {
    position: { x: 0, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    grounded: true,
    isMoving: false,
    isSprinting: false,
    yaw: 0,
  };
  private readonly extras: Record<string, string> = {};

  private renderer!: Renderer;
  private sceneManager!: SceneManager;
  private cameraManager!: CameraManager;
  private assetManager!: AssetManager;
  private inputManager!: InputManager;
  private world!: WorldManager;
  private player!: Player;
  private controller!: PlayerController;
  private debugUI: DebugUI | null = null;
  private resizeObserver: ResizeObserver | null = null;

  private canvas: HTMLCanvasElement | null = null;
  private animationFrameId: number | null = null;
  private running = false;
  private phase: LifecyclePhase = "created";

  constructor(config: GameConfig) {
    this.config = config;
  }

  get lifecyclePhase(): LifecyclePhase {
    return this.phase;
  }

  get isRunning(): boolean {
    return this.running;
  }

  get events(): EventBus {
    return this.eventBus;
  }

  get activeScene(): THREE.Scene | null {
    return this.sceneManager?.activeScene ?? null;
  }

  get activeCamera(): THREE.PerspectiveCamera | null {
    return this.cameraManager?.activeCamera ?? null;
  }

  get worldRoot(): THREE.Group | null {
    return this.world?.root ?? null;
  }

  get playerTransform(): THREE.Group | null {
    return this.player?.group ?? null;
  }

  get assets(): AssetManager | null {
    return this.assetManager ?? null;
  }

  initialize(): void {
    if (this.phase !== "created" && this.phase !== "stopped") {
      throw new GameInitializationError(
        `Cannot initialize from lifecycle phase "${this.phase}".`,
      );
    }

    const canvas = document.getElementById(this.config.canvasId);
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new GameInitializationError(
        `Canvas element "#${this.config.canvasId}" was not found.`,
      );
    }

    const app = document.getElementById(this.config.appId);
    if (!(app instanceof HTMLElement)) {
      throw new GameInitializationError(
        `Application root "#${this.config.appId}" was not found.`,
      );
    }

    this.canvas = canvas;
    this.renderer = new Renderer(this.config.renderer, canvas);
    this.sceneManager = new SceneManager();
    this.cameraManager = new CameraManager(this.config.camera, canvas);
    this.assetManager = new AssetManager();
    this.inputManager = new InputManager();

    this.world = new WorldManager(
      this.sceneManager.activeScene,
      this.config.world,
      {
        showGrid: this.config.debug.showGrid,
        showBounds: this.config.debug.showBounds,
      },
    );

    this.player = new Player(this.config.player);
    this.world.add(this.player.group);
    this.world.bounds.clampPosition(this.player.position);

    this.controller = new PlayerController(
      this.player,
      this.cameraManager.activeCamera,
      this.world.bounds,
      {
        groundHeight: this.config.world.groundHeight,
        onJump: () => this.eventBus.emit("player:jumped", undefined),
      },
    );

    this.cameraManager.setTarget(this.player.group);

    const uiRoot = document.getElementById(this.config.uiRootId);
    if (this.config.debug.enabled && uiRoot) {
      this.debugUI = new DebugUI(uiRoot, this.config.debug);
    }

    this.observeResize(app);
    this.handleResize();

    this.phase = "initialized";
    console.info("[Explore Tapaktuan 3D] Engine initialized.");
  }

  start(): void {
    if (this.phase !== "initialized" && this.phase !== "stopped") {
      throw new GameInitializationError(
        `Cannot start from lifecycle phase "${this.phase}".`,
      );
    }
    if (this.running) return;

    this.running = true;
    this.phase = "running";
    this.clock.start();
    this.eventBus.emit("game.started", undefined);
    this.requestFrame();
  }

  stop(): void {
    if (!this.running) return;

    this.running = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.phase = "stopped";
    this.eventBus.emit("game.stopped", undefined);
  }

  update(deltaTime: number): void {
    const input = this.inputManager.getState();
    this.controller.update(deltaTime, input);
    this.world.update(deltaTime);
    this.cameraManager.update(deltaTime);

    if (this.debugUI) {
      this.debugUI.update(this.buildSnapshot(deltaTime), this.buildExtras());
    }
  }

  render(): void {
    this.renderer.render(
      this.sceneManager.activeScene,
      this.cameraManager.activeCamera,
    );
  }

  handleResize(): void {
    const size = this.getViewportSize();
    this.renderer.setSize(size.width, size.height);
    this.cameraManager.updateAspect(size.width, size.height);
    this.eventBus.emit("resize", size);
  }

  getViewportSize(): Size {
    const rect = this.canvas?.getBoundingClientRect();
    return {
      width: rect?.width ?? 0,
      height: rect?.height ?? 0,
    };
  }

  dispose(): void {
    this.stop();

    this.resizeObserver?.disconnect();
    this.resizeObserver = null;

    this.inputManager.dispose();
    this.controller.dispose();
    this.player.dispose();
    this.cameraManager.dispose();
    this.world.dispose();
    this.debugUI?.dispose();
    this.debugUI = null;

    this.sceneManager.dispose();
    this.renderer.dispose();

    this.eventBus.emit("game.disposed", undefined);
    this.eventBus.dispose();
    this.phase = "disposed";
  }

  private requestFrame(): void {
    this.animationFrameId = requestAnimationFrame(this.tick);
  }

  private readonly tick = (): void => {
    if (!this.running) return;

    this.animationFrameId = requestAnimationFrame(this.tick);

    const deltaTime = Math.min(
      this.clock.getDelta(),
      this.config.maxDeltaTimeSeconds,
    );

    this.update(deltaTime);
    this.render();
  };

  private buildSnapshot(deltaTime: number): DebugSnapshot {
    const size = this.getViewportSize();
    return {
      running: this.running,
      deltaTime,
      elapsedSeconds: this.clock.elapsedTime,
      width: size.width,
      height: size.height,
      pixelRatio: this.renderer.getPixelRatio(),
      drawCalls: this.renderer.getDrawCallCount(),
      triangles: this.renderer.getTriangleCount(),
    };
  }

  private buildExtras(): Record<string, string> {
    this.player.snapshot(this.playerState);
    const state = this.playerState;

    this.extras["player pos"] =
      `${state.position.x.toFixed(1)}, ${state.position.y.toFixed(1)}, ${state.position.z.toFixed(1)}`;
    this.extras["velocity"] =
      `h ${Math.hypot(state.velocity.x, state.velocity.z).toFixed(1)} v ${state.velocity.y.toFixed(1)}`;
    this.extras["grounded"] = state.grounded ? "yes" : "no";
    this.extras["movement"] = state.isSprinting
      ? "sprinting"
      : state.isMoving
        ? "moving"
        : "idle";
    this.extras["facing"] = `${Math.round((state.yaw * 180) / Math.PI)}°`;

    return this.extras;
  }

  private observeResize(container: HTMLElement): void {
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(container);
  }
}