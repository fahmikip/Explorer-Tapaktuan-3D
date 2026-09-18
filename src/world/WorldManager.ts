import * as THREE from "three";
import type { WorldConfig } from "../config/gameConfig";
import type { Disposable } from "../core/types";
import { Environment } from "./Environment";
import { Ground } from "./Ground";
import { WorldBounds } from "./WorldBounds";

export interface WorldManagerOptions {
  showGrid: boolean;
  showBounds: boolean;
}

const WORLD_ROOT_NAME = "worldRoot";

/**
 * Owns the world container and its placeholder systems: ground, environment,
 * play-area bounds, and optional development helpers (grid / bounds lines).
 * All world objects live under `root`.
 */
export class WorldManager implements Disposable {
  readonly root: THREE.Group;
  readonly bounds: WorldBounds;

  private readonly ground: Ground;
  private readonly environment: Environment;
  private readonly grid: THREE.GridHelper | null = null;
  private readonly boundsLine: THREE.LineLoop | null = null;
  private readonly boundsLineGeometry: THREE.BufferGeometry | null = null;
  private readonly boundsLineMaterial: THREE.LineBasicMaterial | null = null;

  constructor(
    scene: THREE.Scene,
    config: WorldConfig,
    options: WorldManagerOptions,
  ) {
    this.bounds = new WorldBounds(config.bounds);
    this.ground = new Ground(config);
    this.environment = new Environment(scene, config);

    this.root = new THREE.Group();
    this.root.name = WORLD_ROOT_NAME;
    this.root.add(this.ground.mesh);

    if (options.showGrid && config.grid.enabled) {
      this.grid = new THREE.GridHelper(
        Math.max(config.width, config.depth),
        config.grid.divisions,
        new THREE.Color(config.grid.colorCenter),
        new THREE.Color(config.grid.colorLine),
      );
      this.grid.position.y = config.groundHeight + 0.01;
      this.root.add(this.grid);
    }

    if (options.showBounds) {
      const { boundsLine, geometry, material } =
        this.createBoundsVisualization(config);
      this.boundsLine = boundsLine;
      this.boundsLineGeometry = geometry;
      this.boundsLineMaterial = material;
      this.root.add(boundsLine);
    }

    scene.add(this.root);
  }

  add(object: THREE.Object3D): void {
    this.root.add(object);
  }

  remove(object: THREE.Object3D): void {
    this.root.remove(object);
  }

  update(deltaTime: number): void {
    // Placeholder — world simulation arrives in later phases.
    void deltaTime;
  }

  dispose(): void {
    this.boundsLineMaterial?.dispose();
    this.boundsLineGeometry?.dispose();
    this.boundsLine?.removeFromParent();

    this.grid?.geometry.dispose();

    const gridMaterial = this.grid?.material;
    if (gridMaterial) {
      if (Array.isArray(gridMaterial)) {
        for (const material of gridMaterial) material.dispose();
      } else {
        gridMaterial.dispose();
      }
    }
    this.grid?.removeFromParent();

    this.ground.dispose();
    this.environment.dispose();
    this.bounds.dispose();
    this.root.removeFromParent();
  }

  private createBoundsVisualization(
    config: WorldConfig,
  ): {
    boundsLine: THREE.LineLoop;
    geometry: THREE.BufferGeometry;
    material: THREE.LineBasicMaterial;
  } {
    const y = config.groundHeight + 0.02;
    const points = [
      new THREE.Vector3(config.bounds.minX, y, config.bounds.minZ),
      new THREE.Vector3(config.bounds.maxX, y, config.bounds.minZ),
      new THREE.Vector3(config.bounds.maxX, y, config.bounds.maxZ),
      new THREE.Vector3(config.bounds.minX, y, config.bounds.maxZ),
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: "#ffb36b" });
    const boundsLine = new THREE.LineLoop(geometry, material);
    boundsLine.name = "worldBoundsVisualization";
    return { boundsLine, geometry, material };
  }
}