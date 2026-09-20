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

export type QualityLevel = "low" | "medium" | "high";

export interface QualitySettings {
  terrainSegments: number;
  oceanSegments: number;
  vegetationMultiplier: number;
  rockMultiplier: number;
  shadowMapSize: number;
  pixelRatioCap: number;
}

export interface QualityConfig {
  default: QualityLevel;
  levels: Record<QualityLevel, QualitySettings>;
}

export interface TerrainConfig {
  maxHeight: number;
  falloffStart: number;
  falloffEnd: number;
  noiseWavelength: number;
  noiseAmplitude: number;
  noiseOctaves: number;
  beachHeight: number;
  grassHeight: number;
  hillHeight: number;
  colors: {
    sand: string;
    grass: string;
    hill: string;
    rock: string;
  };
}

export interface OceanConfig {
  height: number;
  size: number;
  color: string;
  roughness: number;
  metalness: number;
  waveAmplitude: number;
  waveFrequency: number;
  waveSpeed: number;
}

export interface VegetationTypeConfig {
  enabled: boolean;
  density: number;
  minHeight: number;
  maxHeight: number;
  slopeLimit: number;
  pathClearance: number;
  scaleMin: number;
  scaleMax: number;
}

export interface VegetationPaletteConfig {
  trunk: string;
  leaf: string;
  bush: string;
  grass: string;
}

export interface VegetationConfig {
  enabled: boolean;
  waterMargin: number;
  palm: VegetationTypeConfig;
  bush: VegetationTypeConfig;
  grass: VegetationTypeConfig;
  colors: VegetationPaletteConfig;
}

export interface RockConfig {
  enabled: boolean;
  density: number;
  waterMargin: number;
  slopeLimit: number;
  pathClearance: number;
  scaleMin: number;
  scaleMax: number;
  colors: readonly [string, string, string];
}

export interface PathDefinition {
  id: string;
  width: number;
  color: string;
  points: readonly (readonly [number, number])[];
}

export interface LandmarkColorsConfig {
  undiscovered: string;
  nearby: string;
  discovered: string;
}

export interface LandmarkPaletteConfig {
  base: string;
  accent: string;
}

export interface LandmarksConfig {
  defaultInteractionRadius: number;
  groundOffset: number;
  iconOffset: number;
  iconScale: number;
  labelScale: number;
  markerColors: LandmarkColorsConfig;
  palette: LandmarkPaletteConfig;
}

export interface DiscoveryConfig {
  /** Persist discovered landmark IDs to localStorage when true. */
  persist: boolean;
}

export interface PathConfig {
  enabled: boolean;
  heightOffset: number;
  step: number;
  paths: readonly PathDefinition[];
}

export interface AtmosphereConfig {
  skyEnabled: boolean;
  sky: {
    turbidity: number;
    rayleigh: number;
    mieCoefficient: number;
    mieDirectionalG: number;
    sunPosition: readonly [number, number, number];
  };
  background: string;
  fog: {
    enabled: boolean;
    color: string;
    near: number;
    far: number;
  };
  hemisphere: {
    sky: string;
    ground: string;
    intensity: number;
  };
  directional: {
    color: string;
    intensity: number;
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
  seed: number;
  bounds: WorldBoundsConfig;
  terrain: TerrainConfig;
  ocean: OceanConfig;
  vegetation: VegetationConfig;
  rocks: RockConfig;
  paths: PathConfig;
  landmarks: LandmarksConfig;
  atmosphere: AtmosphereConfig;
  grid: WorldGridConfig;
  quality: QualityConfig;
}

export interface DebugConfig {
  enabled: boolean;
  fpsSmoothingFactor: number;
  showGrid: boolean;
  showBounds: boolean;
  showDebugLandmarks: boolean;
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
  discovery: DiscoveryConfig;
}

const QUALITY_LEVELS: Record<QualityLevel, QualitySettings> = {
  low: {
    terrainSegments: 48,
    oceanSegments: 32,
    vegetationMultiplier: 0.5,
    rockMultiplier: 0.5,
    shadowMapSize: 0,
    pixelRatioCap: 1,
  },
  medium: {
    terrainSegments: 72,
    oceanSegments: 40,
    vegetationMultiplier: 0.75,
    rockMultiplier: 0.75,
    shadowMapSize: 512,
    pixelRatioCap: 1.5,
  },
  high: {
    terrainSegments: 96,
    oceanSegments: 48,
    vegetationMultiplier: 1,
    rockMultiplier: 1,
    shadowMapSize: 1024,
    pixelRatioCap: 2,
  },
};

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
    far: 5000,
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
    width: 120,
    depth: 120,
    seed: 12345,
    bounds: {
      minX: -38,
      maxX: 38,
      minZ: -38,
      maxZ: 38,
    },

    terrain: {
      maxHeight: 5,
      falloffStart: 0.25,
      falloffEnd: 0.6,
      noiseWavelength: 24,
      noiseAmplitude: 2.5,
      noiseOctaves: 3,
      beachHeight: 1.5,
      grassHeight: 3.8,
      hillHeight: 6,
      colors: {
        sand: "#e5d4a7",
        grass: "#7fae6d",
        hill: "#5f7a4a",
        rock: "#8d8578",
      },
    },

    ocean: {
      height: 0,
      size: 400,
      color: "#2f7fa6",
      roughness: 0.35,
      metalness: 0.05,
      waveAmplitude: 0.12,
      waveFrequency: 0.5,
      waveSpeed: 0.8,
    },

    vegetation: {
      enabled: true,
      waterMargin: 0.5,
      palm: {
        enabled: true,
        density: 0.008,
        minHeight: 0.3,
        maxHeight: 3,
        slopeLimit: 0.3,
        pathClearance: 1.5,
        scaleMin: 0.85,
        scaleMax: 1.3,
      },
      bush: {
        enabled: true,
        density: 0.02,
        minHeight: 0.3,
        maxHeight: 5,
        slopeLimit: 0.5,
        pathClearance: 1,
        scaleMin: 0.7,
        scaleMax: 1.4,
      },
      grass: {
        enabled: true,
        density: 0.06,
        minHeight: 0.2,
        maxHeight: 4.5,
        slopeLimit: 1,
        pathClearance: 1,
        scaleMin: 0.8,
        scaleMax: 1.5,
      },
      colors: {
        trunk: "#9c8360",
        leaf: "#3e8b46",
        bush: "#4c8f55",
        grass: "#8fc26a",
      },
    },

    rocks: {
      enabled: true,
      density: 0.006,
      waterMargin: 0.3,
      slopeLimit: 0.9,
      pathClearance: 0.8,
      scaleMin: 0.3,
      scaleMax: 1.6,
      colors: ["#a29c8f", "#87827a", "#6f6a63"],
    },

    paths: {
      enabled: true,
      heightOffset: 0.06,
      step: 1,
      paths: [
        {
          id: "coastal-walk",
          width: 2.4,
          color: "#cfb98b",
          points: [
            [26, -22],
            [15, -30],
            [0, -33],
            [-15, -30],
            [-28, -22],
            [-32, -8],
            [-28, 8],
            [-18, 18],
            [-5, 21],
            [8, 22],
            [20, 17],
            [28, 8],
            [31, -5],
            [30, -16],
          ],
        },
        {
          id: "hill-trail",
          width: 1.6,
          color: "#bfa878",
          points: [
            [-22, -6],
            [-16, -4],
            [-8, -2],
            [0, 2],
            [6, 7],
          ],
        },
        {
          id: "beach-spine",
          width: 2,
          color: "#cfb98b",
          points: [
            [-30, 4],
            [-14, 2],
            [4, 1],
            [20, -2],
            [34, -8],
          ],
        },
      ],
    },

    landmarks: {
      defaultInteractionRadius: 5,
      groundOffset: 0.03,
      iconOffset: 1.7,
      iconScale: 0.6,
      labelScale: 2.1,
      markerColors: {
        undiscovered: "#f5e9a0",
        nearby: "#ffd55a",
        discovered: "#8fd6a0",
      },
      palette: {
        base: "#cdb48a",
        accent: "#7fae6d",
      },
    },

    atmosphere: {
      skyEnabled: true,
      sky: {
        turbidity: 8,
        rayleigh: 2,
        mieCoefficient: 0.005,
        mieDirectionalG: 0.8,
        sunPosition: [150, 60, 100],
      },
      background: "#a8c8e8",
      fog: {
        enabled: true,
        color: "#c9dde8",
        near: 80,
        far: 260,
      },
      hemisphere: {
        sky: "#cfe6ff",
        ground: "#9aa880",
        intensity: 0.8,
      },
      directional: {
        color: "#fff1e0",
        intensity: 3.2,
        shadowBounds: 46,
      },
    },

    grid: {
      enabled: true,
      colorCenter: "#7f96a0",
      colorLine: "#d7dfd8",
      divisions: 60,
    },

    quality: {
      default: "high",
      levels: QUALITY_LEVELS,
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
    showDebugLandmarks: true,
  },

  discovery: {
    persist: true,
  },
};