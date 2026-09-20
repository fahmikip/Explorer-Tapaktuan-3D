import * as THREE from "three";
import type {
  WorldBoundsConfig,
  WorldGridConfig,
} from "../config/gameConfig";
import type { Disposable } from "../core/types";

interface WorldDebugHelperOptions {
  showGrid: boolean;
  showBounds: boolean;
  seaLevel: number;
  grid?: WorldGridConfig | null;
}

/**
 * Development-only world helpers: grid and play-area bounds marker.
 * Never shown in production (gated by debug config).
 */
export class WorldDebugHelper implements Disposable {
  private readonly grid: THREE.GridHelper | null = null;
  private readonly boundsLine: THREE.LineLoop | null = null;
  private readonly boundsGeometry: THREE.BufferGeometry | null = null;
  private readonly boundsMaterial: THREE.LineBasicMaterial | null = null;

  constructor(
    root: THREE.Object3D,
    boundsConfig: WorldBoundsConfig,
    size: number,
    options: WorldDebugHelperOptions,
  ) {
    const y = options.seaLevel + 0.02;

    if (options.showGrid && options.grid?.enabled) {
      this.grid = new THREE.GridHelper(
        size,
        options.grid.divisions,
        new THREE.Color(options.grid.colorCenter),
        new THREE.Color(options.grid.colorLine),
      );
      this.grid.position.y = y;
      this.grid.name = "debugGrid";
      root.add(this.grid);
    }

    if (options.showBounds) {
      const points = [
        new THREE.Vector3(boundsConfig.minX, y, boundsConfig.minZ),
        new THREE.Vector3(boundsConfig.maxX, y, boundsConfig.minZ),
        new THREE.Vector3(boundsConfig.maxX, y, boundsConfig.maxZ),
        new THREE.Vector3(boundsConfig.minX, y, boundsConfig.maxZ),
      ];
      this.boundsGeometry = new THREE.BufferGeometry().setFromPoints(points);
      this.boundsMaterial = new THREE.LineBasicMaterial({ color: "#ffb36b" });
      this.boundsLine = new THREE.LineLoop(this.boundsGeometry, this.boundsMaterial);
      this.boundsLine.name = "debugBounds";
      root.add(this.boundsLine);
    }
  }

  dispose(): void {
    this.grid?.removeFromParent();
    this.grid?.geometry.dispose();
    this.boundsLine?.removeFromParent();
    this.boundsGeometry?.dispose();
    this.boundsMaterial?.dispose();
  }
}