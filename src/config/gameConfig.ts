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

export interface CameraConfig {
  fov: number;
  near: number;
  far: number;
  position: readonly [number, number, number];
  lookAt: readonly [number, number, number];
}

export interface DevelopmentSceneConfig {
  groundSize: number;
  gridEnabled: boolean;
  gridSize: number;
  gridDivisions: number;
  animateTestObject: boolean;
  fog: {
    enabled: boolean;
    near: number;
    far: number;
  };
  colors: {
    background: string;
    fog: string;
    ground: string;
    sphere: string;
    box: string;
    torus: string;
    gridCenter: string;
    gridLine: string;
  };
  lights: {
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
  };
}

export interface DebugConfig {
  enabled: boolean;
  fpsSmoothingFactor: number;
}

export interface GameConfig {
  canvasId: string;
  appId: string;
  uiRootId: string;
  maxDeltaTimeSeconds: number;
  renderer: RendererConfig;
  camera: CameraConfig;
  developmentScene: DevelopmentSceneConfig;
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
    position: [0, 4.2, 9],
    lookAt: [0, 0.6, 0],
  },

  developmentScene: {
    groundSize: 30,
    gridEnabled: true,
    gridSize: 30,
    gridDivisions: 30,
    animateTestObject: true,
    fog: {
      enabled: true,
      near: 24,
      far: 80,
    },
    colors: {
      background: "#bfd4e4",
      fog: "#bfd4e4",
      ground: "#b8b495",
      sphere: "#d08a4e",
      box: "#4e7a8f",
      torus: "#c9d4d8",
      gridCenter: "#7f96a0",
      gridLine: "#d7dfd8",
    },
    lights: {
      hemisphere: {
        sky: "#ffffff",
        ground: "#9db8a6",
        intensity: 0.65,
      },
      directional: {
        color: "#fff1d6",
        intensity: 2.2,
        position: [6, 12, 9],
        castShadow: true,
        shadowMapSize: 1024,
        shadowBounds: 24,
      },
    },
  },

  debug: {
    enabled: true,
    fpsSmoothingFactor: 0.1,
  },
};