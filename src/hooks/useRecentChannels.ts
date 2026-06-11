"use client";

import { useState, useCallback } from "react";
import { Channel } from "@/types";
import { getRecentChannels } from "@/lib/favorites";

function readRecent(): Channel[] {
  if (typeof window === "undefined") return [];
  return getRecentChannels();
}

export function useRecentChannels() {
  const [recent, setRecent] = useState<Channel[]>(readRecent);

  const refresh = useCallback(() => {
    setRecent(getRecentChannels());
  }, []);

  return { recentChannels: recent, refresh };
}
