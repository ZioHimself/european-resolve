import "@testing-library/jest-dom/vitest";

// Node's native `localStorage` global (--experimental-webstorage) no-ops without
// --localstorage-file, shadowing jsdom's working implementation on the shared
// global object. Replace it with a minimal in-memory Storage so tests using
// localStorage behave the same as they would in a real browser.
if (typeof localStorage === "undefined" || typeof localStorage.setItem !== "function") {
  class MemoryStorage implements Storage {
    private store = new Map<string, string>();
    get length() {
      return this.store.size;
    }
    clear() {
      this.store.clear();
    }
    getItem(key: string) {
      return this.store.has(key) ? this.store.get(key)! : null;
    }
    key(index: number) {
      return Array.from(this.store.keys())[index] ?? null;
    }
    removeItem(key: string) {
      this.store.delete(key);
    }
    setItem(key: string, value: string) {
      this.store.set(key, String(value));
    }
  }

  Object.defineProperty(globalThis, "localStorage", {
    value: new MemoryStorage(),
    configurable: true,
    writable: true,
  });
}
