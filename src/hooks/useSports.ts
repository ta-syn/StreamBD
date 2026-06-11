"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getAllFixtures } from "@/lib/sports-api";

export function useSports() {
  const { data: fixtures = [], isLoading } = useQuery({
    queryKey: ["sports-fixtures"],
    queryFn: getAllFixtures,
    refetchInterval: 120000,
    staleTime: 240000,
  });

  const liveFixtures = useMemo(
    () => fixtures.filter((f) => f.status === "live"),
    [fixtures]
  );

  const todayFixtures = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return fixtures.filter((f) => f.date === today);
  }, [fixtures]);

  const upcomingFixtures = useMemo(
    () => fixtures.filter((f) => f.status === "upcoming"),
    [fixtures]
  );

  return {
    fixtures,
    liveFixtures,
    todayFixtures,
    upcomingFixtures,
    isLoading,
  };
}
