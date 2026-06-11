"use client";

import { useState, useCallback } from "react";
import { getFavorites, toggleFavorite as toggleFav, clearAllFavorites } from "@/lib/favorites";

function readFavorites(): string[] {
  if (typeof window === "undefined") return [];
  return getFavorites();
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(readFavorites);

  const refresh = useCallback(() => {
    setFavorites(getFavorites());
  }, []);

  const checkFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites]
  );

  const toggle = useCallback(
    (id: string) => {
      toggleFav(id);
      refresh();
    },
    [refresh]
  );

  const clearAll = useCallback(() => {
    clearAllFavorites();
    refresh();
  }, [refresh]);

  return { favorites, toggleFavorite: toggle, isFavorite: checkFavorite, clearAll };
}
