import * as THREE from "three";
import type { DevelopmentSceneConfig } from "../config/gameConfig";

export interface DevelopmentSceneHandles {
  update(deltaTime: number): void;
}

/**
 * Development-only test scene.
 *
 * These primitives exist purely to validate the engine foundation:
 * camera, lighting, depth, shadows, perspective, rendering and resize.
 * They are DEVELOPMENT PLACEHOLDERS ONLY and are NOT Tapaktuan content,
 * buildings, or landmarks.
 */
export function createDevelopmentScene(
  scene: THREE.Scene,
  config: DevelopmentSceneConfig,
): DevelopmentSceneHandles {
  scene.background = new THREE.Color(config.colors.background);

  if (config.fog.enabled) {
    scene.fog = new THREE.Fog(
      new THREE.Color(config.colors.fog),
      config.fog.near,
      config.fog.far,
    );
  }

  const hemisphereLight = new THREE.HemisphereLight(
    new THREE.Color(config.lights.hemisphere.sky),
    new THREE.Color(config.lights.hemisphere.ground),
    config.lights.hemisphere.intensity,
  );
  scene.add(hemisphereLight);

  const sky = config.lights.directional;
  const directionalLight = new THREE.DirectionalLight(
    new THREE.Color(sky.color),
    sky.intensity,
  );
  directionalLight.position.set(...sky.position);

  if (sky.castShadow) {
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(
      sky.shadowMapSize,
      sky.shadowMapSize,
    );
    directionalLight.shadow.camera.left = -sky.shadowBounds;
    directionalLight.shadow.camera.right = sky.shadowBounds;
    directionalLight.shadow.camera.top = sky.shadowBounds;
    directionalLight.shadow.camera.bottom = -sky.shadowBounds;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 40;
  }
  scene.add(directionalLight);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(config.groundSize, config.groundSize),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.colors.ground),
      roughness: 1,
      metalness: 0,
    }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  if (config.gridEnabled) {
    const grid = new THREE.GridHelper(
      config.gridSize,
      config.gridDivisions,
      new THREE.Color(config.colors.gridCenter),
      new THREE.Color(config.colors.gridLine),
    );
    grid.position.y = 0.01;
    scene.add(grid);
  }

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 20),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.colors.sphere),
      roughness: 0.45,
      metalness: 0.05,
    }),
  );
  sphere.position.set(1.6, 1, 0.4);
  sphere.castShadow = true;
  scene.add(sphere);

  const box = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 1.6, 1.6),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.colors.box),
      roughness: 0.7,
      metalness: 0,
    }),
  );
  box.position.set(-1.8, 0.8, 0.9);
  box.rotation.y = 0.4;
  box.castShadow = true;
  scene.add(box);

  const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.75, 0.28, 20, 48),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.colors.torus),
      roughness: 0.35,
      metalness: 0.1,
    }),
  );
  torus.position.set(0, 1.25, -2.2);
  torus.castShadow = true;
  scene.add(torus);

  return {
    update(deltaTime: number): void {
      if (!config.animateTestObject) return;
      torus.rotation.x += deltaTime * 0.4;
      torus.rotation.y += deltaTime * 0.25;
    },
  };
}