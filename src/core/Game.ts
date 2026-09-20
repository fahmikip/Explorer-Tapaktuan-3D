import * as THREE from "three";
import type { GameConfig } from "../config/gameConfig";
import { EventBus } from "./EventBus";
import { Renderer } from "./Renderer";
import { SceneManager } from "./SceneManager";
import { AssetManager } from "./AssetManager";
import { CameraManager } from "../camera/CameraManager";
import { InputManager } from "../input/InputManager";
import { createIdentityInputState } from "../input/InputState";
import type { InputState } from "../input/InputState";
import { DebugUI } from "../ui/DebugUI";
import { WorldManager } from "../world/WorldManager";
import { Player } from "../player/Player";
import { PlayerController } from "../player/PlayerController";
import type { PlayerState } from "../player/PlayerState";
import type { DebugSnapshot, Disposable, LifecyclePhase, Size } from "./types";
import { LandmarkDataLoader } from "../data/LandmarkDataLoader";
import { LandmarkRegistry } from "../landmarks/LandmarkRegistry";
import { LandmarkFactory } from "../landmarks/LandmarkFactory";
import { LandmarkManager } from "../landmarks/LandmarkManager";
import type { LandmarkDisplayInfo } from "../landmarks/types";
import { InteractionManager } from "../interaction/InteractionManager";
import { DiscoveryManager } from "../discovery/DiscoveryManager";
import { LocalStorageDiscoveryStorage, MemoryDiscoveryStorage } from "../discovery/DiscoveryStorage";
import { InteractionHint } from "../ui/InteractionHint";
import { LandmarkInfoPanel } from "../ui/LandmarkInfoPanel";

/** Gameplay input while a UI overlay (e.g. info panel) is open. */
const LOCKED_INPUT: InputState = createIdentityInputState();

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

  private landmarkRegistry: LandmarkRegistry | null = null;
  private landmarkFactory: LandmarkFactory | null = null;
  private landmarkManager: LandmarkManager | null = null;
  private interactionManager: InteractionManager | null = null;
  private discoveryManager: DiscoveryManager | null = null;
  private hint: InteractionHint | null = null;
  private panel: LandmarkInfoPanel | null = null;

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

    const quality =
      this.config.world.quality.levels[this.config.world.quality.default];
    this.renderer.setPixelRatioCap(quality.pixelRatioCap);

    this.world = new WorldManager(
      this.sceneManager.activeScene,
      this.config.world,
      {
        quality,
        showGrid: this.config.debug.enabled && this.config.debug.showGrid,
        showBounds: this.config.debug.enabled && this.config.debug.showBounds,
      },
    );

    this.player = new Player(this.config.player);
    this.world.add(this.player.group);
    this.world.bounds.clampPosition(this.player.position);
    this.player.position.y = this.world.collisionHeightAt(
      this.player.position.x,
      this.player.position.z,
    );

    this.controller = new PlayerController(
      this.player,
      this.cameraManager.activeCamera,
      this.world.bounds,
      {
        groundHeightAt: (x: number, z: number) =>
          this.world.collisionHeightAt(x, z),
        onJump: () => this.eventBus.emit("player:jumped", undefined),
      },
    );

    this.cameraManager.setTarget(this.player.group);

    this.interactionManager = new InteractionManager({
      onTargetChange: (target) => {
        this.eventBus.emit(
          "interaction:target-changed",
          target
            ? {
                id: target.id,
                label: target.getInteractionLabel?.() ?? "Interaksi",
              }
            : null,
        );
      },
    });

    const loader = new LandmarkDataLoader();
    const loadResult = loader.load();
    if (loadResult.issues.length > 0) {
      console.warn(
        "[Explore Tapaktuan 3D] Landmark data issues:",
        loadResult.issues,
      );
    }
    this.landmarkRegistry = new LandmarkRegistry(loadResult);

    this.discoveryManager = new DiscoveryManager(
      this.eventBus,
      this.config.discovery.persist
        ? new LocalStorageDiscoveryStorage()
        : new MemoryDiscoveryStorage(),
    );

    this.landmarkFactory = new LandmarkFactory({
      iconOffset: this.config.world.landmarks.iconOffset,
      iconScale: this.config.world.landmarks.iconScale,
      labelScale: this.config.world.landmarks.labelScale,
      markerColors: this.config.world.landmarks.markerColors,
      palette: this.config.world.landmarks.palette,
    });

    const landmarkConfig = this.config.world.landmarks;
    const allowTestData =
      this.config.debug.enabled &&
      this.config.debug.showDebugLandmarks &&
      import.meta.env.DEV;

    this.landmarkManager = new LandmarkManager({
      registry: this.landmarkRegistry,
      factory: this.landmarkFactory,
      interaction: this.interactionManager,
      discovery: this.discoveryManager,
      eventBus: this.eventBus,
      world: this.world,
      defaultInteractionRadius: landmarkConfig.defaultInteractionRadius,
      groundOffset: landmarkConfig.groundOffset,
      allowTestData,
      showLabels: allowTestData,
    });

    const uiRoot = document.getElementById(this.config.uiRootId);
    if (this.config.debug.enabled && uiRoot) {
      this.debugUI = new DebugUI(uiRoot, this.config.debug);
    }
    if (uiRoot) {
      this.hint = new InteractionHint(uiRoot);
      this.panel = new LandmarkInfoPanel(uiRoot);
    }

    this.eventBus.on("landmark:interacted", this.handleLandmarkInteracted);
    this.eventBus.on(
      "interaction:target-changed",
      this.handleInteractionTargetChanged,
    );

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
    const raw = this.inputManager.getState();
    const panelOpen = this.panel?.isOpen ?? false;
    const input = panelOpen ? LOCKED_INPUT : raw;
    this.controller.update(deltaTime, input);
    this.world.update(deltaTime);
    this.landmarkManager?.update(
      deltaTime,
      raw.interact,
      !panelOpen,
      this.player.position.x,
      this.player.position.z,
    );
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
    this.landmarkManager?.dispose();
    this.landmarkFactory?.disposeShared();
    this.discoveryManager?.dispose();
    this.interactionManager?.dispose();
    this.eventBus.off("landmark:interacted", this.handleLandmarkInteracted);
    this.eventBus.off(
      "interaction:target-changed",
      this.handleInteractionTargetChanged,
    );
    this.panel?.dispose();
    this.hint?.dispose();
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

    this.extras["terrain h"] = this.world
      .getHeightAt(state.position.x, state.position.z)
      .toFixed(2);
    this.extras["ocean h"] = `${this.world.oceanHeight.toFixed(2)}`;
    this.extras["seed"] = `${this.world.seed}`;
    this.extras["quality"] = this.config.world.quality.default;
    this.extras["veg instances"] = `${this.world.vegetationCount}`;
    this.extras["rocks"] = `${this.world.rockCount}`;
    this.extras["paths"] = `${this.world.pathCount}`;

    this.extras["landmarks"] = `${this.landmarkManager?.visibleCount ?? 0}`;
    this.extras["discovered"] = `${this.discoveryManager?.count ?? 0}`;

    return this.extras;
  }

  private readonly handleLandmarkInteracted = (payload: {
    landmarkId: string;
  }): void => {
    const definition = this.landmarkRegistry?.getById(payload.landmarkId);
    if (!definition || !this.panel) return;
    const info: LandmarkDisplayInfo = {
      id: definition.id,
      name: definition.name,
      type: definition.type,
      shortDescription: definition.shortDescription,
      description: definition.description,
      source: definition.source,
      isTestData: definition.isTestData,
      discovered: this.discoveryManager?.isDiscovered(definition.id) ?? false,
    };
    this.panel.open(info);
  };

  private readonly handleInteractionTargetChanged = (
    payload: { id: string; label: string } | null,
  ): void => {
    this.hint?.setTarget(payload?.label ?? null);
  };

  private observeResize(container: HTMLElement): void {
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(container);
  }
}