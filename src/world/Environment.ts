import * as THREE from "three";
import type { WorldConfig } from "../config/gameConfig";
import type { Disposable } from "../core/types";

/**
 * Basic world environment: background, fog, and lighting.
 * Placeholder only — no Tapaktuan-specific environment.
 */
export class Environment implements Disposable {
  private readonly lights: THREE.Light[] = [];

  constructor(scene: THREE.Scene, config: WorldConfig) {
    scene.background = new THREE.Color(config.background);

    if (config.fog.enabled) {
      scene.fog = new THREE.Fog(
        new THREE.Color(config.fog.color),
        config.fog.near,
        config.fog.far,
      );
    }

    const hemisphere = new THREE.HemisphereLight(
      new THREE.Color(config.lights.hemisphere.sky),
      new THREE.Color(config.lights.hemisphere.ground),
      config.lights.hemisphere.intensity,
    );
    this.lights.push(hemisphere);

    const directional = config.lights.directional;
    const sun = new THREE.DirectionalLight(
      new THREE.Color(directional.color),
      directional.intensity,
    );
    sun.position.set(...directional.position);

    if (directional.castShadow) {
      sun.castShadow = true;
      sun.shadow.mapSize.set(directional.shadowMapSize, directional.shadowMapSize);
      const bounds = directional.shadowBounds;
      sun.shadow.camera.left = -bounds;
      sun.shadow.camera.right = bounds;
      sun.shadow.camera.top = bounds;
      sun.shadow.camera.bottom = -bounds;
      sun.shadow.camera.near = 0.5;
      sun.shadow.camera.far = 60;
    }
    this.lights.push(sun);

    for (const light of this.lights) {
      scene.add(light);
    }
  }

  dispose(): void {
    for (const light of this.lights) {
      light.removeFromParent();
    }
    this.lights.length = 0;
  }
}