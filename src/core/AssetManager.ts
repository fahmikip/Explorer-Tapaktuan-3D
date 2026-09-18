import type { Disposable } from "./types";

/**
 * AssetManager foundation.
 *
 * Phase 1 only provides the resource registry/cache plus disposal hooks.
 * GLB / texture / audio loaders are introduced in the phase where the first
 * registered production assets are actually loaded — never before.
 */
export class AssetManager implements Disposable {
  private readonly cache = new Map<string, unknown>();

  register<T>(key: string, resource: T): void {
    this.cache.set(key, resource);
  }

  get<T>(key: string): T | undefined {
    return this.cache.get(key) as T | undefined;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  remove(key: string): void {
    this.cache.delete(key);
  }

  get size(): number {
    return this.cache.size;
  }

  dispose(): void {
    this.cache.clear();
  }
}