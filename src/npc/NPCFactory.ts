import * as THREE from "three";
import type { NpcPaletteConfig } from "../config/gameConfig";
import type { NPCDefinition } from "./types";
import type { NPCPieces } from "./NPC";

/**
 * Builds placeholder low-poly humanoids from procedural primitives and SHARED
 * asset resources — one geometry + one material per body part across ALL
 * NPCs. The factory owns those shared resources and disposes them together;
 * individual NPC entities own nothing.
 */
export class NPCFactory {
  private readonly skinMaterial: THREE.MeshStandardMaterial;
  private readonly shirtMaterial: THREE.MeshStandardMaterial;
  private readonly pantsMaterial: THREE.MeshStandardMaterial;

  private readonly bodyGeometry: THREE.CylinderGeometry;
  private readonly headGeometry: THREE.SphereGeometry;
  private readonly hatGeometry: THREE.ConeGeometry;

  constructor(palette: NpcPaletteConfig) {
    this.skinMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(palette.skin),
      roughness: 0.9,
      metalness: 0.0,
    });
    this.shirtMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(palette.shirt),
      roughness: 0.85,
      metalness: 0.0,
    });
    this.pantsMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(palette.pants),
      roughness: 0.95,
      metalness: 0.0,
    });

    this.bodyGeometry = new THREE.CylinderGeometry(0.24, 0.22, 0.62, 10);
    this.headGeometry = new THREE.SphereGeometry(0.21, 10, 8);
    this.hatGeometry = new THREE.ConeGeometry(0.26, 0.32, 10);
  }

  create(definition: NPCDefinition, baseY: number): NPCPieces {
    const group = new THREE.Group();
    group.name = `npc:${definition.id}`;
    group.position.set(definition.position.x, baseY, definition.position.z);

    const bobRoot = new THREE.Group();
    bobRoot.name = "bob-root";
    group.add(bobRoot);

    const scale = definition.scale ?? 1;
    bobRoot.scale.setScalar(scale);

    const body = new THREE.Mesh(this.bodyGeometry, this.shirtMaterial);
    body.position.y = 1.15;
    bobRoot.add(body);

    const pants = new THREE.Mesh(this.bodyGeometry, this.pantsMaterial);
    pants.scale.set(0.82, 1.2, 0.82);
    pants.position.y = 0.36;
    bobRoot.add(pants);

    const head = new THREE.Mesh(this.headGeometry, this.skinMaterial);
    head.position.y = 1.78;
    bobRoot.add(head);

    const hat = new THREE.Mesh(this.hatGeometry, this.pantsMaterial);
    hat.position.y = 2.0;
    bobRoot.add(hat);

    return { group, bobRoot };
  }

  disposeShared(): void {
    this.skinMaterial.dispose();
    this.shirtMaterial.dispose();
    this.pantsMaterial.dispose();
    this.bodyGeometry.dispose();
    this.headGeometry.dispose();
    this.hatGeometry.dispose();
  }
}