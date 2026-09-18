import type { PlayerConfig } from "../player/PlayerConfig";

/**
 * Centralized application configuration.
 * Values here should be adjusted from this file, not scattered through the codebase.
 */

export interface RendererConfig {
  antialias: boolean;
  alpha: boolean;
  pixelRatioCap: number;
  powerPreference: WebGLPowerPreference;
  shadowMapEnabled: boolean;
  toneMapping: "aces" | "none";
  toneMappingExposure: number;
}

export interface ThirdPersonCameraConfig {
  distance: number;
  height: number;
  lookAtHeight: number;
  smoothness: number;
  orbitEnabled: boolean;
  orbitSensitivity: number;
  defaultYaw: number;
  minPitch: number;
  maxPitch: number;
}

export interface CameraConfig {
  fov: number;
  near: number;
  far: number;
  thirdPerson: ThirdPersonCameraConfig;
}

export interface WorldBoundsConfig {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface WorldGroundConfig {
  color: string;
  roughness: number;
  metalness: number;
}

export interface WorldFogConfig {
  enabled: boolean;
  color: string;
  near: number;
  far: number;
}

export interface WorldLightsConfig {
  hemisphere: {
    sky: string;
    ground: string;
    intensity: number;
  };
  directional: {
    color: string;
    intensity: number;
    position: readonly [number, number, number];
    castShadow: boolean;
    shadowMapSize: number;
    shadowBounds: number;
  };
}

export interface WorldGridConfig {
  enabled: boolean;
  colorCenter: string;
  colorLine: string;
  divisions: number;
}

export interface WorldConfig {
  width: number;
  depth: number;
  groundHeight: number;
  bounds: WorldBoundsConfig;
  background: string;
  fog: WorldFogConfig;
  ground: WorldGroundConfig;
  lights: WorldLightsConfig;
  grid: WorldGridConfig;
}

export interface DebugConfig {
  enabled: boolean;
  fpsSmoothingFactor: number;
  showGrid: boolean;
  showBounds: boolean;
}

export interface GameConfig {
  canvasId: string;
  appId: string;
  uiRootId: string;
  maxDeltaTimeSeconds: number;
  renderer: RendererConfig;
  camera: CameraConfig;
  world: WorldConfig;
  player: PlayerConfig;
  debug: DebugConfig;
}

export const gameConfig: GameConfig = {
  canvasId: "game-canvas",
  appId: "app",
  uiRootId: "ui-root",
  maxDeltaTimeSeconds: 0.1,

  renderer: {
    antialias: true,
    alpha: false,
    pixelRatioCap: 2,
    powerPreference: "high-performance",
    shadowMapEnabled: true,
    toneMapping: "aces",
    toneMappingExposure: 1.0,
  },

  camera: {
    fov: 55,
    near: 0.1,
    far: 1000,
    thirdPerson: {
      distance: 6.5,
      height: 2.2,
      lookAtHeight: 1.3,
      smoothness: 6,
      orbitEnabled: true,
      orbitSensitivity: 0.004,
      defaultYaw: Math.PI,
      minPitch: -0.15,
      maxPitch: 1.15,
    },
  },

  world: {
    width: 80,
    depth: 80,
    groundHeight: 0,
    bounds: {
      minX: -38,
      maxX: 38,
      minZ: -38,
      maxZ: 38,
    },
    background: "#a7c6dd",
    fog: {
      enabled: true,
      color: "#cfe0ea",
      near: 55,
      far: 180,
    },
    ground: {
      color: "#b6b79e",
      roughness: 1,
      metalness: 0,
    },
    lights: {
      hemisphere: {
        sky: "#ffffff",
        ground: "#8fae9c",
        intensity: 0.75,
      },
      directional: {
        color: "#fff1d6",
        intensity: 2.4,
        position: [10, 16, 12],
        castShadow: true,
        shadowMapSize: 1024,
        shadowBounds: 32,
      },
    },
    grid: {
      enabled: true,
      colorCenter: "#7f96a0",
      colorLine: "#d7dfd8",
      divisions: 40,
    },
  },

  player: {
    capsuleRadius: 0.4,
    capsuleLength: 0.9,
    moveSpeed: 5.2,
    sprintMultiplier: 1.55,
    acceleration: 14,
    deceleration: 12,
    rotationSpeed: 12,
    gravity: 24,
    jumpForce: 8.6,
    spawnPosition: [0, 0, 6],
  },

  debug: {
    enabled: true,
    fpsSmoothingFactor: 0.1,
    showGrid: true,
    showBounds: false,
  },
};