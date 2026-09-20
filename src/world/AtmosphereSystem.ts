import * as THREE from "three";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import type { AtmosphereConfig, QualitySettings } from "../config/gameConfig";
import type { Disposable } from "../core/types";
import { WorldBounds } from "./WorldBounds";

interface AtmosphereOptions {
  quality: QualitySettings;
  bounds: WorldBounds;
}

/**
 * Atmosphere: procedural Sky dome, fog, ambient hemisphere light and the
 * directional sun. All parameters come from central config; shadows are
 * gated by the active quality level.
 */
export class AtmosphereSystem implements Disposable {
  private readonly scene: THREE.Scene;
  private readonly sky: Sky | null = null;
  private readonly lights: THREE.Light[] = [];
  private readonly sunDirection = new THREE.Vector3();

  constructor(
    scene: THREE.Scene,
    config: AtmosphereConfig,
    options: AtmosphereOptions,
  ) {
    this.scene = scene;

    const sunDirection = new THREE.Vector3(...config.sky.sunPosition).normalize();
    this.sunDirection.copy(sunDirection);

    scene.background = new THREE.Color(config.background);

    if (config.skyEnabled) {
      const sky = new Sky();
      sky.scale.setScalar(20000);
      const uniforms = (sky.material as THREE.ShaderMaterial).uniforms;
      uniforms.turbidity.value = config.sky.turbidity;
      uniforms.rayleigh.value = config.sky.rayleigh;
      uniforms.mieCoefficient.value = config.sky.mieCoefficient;
      uniforms.mieDirectionalG.value = config.sky.mieDirectionalG;
      uniforms.sunPosition.value.copy(sunDirection);
      scene.add(sky);
      this.sky = sky;
    }

    if (config.fog.enabled) {
      scene.fog = new THREE.Fog(
        new THREE.Color(config.fog.color),
        config.fog.near,
        config.fog.far,
      );
    }

    const hemisphere = new THREE.HemisphereLight(
      new THREE.Color(config.hemisphere.sky),
      new THREE.Color(config.hemisphere.ground),
      config.hemisphere.intensity,
    );
    scene.add(hemisphere);
    this.lights.push(hemisphere);

    const directional = new THREE.DirectionalLight(
      new THREE.Color(config.directional.color),
      config.directional.intensity,
    );
    directional.position.copy(sunDirection).multiplyScalar(40);

    if (options.quality.shadowMapSize > 0) {
      directional.castShadow = true;
      directional.shadow.mapSize.set(
        options.quality.shadowMapSize,
        options.quality.shadowMapSize,
      );
      const bounds = config.directional.shadowBounds;
      directional.shadow.camera.left = -bounds;
      directional.shadow.camera.right = bounds;
      directional.shadow.camera.top = bounds;
      directional.shadow.camera.bottom = -bounds;
      directional.shadow.camera.near = 1;
      directional.shadow.camera.far = 120;
      directional.shadow.bias = -0.0005;
    }

    scene.add(directional);
    this.lights.push(directional);
  }

  dispose(): void {
    if (this.sky) {
      this.sky.material.dispose();
      this.sky.removeFromParent();
    }
    for (const light of this.lights) {
      light.removeFromParent();
    }
    this.lights.length = 0;
    this.scene.background = null;
    this.scene.fog = null;
  }
}