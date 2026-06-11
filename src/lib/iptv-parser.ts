import { Channel, ChannelCategory } from "@/types";

export const PLAYLIST_URLS = {
  bangladesh: "/api/iptv?type=bangladesh",
  india: "/api/iptv?type=india",
  sports: "/api/iptv?type=sports",
  music: "/api/iptv?type=music",
  kids: "/api/iptv?type=kids",
  news: "/api/iptv?type=news",
};

const CACHE_KEY_PREFIX = "streambd_cache_";
const CACHE_TTL = 30 * 60 * 1000;

interface CacheEntry {
  channels: Channel[];
  timestamp: number;
}

function getCachedChannels(key: string): Channel[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + key);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY_PREFIX + key);
      return null;
    }
    return entry.channels;
  } catch {
    return null;
  }
}

function setCachedChannels(key: string, channels: Channel[]): void {
  if (typeof window === "undefined") return;
  try {
    const entry: CacheEntry = { channels, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(entry));
  } catch {
    // storage full, ignore
  }
}

export const RAW_PLAYLIST_URLS = {
  bangladesh: "https://iptv-org.github.io/iptv/countries/bd.m3u",
  india: "https://iptv-org.github.io/iptv/countries/in.m3u",
  sports: "https://iptv-org.github.io/iptv/categories/sports.m3u",
  music: "https://iptv-org.github.io/iptv/categories/music.m3u",
  kids: "https://iptv-org.github.io/iptv/categories/kids.m3u",
  news: "https://iptv-org.github.io/iptv/categories/news.m3u",
};

function mapGroupToCategory(group: string): ChannelCategory {
  const g = group.toLowerCase().trim();

  if (g.includes("bangladesh")) return "bangladesh";
  if (g.includes("bengali")) return "bengali";
  if (g.includes("hindi") || g.includes("entertainment")) return "hindi-entertainment";
  if (g.includes("movie") || g.includes("cinema")) return "hindi-movies";
  if (g.includes("sport")) return "sports";
  if (g.includes("news")) return "news";
  if (g.includes("music")) return "music";
  if (g.includes("kid") || g.includes("cartoon") || g.includes("animation"))
    return "cartoon";

  return "international";
}

function extractAttr(line: string, attr: string): string {
  const regex = new RegExp(`${attr}="(.*?)"`, "i");
  const match = line.match(regex);
  return match ? match[1] : "";
}

export async function parseM3U(url: string): Promise<Channel[]> {
  // Check cache
  const cacheKey = url.replace(/[^a-zA-Z0-9]/g, "_");
  const cached = getCachedChannels(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(url);
    if (!response.ok) return [];

    const text = await response.text();
    const lines = text.split("\n");
    const channels: Channel[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith("#EXTINF")) {
        const id = extractAttr(line, "tvg-id");
        const name = extractAttr(line, "tvg-name");
        const logo = extractAttr(line, "tvg-logo");
        const groupTitle = extractAttr(line, "group-title");

        let streamUrl = "";
        for (let j = i + 1; j < lines.length; j++) {
          const nextLine = lines[j].trim();
          if (nextLine && !nextLine.startsWith("#")) {
            streamUrl = nextLine;
            break;
          }
        }

        if (!streamUrl) continue;

        const displayName = name || line.split(",").pop()?.trim() || "Unknown";
        const category = mapGroupToCategory(groupTitle);

        channels.push({
          id: id || displayName.toLowerCase().replace(/\s+/g, "-"),
          name: displayName,
          logo: logo || "",
          streamUrl,
          category,
          country: category === "bangladesh" ? "BD" : "INTL",
          isLive: true,
          status: "unknown",
        });
      }
    }

    // Cache the result
    if (channels.length > 0) {
      setCachedChannels(cacheKey, channels);
    }

    return channels;
  } catch {
    return [];
  }
}

export function getChannelsByCategory(
  channels: Channel[],
  category: ChannelCategory
): Channel[] {
  return channels.filter((c) => c.category === category);
}

export function searchChannels(channels: Channel[], query: string): Channel[] {
  const q = query.toLowerCase().trim();
  if (!q) return channels;
  return channels.filter(
    (c) =>
      c.name.toLowerCase().includes(q) || c.category.includes(q)
  );
}
