"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Channel, ChannelCategory } from "@/types";
import { parseM3U, PLAYLIST_URLS, getChannelsByCategory, searchChannels } from "@/lib/iptv-parser";
import { FALLBACK_CHANNELS } from "@/lib/fallback-channels";
import { getRecentChannels } from "@/lib/favorites";

/**
 * Priority loading: BD channels load first, others fill in background.
 * parseM3U has 30-min localStorage cache, so repeat loads are instant.
 * On partial failure: mix real data + fallback for missing categories.
 * On complete failure: fallback + shows limited banner.
 */
async function fetchAllChannels(): Promise<{ channels: Channel[]; isFallback: boolean }> {
  const keys = Object.keys(PLAYLIST_URLS) as Array<keyof typeof PLAYLIST_URLS>;

  // Priority: bangladesh + sports first
  const priorityKeys = keys.filter((k) => k === "bangladesh" || k === "sports");
  const restKeys = keys.filter((k) => k !== "bangladesh" && k !== "sports");

  try {
    const keysOrder = [...priorityKeys, ...restKeys];
    const results = await Promise.all(
      keysOrder.map(async (k) => {
        try {
          return await parseM3U(PLAYLIST_URLS[k]);
        } catch {
          return [];
        }
      })
    );

    const allChannels = results.flat();

    const seen = new Set<string>();
    const deduped: Channel[] = [];

    for (const ch of allChannels) {
      const key = ch.id || ch.name;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(ch);
      }
    }

    if (deduped.length === 0) {
      return { channels: FALLBACK_CHANNELS, isFallback: true };
    }

    // Mix in fallback for completely empty categories
    const missingCategories = new Set(FALLBACK_CHANNELS.map((f) => f.category));
    const presentCategories = new Set(deduped.map((ch) => ch.category));

    const missing = new Set(
      [...missingCategories].filter((c) => !presentCategories.has(c))
    );

    if (missing.size > 0) {
      const fallbackForMissing = FALLBACK_CHANNELS.filter((f) => missing.has(f.category));
      deduped.push(...fallbackForMissing);
    }

    return { channels: deduped, isFallback: false };
  } catch {
    return { channels: FALLBACK_CHANNELS, isFallback: true };
  }
}

const EMPTY_CHANNELS: Channel[] = [];

export function useIPTV() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["iptv-channels"],
    queryFn: fetchAllChannels,
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });

  const channels = data?.channels ?? EMPTY_CHANNELS;
  const isFallback = data?.isFallback ?? false;

  const byCategory = useMemo(
    () => (category: ChannelCategory) => getChannelsByCategory(channels, category),
    [channels]
  );

  const search = useMemo(
    () => (query: string) => searchChannels(channels, query),
    [channels]
  );

  return {
    channels,
    isLoading,
    isFallback,
    error: error ? (error as Error).message : null,
    getByCategory: byCategory,
    searchChannels: search,
    recentChannels: getRecentChannels(),
  };
}
