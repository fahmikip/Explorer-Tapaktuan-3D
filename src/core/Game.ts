import * as THREE from "three";
import type { GameConfig } from "../config/gameConfig";
import { EventBus } from "./EventBus";
import { Renderer } from "./Renderer";
import { SceneManager } from "./SceneManager";
import { AssetManager } from "./AssetManager";
import { CameraManager } from "../camera/CameraManager";
import { InputManager } from "../input/InputManager";
import { DebugUI } from "../ui/DebugUI";
import {
  createDevelopmentScene,
  type DevelopmentSceneHandles,
} from "../world/DevelopmentScene";
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

  private renderer!: Renderer;
  private sceneManager!: SceneManager;
  private cameraManager!: CameraManager;
  private assetManager!: AssetManager;
  private inputManager!: InputManager;
  private devScene: DevelopmentSceneHandles | null = null;
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

  get rendererInstance(): Renderer | null {
    return this.renderer ?? null;
  }

  get activeScene(): THREE.Scene | null {
    return this.sceneManager?.activeScene ?? null;
  }

  get activeCamera(): THREE.PerspectiveCamera | null {
    return this.cameraManager?.activeCamera ?? null;
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
    this.cameraManager = new CameraManager(this.config.camera);
    this.assetManager = new AssetManager();
    this.inputManager = new InputManager();
    this.devScene = createDevelopmentScene(
      this.sceneManager.activeScene,
      this.config.developmentScene,
    );

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
    this.devScene?.update(deltaTime);
    if (this.debugUI) {
      this.debugUI.update(this.buildSnapshot(deltaTime));
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
    this.debugUI?.dispose();
    this.debugUI = null;
    this.devScene = null;

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

  private observeResize(container: HTMLElement): void {
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(container);
  }
}