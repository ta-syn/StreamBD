import { Channel } from "@/types";

const FAVORITES_KEY = "streambd_favorites";
const RECENT_KEY = "streambd_recent";
const VIEWS_KEY = "streambd_views";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getFavorites(): string[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addFavorite(id: string): void {
  if (!isBrowser()) return;
  const favs = getFavorites();
  if (!favs.includes(id)) {
    favs.push(id);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
  }
}

export function removeFavorite(id: string): void {
  if (!isBrowser()) return;
  const favs = getFavorites().filter((f) => f !== id);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

export function isFavorite(id: string): boolean {
  return getFavorites().includes(id);
}

export function toggleFavorite(id: string): void {
  if (isFavorite(id)) {
    removeFavorite(id);
  } else {
    addFavorite(id);
  }
}

export function clearAllFavorites(): void {
  if (!isBrowser()) return;
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([]));
}

export function addRecentChannel(channel: Channel): void {
  if (!isBrowser()) return;
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const recent: Channel[] = raw ? JSON.parse(raw) : [];
    const filtered = recent.filter((c) => c.id !== channel.id);
    filtered.unshift({ ...channel, lastWatched: Date.now() });
    localStorage.setItem(RECENT_KEY, JSON.stringify(filtered.slice(0, 10)));
  } catch {
    // silent
  }
}

export function removeRecentChannel(id: string): void {
  if (!isBrowser()) return;
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const recent: Channel[] = raw ? JSON.parse(raw) : [];
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.filter((c) => c.id !== id)));
  } catch {
    // silent
  }
}

export function getRecentChannels(): Channel[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function incrementView(id: string): void {
  if (!isBrowser()) return;
  try {
    const raw = localStorage.getItem(VIEWS_KEY);
    const views: Record<string, number> = raw ? JSON.parse(raw) : {};
    views[id] = (views[id] || 0) + 1;
    localStorage.setItem(VIEWS_KEY, JSON.stringify(views));
  } catch {
    // silent
  }
}

export function getViewCount(id: string): number {
  if (!isBrowser()) return 0;
  try {
    const raw = localStorage.getItem(VIEWS_KEY);
    if (!raw) return 0;
    const views: Record<string, number> = JSON.parse(raw);
    return views[id] || 0;
  } catch {
    return 0;
  }
}

export function getMostWatched(limit: number): string[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(VIEWS_KEY);
    if (!raw) return [];
    const views: Record<string, number> = JSON.parse(raw);
    return Object.entries(views)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);
  } catch {
    return [];
  }
}
