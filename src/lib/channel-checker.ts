import { Channel } from "@/types";

const STATUS_CACHE_KEY = "streambd_channel_status";
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

interface StatusCache {
  [streamUrl: string]: {
    status: "online" | "offline" | "unknown";
    timestamp: number;
  };
}

function getStatusCache(): StatusCache {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STATUS_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setStatusCache(cache: StatusCache): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STATUS_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // storage full, ignore
  }
}

export async function checkChannelStatus(
  streamUrl: string
): Promise<"online" | "offline" | "unknown"> {
  const cache = getStatusCache();
  const cached = cache[streamUrl];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.status;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(streamUrl, {
      method: "HEAD",
      signal: controller.signal,
      mode: "no-cors",
    });

    clearTimeout(timeout);

    let status: "online" | "offline" | "unknown" = "unknown";
    if (response.ok || response.type === "opaque" || response.status === 200 || response.status === 206) {
      status = "online";
    } else {
      status = "offline";
    }

    cache[streamUrl] = { status, timestamp: Date.now() };
    setStatusCache(cache);
    return status;
  } catch {
    const status: "online" | "offline" | "unknown" = "offline";
    cache[streamUrl] = { status, timestamp: Date.now() };
    setStatusCache(cache);
    return "offline";
  }
}

export async function batchCheckChannels(
  channels: Channel[],
  concurrency: number = 5
): Promise<Record<string, "online" | "offline" | "unknown">> {
  const results: Record<string, "online" | "offline" | "unknown"> = {};

  for (let i = 0; i < channels.length; i += concurrency) {
    const batch = channels.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(
      batch.map(async (ch) => ({
        id: ch.id,
        status: await checkChannelStatus(ch.streamUrl),
      }))
    );

    for (const result of batchResults) {
      if (result.status === "fulfilled") {
        results[result.value.id] = result.value.status;
      }
    }
  }

  return results;
}

export function getCachedStatus(): "online" | "offline" | "unknown" | null {
  // Cache keyed by streamUrl, not channel ID. Requires streamUrl to resolve.
  return null;
}

export function markChannelOffline(streamUrl: string): void {
  const cache = getStatusCache();
  cache[streamUrl] = { status: "offline", timestamp: Date.now() };
  setStatusCache(cache);
}

export function reportStream(channelId: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("streambd_reports");
    const reports: string[] = raw ? JSON.parse(raw) : [];
    if (!reports.includes(channelId)) {
      reports.push(channelId);
      localStorage.setItem("streambd_reports", JSON.stringify(reports));
    }
  } catch {
    // silent
  }
}
