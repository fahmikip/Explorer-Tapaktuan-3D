import * as THREE from "three";
import type { RendererConfig } from "../config/gameConfig";
import type { Disposable } from "./types";

type ToneMappingMode = Exclude<RendererConfig["toneMapping"], undefined>;

function resolveToneMapping(mode: ToneMappingMode): THREE.ToneMapping {
  switch (mode) {
    case "aces":
      return THREE.ACESFilmicToneMapping;
    case "none":
      return THREE.NoToneMapping;
  }
}

/**
 * Dedicated WebGL renderer abstraction.
 * Owns the WebGLRenderer instance, size/pixel-ratio handling, and rendering.
 */
export class Renderer implements Disposable {
  private readonly renderer: THREE.WebGLRenderer;
  private pixelRatioCap: number;

  constructor(config: RendererConfig, canvas: HTMLCanvasElement) {
    this.pixelRatioCap = config.pixelRatioCap;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: config.antialias,
      alpha: config.alpha,
      powerPreference: config.powerPreference,
    });

    this.renderer.setPixelRatio(this.effectivePixelRatio());

    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = resolveToneMapping(config.toneMapping);
    this.renderer.toneMappingExposure = config.toneMappingExposure;

    this.renderer.shadowMap.enabled = config.shadowMapEnabled;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  /**
   * Re-apply pixel ratio against a new (lower quality) cap. Never uses more
   * than the renderer's configured cap.
   */
  setPixelRatioCap(cap: number): void {
    this.pixelRatioCap = Math.min(this.pixelRatioCap, cap);
    this.renderer.setPixelRatio(this.effectivePixelRatio());
  }

  private effectivePixelRatio(): number {
    return Math.min(window.devicePixelRatio || 1, this.pixelRatioCap);
  }

  get domElement(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  setSize(width: number, height: number): void {
    if (width <= 0 || height <= 0) return;
    this.renderer.setSize(width, height, false);
  }

  render(scene: THREE.Scene, camera: THREE.Camera): void {
    this.renderer.render(scene, camera);
  }

  getDrawingBufferSize(): THREE.Vector2 {
    return this.renderer.getDrawingBufferSize(new THREE.Vector2());
  }

  getPixelRatio(): number {
    return this.renderer.getPixelRatio();
  }

  getTriangleCount(): number {
    return this.renderer.info.render.triangles;
  }

  getDrawCallCount(): number {
    return this.renderer.info.render.calls;
  }

  dispose(): void {
    this.renderer.dispose();
  }
}