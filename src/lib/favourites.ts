/**
 * The visitor's shortlist, kept in localStorage.
 *
 * Exposed as an external store so components can read it with
 * `useSyncExternalStore`. That gives three things a `useState` + `useEffect`
 * pair does not: no setState-in-effect cascade, a server snapshot that makes
 * hydration deterministic, and — most usefully — every heart on the page
 * updates together when any one of them is toggled.
 */

const STORAGE_KEY = "dengler.favourites";

let cache: string[] = [];
let cacheLoaded = false;

const listeners = new Set<() => void>();

function read(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    // Private browsing, disabled storage, or corrupted JSON. A shortlist is a
    // convenience — losing it must never take the page down with it.
    return [];
  }
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  // Keep tabs in sync with each other, not just components within a tab.
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      cache = read();
      cacheLoaded = true;
      emit();
    }
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * Must return a referentially stable value between changes, or
 * `useSyncExternalStore` will loop — hence the cache rather than a fresh read.
 */
export function getSnapshot(): string[] {
  if (!cacheLoaded) {
    cache = read();
    cacheLoaded = true;
  }
  return cache;
}

/** The server knows nothing about a browser's shortlist, so: empty. */
const SERVER_SNAPSHOT: string[] = [];
export function getServerSnapshot(): string[] {
  return SERVER_SNAPSHOT;
}

export function toggleFavourite(id: string): void {
  const current = getSnapshot();
  cache = current.includes(id)
    ? current.filter((item) => item !== id)
    : [...current, id];
  cacheLoaded = true;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Storage unavailable — the toggle still applies for this session.
  }

  emit();
}
