/**
 * Persistence abstraction for discovery state. The rest of the system only
 * depends on this interface, so the storage strategy can be swapped later
 * (e.g. back-end sync) without touching gameplay code.
 */
export interface DiscoveryStorage {
  load(): readonly string[];
  store(ids: readonly string[]): void;
}

/** Non-persistent storage — resets every session. */
export class MemoryDiscoveryStorage implements DiscoveryStorage {
  private ids: string[] = [];

  load(): readonly string[] {
    return this.ids.slice();
  }

  store(ids: readonly string[]): void {
    this.ids = ids.slice();
  }
}

const LOCAL_STORAGE_KEY = "explore-tapaktuan:discovery:landmarks";

/**
 * localStorage-backed storage. All failures degrade safely to empty state
 * (quota, private browsing, disabled storage) — never a crash.
 */
export class LocalStorageDiscoveryStorage implements DiscoveryStorage {
  load(): readonly string[] {
    try {
      const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((item): item is string => typeof item === "string");
    } catch {
      return [];
    }
  }

  store(ids: readonly string[]): void {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // Persistence unavailable; session continues without it.
    }
  }
}