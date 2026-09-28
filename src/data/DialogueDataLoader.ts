import dialoguesJson from "../../data/dialogues.json";
import type { DataStatus } from "../core/types";
import type { DialogueDefinition, DialogueNode } from "../dialogue/types";

/**
 * Loads and validates dialogue data from /data (source of truth). Validates
 * the node graph (duplicate node ids, dangling next/choice targets, missing
 * speakers/text, orphans) and reports issues without throwing. An empty
 * dialogue dataset is valid.
 */
export interface DialogueValidationIssue {
  dialogueId?: string;
  nodeId?: string;
  message: string;
}

export interface DialogueLoadResult {
  version: number;
  definitions: DialogueDefinition[];
  issues: DialogueValidationIssue[];
}

const VALID_STATUSES: readonly DataStatus[] = [
  "draft",
  "review",
  "verified",
  "approved",
  "locked",
  "deprecated",
];

export class DialogueDataLoader {
  load(): DialogueLoadResult {
    return this.loadFromJson(dialoguesJson);
  }

  loadFromJson(input: unknown): DialogueLoadResult {
    if (!isRecord(input)) {
      return {
        version: 0,
        definitions: [],
        issues: [
          { message: "Dialogue data validation failed: root is not an object." },
        ],
      };
    }
    if (!Number.isInteger(input.version)) {
      return {
        version: 0,
        definitions: [],
        issues: [
          { message: "Dialogue data validation failed: missing or invalid integer 'version'." },
        ],
      };
    }
    const version = input.version as number;
    if (!Array.isArray(input.items)) {
      return {
        version,
        definitions: [],
        issues: [
          { message: "Dialogue data validation failed: 'items' must be an array." },
        ],
      };
    }

    const issues: DialogueValidationIssue[] = [];
    const definitions: DialogueDefinition[] = [];
    const seenDialogueIds = new Set<string>();

    for (const item of input.items) {
      if (!isRecord(item)) {
        issues.push({ message: "Dialogue item is not an object; skipped." });
        continue;
      }

      const dialogueLabel: string =
        typeof item.id === "string" ? item.id : "<unknown>";

      if (typeof item.id !== "string" || item.id.trim() === "") {
        issues.push({
          message: "Dialogue data validation failed: missing or empty 'id'.",
        });
        continue;
      }
      if (seenDialogueIds.has(String(item.id))) {
        issues.push({
          dialogueId: String(item.id),
          message: `Dialogue data validation failed: Duplicate ID: ${String(item.id)}`,
        });
        continue;
      }
      if (typeof item.status !== "string" || !(VALID_STATUSES as readonly string[]).includes(item.status)) {
        issues.push({
          dialogueId: dialogueLabel,
          message: `Invalid 'status' (expected one of: ${VALID_STATUSES.join(", ")})`,
        });
        continue;
      }
      if (!Array.isArray(item.nodes) || item.nodes.length === 0) {
        issues.push({
          dialogueId: dialogueLabel,
          message: "Dialogue data validation failed: 'nodes' must be a non-empty array.",
        });
        continue;
      }

      const dialogueIssues: DialogueValidationIssue[] = [];
      const nodes = validateNodes(item.nodes, dialogueLabel, dialogueIssues);

      const entryId = nodes.length > 0 ? nodes[0].id : undefined;
      if (entryId) {
        const orphanIds = collectOrphans(nodes, entryId);
        for (const orphan of orphanIds) {
          dialogueIssues.push({
            dialogueId: dialogueLabel,
            nodeId: orphan,
            message: `Dialogue data validation failed: Orphan node (not reachable from start): ${orphan}`,
          });
        }
      }

      if (dialogueIssues.length > 0) {
        issues.push(...dialogueIssues);
        continue;
      }

      seenDialogueIds.add(String(item.id));
      definitions.push({
        id: String(item.id),
        title: typeof item.title === "string" ? item.title : undefined,
        nodes,
      });
    }

    return { version, definitions, issues };
  }
}

function validateNodes(
  raw: unknown,
  dialogueLabel: string,
  issues: DialogueValidationIssue[],
): DialogueNode[] {
  const nodes: DialogueNode[] = [];
  const ids = new Set<string>();
  const list = raw as unknown[];

  for (const rawIndex of list) {
    const rawNode = rawIndex as Record<string, unknown> | undefined;
    if (!rawNode || typeof rawNode !== "object") {
      issues.push({ dialogueId: dialogueLabel, message: "Dialogue node is not an object; skipped." });
      continue;
    }

    const nodeId = typeof rawNode.id === "string" ? rawNode.id : "";
    const label = nodeId || "<unnamed>";

    if (nodeId === "") {
      issues.push({ dialogueId: dialogueLabel, message: "Dialogue node missing 'id'." });
      continue;
    }
    if (ids.has(nodeId)) {
      issues.push({
        dialogueId: dialogueLabel,
        nodeId,
        message: `Dialogue data validation failed: Duplicate node ID: ${nodeId}`,
      });
      continue;
    }
    if (typeof rawNode.speakerId !== "string" || rawNode.speakerId.trim() === "") {
      issues.push({ dialogueId: dialogueLabel, nodeId, message: `Node '${label}' missing speakerId.` });
      continue;
    }
    if (typeof rawNode.text !== "string" || rawNode.text.trim() === "") {
      issues.push({ dialogueId: dialogueLabel, nodeId, message: `Node '${label}' has empty dialogue text.` });
      continue;
    }

    let next: string | undefined;
    if (rawNode.next !== undefined) {
      if (typeof rawNode.next !== "string" || rawNode.next.trim() === "") {
        issues.push({ dialogueId: dialogueLabel, nodeId, message: `Node '${label}' has invalid 'next'.` });
        continue;
      }
      next = rawNode.next;
    }

    const choices = validateChoices(rawNode.choices, dialogueLabel, nodeId, label, issues);
    if (choices === null) continue;

    ids.add(nodeId);
    nodes.push({ id: nodeId, speakerId: String(rawNode.speakerId), text: String(rawNode.text), next, choices });
  }

  // Resolve references only after all node ids are known.
  const idSet = new Set(nodes.map((n) => n.id));
  for (const node of nodes) {
    if (node.next && !idSet.has(node.next)) {
      issues.push({
        dialogueId: dialogueLabel,
        nodeId: node.id,
        message: `Node '${node.id}' references missing next node '${node.next}'.`,
      });
    }
    for (const choice of node.choices ?? []) {
      if (!idSet.has(choice.next)) {
        issues.push({
          dialogueId: dialogueLabel,
          nodeId: node.id,
          message: `Choice '${choice.id}' references missing node '${choice.next}'.`,
        });
      }
    }
  }

  return nodes;
}

function validateChoices(
  raw: unknown,
  dialogueLabel: string,
  nodeId: string,
  nodeLabel: string,
  issues: DialogueValidationIssue[],
): DialogueNode["choices"] | null {
  if (raw === undefined) return undefined;
  if (!Array.isArray(raw)) {
    issues.push({ dialogueId: dialogueLabel, nodeId, message: `Node '${nodeLabel}' has non-array 'choices'.` });
    return null;
  }

  const choices: DialogueNode["choices"] = [];
  const choiceIds = new Set<string>();
  for (const rawChoice of raw) {
    const choice = rawChoice as Record<string, unknown> | undefined;
    if (!choice || typeof choice !== "object") {
      issues.push({ dialogueId: dialogueLabel, nodeId, message: `Node '${nodeLabel}' has a non-object choice.` });
      return null;
    }
    const id = typeof choice.id === "string" ? choice.id : "";
    if (id === "") {
      issues.push({ dialogueId: dialogueLabel, nodeId, message: `Node '${nodeLabel}' has a choice without 'id'.` });
      return null;
    }
    if (choiceIds.has(id)) {
      issues.push({ dialogueId: dialogueLabel, nodeId, message: `Node '${nodeLabel}' has duplicate choice id '${id}'.` });
      return null;
    }
    if (typeof choice.text !== "string" || choice.text.trim() === "") {
      issues.push({ dialogueId: dialogueLabel, nodeId, message: `Choice '${id}' is missing text.` });
      return null;
    }
    if (typeof choice.next !== "string" || choice.next.trim() === "") {
      issues.push({ dialogueId: dialogueLabel, nodeId, message: `Choice '${id}' is missing 'next'.` });
      return null;
    }
    choiceIds.add(id);
    choices.push({ id, text: String(choice.text), next: String(choice.next) });
  }
  return choices;
}

function collectOrphans(nodes: readonly DialogueNode[], entryId: string): string[] {
  const reachable = new Set<string>([entryId]);
  const stack = [entryId];
  const byId = new Map(nodes.map((n) => [n.id, n]));
  while (stack.length > 0) {
    const current = stack.pop()!;
    const node = byId.get(current);
    if (!node) continue;
    const targets: string[] = [];
    if (node.next) targets.push(node.next);
    for (const choice of node.choices ?? []) targets.push(choice.next);
    for (const target of targets) {
      if (!reachable.has(target)) {
        reachable.add(target);
        stack.push(target);
      }
    }
  }
  return nodes.map((n) => n.id).filter((id) => !reachable.has(id));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}