import * as THREE from "three";
import type {
  QualitySettings,
  WorldConfig,
} from "../config/gameConfig";
import type { Disposable } from "../core/types";
import { AtmosphereSystem } from "./AtmosphereSystem";
import { OceanSystem } from "./OceanSystem";
import { PathSystem } from "./PathSystem";
import { RockSystem } from "./RockSystem";
import { TerrainSystem } from "./TerrainSystem";
import { VegetationSystem } from "./VegetationSystem";
import { WorldBounds } from "./WorldBounds";
import { WorldDebugHelper } from "./WorldDebugHelper";

export interface WorldManagerOptions {
  quality: QualitySettings;
  showGrid: boolean;
  showBounds: boolean;
}

const WORLD_ROOT_NAME = "worldRoot";

/**
 * World orchestration layer. Owns the ordered environment systems and keeps
 * them modular — subsystems hold their own geometry, placement and cleanup.
 * WorldManager only wires them under a single worldRoot.
 */
export class WorldManager implements Disposable {
  readonly root: THREE.Group;
  readonly bounds: WorldBounds;
  readonly quality: QualitySettings;
  readonly seed: number;

  private readonly terrain: TerrainSystem;
  private readonly ocean: OceanSystem;
  private readonly paths: PathSystem;
  private readonly vegetation: VegetationSystem;
  private readonly rocks: RockSystem;
  private readonly atmosphere: AtmosphereSystem;
  private readonly debug: WorldDebugHelper;

  constructor(
    scene: THREE.Scene,
    config: WorldConfig,
    options: WorldManagerOptions,
  ) {
    this.quality = options.quality;
    this.seed = config.seed;
    this.bounds = new WorldBounds(config.bounds);

    this.terrain = new TerrainSystem(
      config.terrain,
      config.seed,
      config.width,
      config.depth,
      options.quality.terrainSegments,
    );

    this.ocean = new OceanSystem(
      config.ocean,
      options.quality.oceanSegments,
    );

    this.paths = new PathSystem(config.paths, this.terrain);

    this.vegetation = new VegetationSystem(
      config.vegetation,
      this.terrain,
      this.ocean,
      this.paths,
      this.bounds,
      config.seed,
      options.quality.vegetationMultiplier,
    );

    this.rocks = new RockSystem(
      config.rocks,
      this.terrain,
      this.ocean,
      this.paths,
      this.bounds,
      config.seed,
      options.quality.rockMultiplier,
    );

    this.atmosphere = new AtmosphereSystem(scene, config.atmosphere, {
      quality: options.quality,
      bounds: this.bounds,
    });

    this.root = new THREE.Group();
    this.root.name = WORLD_ROOT_NAME;
    this.root.add(this.terrain.mesh);
    this.root.add(this.ocean.mesh);
    for (const mesh of this.vegetation.meshes) {
      this.root.add(mesh);
    }
    this.root.add(this.rocks.mesh);
    scene.add(this.root);

    this.debug = new WorldDebugHelper(this.root, config.bounds, Math.max(config.width, config.depth), {
      showGrid: options.showGrid,
      showBounds: options.showBounds,
      seaLevel: config.ocean.height,
      grid: config.grid,
    });
  }

  /**
   * Raw terrain elevation. Use for world building (props, paths, systems).
   */
  getHeightAt(x: number, z: number): number {
    return this.terrain.getHeightAt(x, z);
  }

  /**
   * Surface height the player can stand on. Terrain, clamped at sea level so
   * the player cannot sink or walk into open water beyond the shoreline.
   */
  collisionHeightAt(x: number, z: number): number {
    return Math.max(this.terrain.getHeightAt(x, z), this.ocean.height);
  }

  getTerrainSlopeAt(x: number, z: number): number {
    return this.terrain.getSlopeAt(x, z);
  }

  get vegetationCount(): number {
    return this.vegetation.instanceCount;
  }

  get rockCount(): number {
    return this.rocks.instanceCount;
  }

  get pathCount(): number {
    return this.paths.pathCount;
  }

  get oceanHeight(): number {
    return this.ocean.height;
  }

  byName(name: string): THREE.Object3D | null {
    return this.root.getObjectByName(name) ?? null;
  }

  add(object: THREE.Object3D): void {
    this.root.add(object);
  }

  remove(object: THREE.Object3D): void {
    this.root.remove(object);
  }

  update(deltaTime: number): void {
    this.ocean.update(deltaTime);
    this.paths.update(deltaTime);
    this.vegetation.update(deltaTime);
    this.rocks.update(deltaTime);
  }

  dispose(): void {
    this.debug.dispose();
    this.root.removeFromParent();

    this.rocks.dispose();
    this.vegetation.dispose();
    this.paths.dispose();
    this.ocean.dispose();
    this.terrain.dispose();
    this.atmosphere.dispose();

    this.bounds.dispose();
  }
}