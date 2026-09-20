import * as THREE from "three";
import type { LandmarkColorsConfig, LandmarkPaletteConfig } from "../config/gameConfig";
import type { LandmarkDefinition, LandmarkType } from "./types";
import type {
  LandmarkMarkerState,
  LandmarkPieces,
} from "./Landmark";

export interface LandmarkFactoryOptions {
  /** Height above the landmark base for the ground icon. */
  iconOffset: number;
  iconScale: number;
  labelScale: number;
  markerColors: LandmarkColorsConfig;
  palette: LandmarkPaletteConfig;
}

const MARKER_STATES: readonly LandmarkMarkerState[] = [
  "undiscovered",
  "nearby",
  "discovered",
];

const MARKER_GLYPHS: Record<LandmarkMarkerState, string> = {
  undiscovered: "?",
  nearby: "!",
  discovered: "\u2713",
};

/**
 * Builds placeholder landmark visuals from procedural primitives — no asset
 * pipeline required. Shared materials/textures are created once and disposed
 * together; only landmark-local geometries and the name-label texture are
 * owned by the individual Landmark entity and disposed with it.
 */
export class LandmarkFactory {
  private readonly options: LandmarkFactoryOptions;

  private readonly ringByState: Record<LandmarkMarkerState, THREE.Material>;
  private readonly iconByState: Record<LandmarkMarkerState, THREE.SpriteMaterial>;
  private readonly baseMaterial: THREE.MeshStandardMaterial;
  private readonly accentMaterial: THREE.MeshStandardMaterial;

  private readonly sharedSpriteMaterials: THREE.SpriteMaterial[] = [];
  private readonly sharedTextures: THREE.Texture[] = [];

  constructor(options: LandmarkFactoryOptions) {
    this.options = options;

    this.baseMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(options.palette.base),
      roughness: 0.85,
      metalness: 0.05,
    });

    this.accentMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(options.palette.accent),
      roughness: 0.7,
      metalness: 0.1,
    });

    const ringByState = {} as Record<LandmarkMarkerState, THREE.Material>;
    const iconByState = {} as Record<LandmarkMarkerState, THREE.SpriteMaterial>;
    for (const state of MARKER_STATES) {
      ringByState[state] = new THREE.MeshBasicMaterial({
        color: new THREE.Color(options.markerColors[state]),
        transparent: true,
        opacity: 0.9,
      });
      const iconMaterial = this.createIconSpriteMaterial(
        MARKER_GLYPHS[state],
        options.markerColors[state],
      );
      iconByState[state] = iconMaterial;
      this.sharedSpriteMaterials.push(iconMaterial);
    }
    this.ringByState = ringByState;
    this.iconByState = iconByState;
  }

  get markerRingMaterials(): Record<LandmarkMarkerState, THREE.Material> {
    return this.ringByState;
  }

  get markerIconMaterials(): Record<LandmarkMarkerState, THREE.SpriteMaterial> {
    return this.iconByState;
  }

  create(definition: LandmarkDefinition, baseY: number): LandmarkPieces {
    const group = new THREE.Group();
    group.name = `landmark:${definition.id}`;
    group.position.set(definition.position.x, baseY, definition.position.z);

    const iconOffset = this.options.iconOffset;
    const scale = definition.scale ?? 1;

    const visual = buildTypeVisual(
      definition.type,
      this.baseMaterial,
      this.accentMaterial,
    );
    visual.scale.setScalar(scale);
    group.add(visual);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.48, 0.6, 32),
      this.ringByState.undiscovered,
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.04;
    ring.renderOrder = 100;
    group.add(ring);

    const icon = new THREE.Sprite(this.iconByState.undiscovered);
    icon.scale.setScalar(this.options.iconScale);
    icon.position.y = iconOffset;
    icon.renderOrder = 101;
    group.add(icon);

    const ownedGeometries: THREE.BufferGeometry[] = [];
    collectGeometries(visual, ownedGeometries);
    ownedGeometries.push(ring.geometry);

    let label: THREE.Sprite | null = null;
    let ownedTexture: THREE.Texture | null = null;
    if (definition.name) {
      ownedTexture = this.createLabelTexture(definition.name);
      const labelMaterial = new THREE.SpriteMaterial({
        map: ownedTexture,
        transparent: true,
        depthWrite: false,
      });
      label = new THREE.Sprite(labelMaterial);
      label.scale.set(this.options.labelScale, this.options.labelScale * 0.28, 1);
      label.position.y = iconOffset + 0.55;
      label.visible = false;
      label.renderOrder = 102;
      group.add(label);
    }

    return {
      group,
      ring,
      icon,
      label,
      ownedGeometries,
      ownedTexture,
    };
  }

  disposeShared(): void {
    this.ringByState.undiscovered.dispose();
    this.ringByState.nearby.dispose();
    this.ringByState.discovered.dispose();
    for (const material of this.sharedSpriteMaterials) {
      material.dispose();
    }
    for (const texture of this.sharedTextures) {
      texture.dispose();
    }
    this.baseMaterial.dispose();
    this.accentMaterial.dispose();
  }

  private createIconSpriteMaterial(
    glyph: string,
    color: string,
  ): THREE.SpriteMaterial {
    const texture = makeGlyphTexture(glyph, color);
    this.sharedTextures.push(texture);
    return new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
    });
  }

  private createLabelTexture(name: string): THREE.Texture {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 96;
    const context = canvas.getContext("2d");
    if (context) {
      context.font =
        'bold 44px "Segoe UI", system-ui, -apple-system, sans-serif';
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.lineWidth = 8;
      context.strokeStyle = "rgba(35, 45, 40, 0.85)";
      context.strokeText(name, 256, 52);
      context.fillStyle = "#f4f6f0";
      context.fillText(name, 256, 52);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  }
}

function buildTypeVisual(
  type: LandmarkType,
  baseMaterial: THREE.Material,
  accentMaterial: THREE.Material,
): THREE.Group {
  const group = new THREE.Group();

  const addMesh = (
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    x: number,
    y: number,
    z: number,
  ): void => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    group.add(mesh);
  };

  switch (type) {
    case "viewpoint": {
      addMesh(new THREE.CylinderGeometry(0.18, 0.24, 1.3, 8), baseMaterial, 0, 0.65, 0);
      addMesh(new THREE.ConeGeometry(0.42, 0.9, 16), accentMaterial, 0, 1.75, 0);
      break;
    }
    case "information": {
      addMesh(new THREE.BoxGeometry(0.12, 1.1, 0.12), baseMaterial, 0, 0.55, 0);
      addMesh(new THREE.BoxGeometry(0.95, 0.55, 0.08), accentMaterial, 0, 1.35, 0);
      break;
    }
    case "discovery": {
      addMesh(new THREE.CylinderGeometry(0.5, 0.55, 0.12, 12), baseMaterial, 0, 0.06, 0);
      addMesh(new THREE.SphereGeometry(0.4, 16, 12), accentMaterial, 0, 1.1, 0);
      break;
    }
    case "poi": {
      addMesh(new THREE.CylinderGeometry(0.1, 0.12, 0.9, 8), baseMaterial, 0, 0.45, 0);
      addMesh(new THREE.SphereGeometry(0.24, 14, 10), accentMaterial, 0, 1.05, 0);
      break;
    }
    case "landmark":
    default: {
      addMesh(new THREE.CylinderGeometry(0.55, 0.65, 0.35, 16), baseMaterial, 0, 0.175, 0);
      addMesh(new THREE.CylinderGeometry(0.28, 0.32, 1.2, 12), accentMaterial, 0, 0.95, 0);
      break;
    }
  }

  return group;
}

function collectGeometries(
  root: THREE.Object3D,
  out: THREE.BufferGeometry[],
): void {
  root.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      out.push(object.geometry);
    }
  });
}

function makeGlyphTexture(glyph: string, color: string): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  if (context) {
    context.beginPath();
    context.arc(64, 64, 58, 0, Math.PI * 2);
    context.fillStyle = "rgba(28, 36, 32, 0.82)";
    context.fill();
    context.font = 'bold 72px "Segoe UI", system-ui, sans-serif';
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = color;
    context.fillText(glyph, 64, 68);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}