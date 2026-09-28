import type { Disposable } from "../core/types";
import type { EventBus } from "../core/EventBus";
import { NPC } from "./NPC";
import { NPCFactory } from "./NPCFactory";
import { NPCRegistry } from "./NPCRegistry";
import type { InteractionManager } from "../interaction/InteractionManager";
import type { WorldManager } from "../world/WorldManager";

export interface NPCManagerOptions {
  registry: NPCRegistry;
  factory: NPCFactory;
  interaction: InteractionManager;
  eventBus: EventBus;
  world: WorldManager;
  defaultInteractionRadius: number;
  groundOffset: number;
  /** Distance beyond which (squared) an NPC is hidden. */
  visibilityDistance: number;
  /** Whether test NPCs may render this session (dev gate only). */
  allowTestData: boolean;
}

/**
 * Spawns the selected NPC set into the world, aligns them to terrain, keeps
 * them visible within a maximum distance, forwards interactions to the event
 * bus, and reflects dialogue state on the talking NPC. Owns no content and no
 * dialogue logic.
 */
export class NPCManager implements Disposable {
  private readonly options: NPCManagerOptions;
  private readonly npcs: NPC[] = [];
  private talkingNpcId: string | null = null;
  private disposed = false;

  private readonly onDialogueStarted = (payload: {
    dialogueId: string;
    npcId?: string;
  }): void => {
    if (!payload.npcId) return;
    const npc = this.find(payload.npcId);
    if (npc) {
      this.talkingNpcId = payload.npcId;
      npc.setState("talking");
    }
  };

  private readonly onDialogueEnded = (): void => {
    if (this.talkingNpcId) {
      this.find(this.talkingNpcId)?.setState("idle");
      this.talkingNpcId = null;
    }
  };

  constructor(options: NPCManagerOptions) {
    this.options = options;
    this.spawn();
    options.eventBus.on("dialogue:started", this.onDialogueStarted);
    options.eventBus.on("dialogue:closed", this.onDialogueEnded);
    options.eventBus.on("dialogue:completed", this.onDialogueEnded);
  }

  get visibleCount(): number {
    return this.npcs.length;
  }

  update(deltaTime: number, playerX: number, playerZ: number): void {
    const visibilitySquared = this.options.visibilityDistance ** 2;
    for (const npc of this.npcs) {
      npc.update(deltaTime);
      const dx = npc.group.position.x - playerX;
      const dz = npc.group.position.z - playerZ;
      const farAway = dx * dx + dz * dz > visibilitySquared;
      npc.group.visible = !farAway || npc.id === this.talkingNpcId;
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.options.eventBus.off("dialogue:started", this.onDialogueStarted);
    this.options.eventBus.off("dialogue:closed", this.onDialogueEnded);
    this.options.eventBus.off("dialogue:completed", this.onDialogueEnded);
    for (const npc of this.npcs) {
      this.options.interaction.remove(npc.id);
      this.options.world.remove(npc.group);
      npc.dispose();
    }
    this.npcs.length = 0;
  }

  private spawn(): void {
    const { options } = this;
    for (const definition of options.registry.selectVisible(options.allowTestData)) {
      const baseY =
        options.world.getHeightAt(
          definition.position.x,
          definition.position.z,
        ) + (definition.groundOffset ?? options.groundOffset);

      const pieces = options.factory.create(definition, baseY);
      const radius =
        definition.interactionRadius ?? options.defaultInteractionRadius;

      const npc = new NPC(
        pieces,
        definition,
        radius,
        () => this.handleInteract(definition.id),
      );

      options.world.add(npc.group);
      options.interaction.add(npc);
      this.npcs.push(npc);
    }
  }

  private find(id: string): NPC | undefined {
    for (const npc of this.npcs) {
      if (npc.id === id) return npc;
    }
    return undefined;
  }

  private handleInteract(npcId: string): void {
    this.options.eventBus.emit("npc:interacted", { npcId });
  }
}