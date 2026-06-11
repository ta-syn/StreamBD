"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, Bell } from "lucide-react";
import { SportFixture } from "@/types";
import { useApp } from "@/context/AppContext";
import { setReminder, removeReminder, getAllReminders, requestNotificationPermission } from "@/lib/reminders";

interface SportsFixturesProps {
  fixtures: SportFixture[];
  isLoading: boolean;
  onWatchChannel: (channelName: string) => void;
}

export default function SportsFixtures({
  fixtures,
  isLoading,
  onWatchChannel,
}: SportsFixturesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const { addToast } = useApp();
  const [reminders, setReminders] = useState<string[]>(() => {
    return typeof window !== "undefined"
      ? getAllReminders().map((r: SportFixture) => r.id)
      : [];
  });

  const handleToggleReminder = async (fixture: SportFixture) => {
    const isSet = reminders.includes(fixture.id);
    if (isSet) {
      removeReminder(fixture.id);
      setReminders((prev) => prev.filter((id) => id !== fixture.id));
      addToast(`Reminder removed for ${fixture.homeTeam} vs ${fixture.awayTeam}`, "info");
    } else {
      const granted = await requestNotificationPermission();
      setReminder(fixture);
      setReminders((prev) => [...prev, fixture.id]);
      if (granted) {
        addToast(`Reminder set! We'll notify you 15m before kick-off.`, "success");
      } else {
        addToast(`Reminder saved, but please enable notifications to get alerts.`, "warning");
      }
    }
  };

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, fixtures]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  if (isLoading) {
    return (
      <div className="mb-6">
        <h3 className="text-white font-semibold text-base font-body mb-3">
          🔥 Upcoming &amp; Live Matches
        </h3>
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[280px] rounded-[12px] p-3"
              style={{
                background: "#1A1A24",
                border: "1px solid #2A2A38",
              }}
            >
              <div className="h-4 w-1/2 rounded skeleton mb-3" />
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="h-10 w-10 rounded-full skeleton" />
                <div className="h-6 w-10 rounded skeleton" />
                <div className="h-10 w-10 rounded-full skeleton" />
              </div>
              <div className="h-3 w-3/4 rounded skeleton mb-3" />
              <div className="flex gap-2">
                <div className="h-8 flex-1 rounded skeleton" />
                <div className="h-8 flex-1 rounded skeleton" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (fixtures.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold text-base font-body">
          🔥 Upcoming &amp; Live Matches
        </h3>
        <div className="hidden md:flex items-center gap-1">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="p-1 rounded transition-colors"
            style={{
              opacity: canScrollLeft ? 1 : 0.3,
              color: canScrollLeft ? "#FFFFFF" : "#555",
            }}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="p-1 rounded transition-colors"
            style={{
              opacity: canScrollRight ? 1 : 0.3,
              color: canScrollRight ? "#FFFFFF" : "#555",
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto"
        style={{ scrollbarWidth: "none" }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {fixtures.map((fixture, index) => {
          const isLive = fixture.status === "live";

          return (
            <motion.div
              key={fixture.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex-shrink-0 w-[280px] rounded-[12px] p-3 flex flex-col relative overflow-hidden"
              style={{
                background: "#1A1A24",
                border: isLive
                  ? "1px solid rgba(229,9,20,0.6)"
                  : "1px solid #2A2A38",
                boxShadow: isLive ? "0 0 20px rgba(229,9,20,0.2)" : "none",
              }}
            >
              {isLive && (
                <div className="animate-pulse absolute inset-0 rounded-[12px] pointer-events-none" />
              )}

              {/* Row 1: League */}
              <div className="flex items-center gap-2 mb-3">
                {fixture.leagueLogo && (
                  <Image
                    src={fixture.leagueLogo}
                    alt={fixture.league}
                    width={24}
                    height={24}
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                    unoptimized
                  />
                )}
                <span className="text-[12px] text-text-secondary truncate">
                  {fixture.league}
                </span>
                {isLive && (
                  <span className="ml-auto px-1.5 py-0.5 rounded bg-accent/20 text-accent text-[9px] font-bold live-badge">
                    🔴 LIVE
                  </span>
                )}
              </div>

              {/* Row 2: Teams + VS / Score */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                  {fixture.homeLogo && (
                    <Image
                      src={fixture.homeLogo}
                      alt={fixture.homeTeam}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                      unoptimized
                    />
                  )}
                  <span className="text-xs text-white font-medium text-center truncate w-full">
                    {fixture.homeTeam}
                  </span>
                </div>

                <div className="flex-shrink-0 px-3">
                  {isLive && fixture.score ? (
                    <span className="text-lg font-bold text-white">
                      {fixture.score}
                    </span>
                  ) : (
                    <span className="font-display text-xl" style={{ color: "#E50914" }}>
                      VS
                    </span>
                  )}
                </div>

                <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                  {fixture.awayLogo && (
                    <Image
                      src={fixture.awayLogo}
                      alt={fixture.awayTeam}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                      unoptimized
                    />
                  )}
                  <span className="text-xs text-white font-medium text-center truncate w-full">
                    {fixture.awayTeam}
                  </span>
                </div>
              </div>

              {/* Row 3: Date + Time + Channel */}
              <div className="flex items-center gap-2 text-[12px] text-text-secondary mb-3">
                <Clock size={12} />
                <span>
                  {fixture.date} • {fixture.time}
                </span>
                {fixture.watchChannel && (
                  <span className="ml-auto px-2 py-0.5 rounded bg-[#3498DB20] text-[#3498DB] text-[10px] font-medium whitespace-nowrap">
                    {fixture.watchChannel}
                  </span>
                )}
              </div>

              {/* Row 4: Reminder + Watch */}
              <div className="flex gap-2 mt-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleReminder(fixture);
                  }}
                  className="flex items-center gap-1 flex-1 justify-center px-3 py-1.5 rounded-lg text-[11px] transition-colors"
                  style={{
                    background: reminders.includes(fixture.id) ? "rgba(229,9,20,0.15)" : "#111118",
                    border: reminders.includes(fixture.id) ? "1px solid #E50914" : "1px solid #2A2A38",
                    color: reminders.includes(fixture.id) ? "#E50914" : "#9999AA",
                  }}
                >
                  <Bell size={12} fill={reminders.includes(fixture.id) ? "#E50914" : "none"} />
                  {reminders.includes(fixture.id) ? "Reminder Set" : "Set Reminder"}
                </button>
                {fixture.watchChannel && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onWatchChannel(fixture.watchChannel!);
                    }}
                    className="flex items-center gap-1 flex-1 justify-center px-3 py-1.5 rounded-lg text-white text-[11px] font-medium bg-accent hover:bg-accent/90 transition-colors"
                  >
                    ▶ Watch
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
