"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import { Play, Bell, BellRing, Clock, Calendar, RefreshCw } from "lucide-react";
import { SportFixture, Channel } from "@/types";
import { useSports } from "@/hooks/useSports";
import { useIPTV } from "@/hooks/useIPTV";
import { incrementView, addRecentChannel } from "@/lib/favorites";
import ChannelCard from "@/components/ChannelCard";
import { useFavorites } from "@/hooks/useFavorites";
import { setReminder, removeReminder, getAllReminders, requestNotificationPermission, checkReminders } from "@/lib/reminders";
import { useToast } from "@/components/Toaster";
import dynamic from "next/dynamic";

const VideoPlayer = dynamic(() => import("@/components/VideoPlayer"), { ssr: false });

type SportFilter = "all" | "football" | "cricket" | "other";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDay(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (d.getTime() === today.getTime()) return "Today";
  if (d.getTime() === tomorrow.getTime()) return "Tomorrow";
  return `${DAY_NAMES[d.getDay()]} ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

export default function SportsPage() {
  const { fixtures, isLoading } = useSports();
  const { channels } = useIPTV();
  const { toggleFavorite, isFavorite } = useFavorites();
  const showToast = useToast();

  const [filter, setFilter] = useState<SportFilter>("all");
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [remindedIds, setRemindedIds] = useState<string[]>([]);

  // Sync reminders from localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      setRemindedIds(getAllReminders().map((r) => r.id));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Check reminders every minute
  useEffect(() => {
    const check = () => {
      checkReminders();
    };
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, []);

  const [minutesAgo, setMinutesAgo] = useState("just now");

  // Update minutesAgo text when lastUpdated changes or every 60s
  useEffect(() => {
    const update = () => {
      const diff = Math.floor((Date.now() - lastUpdated.getTime()) / 60000);
      if (diff === 0) setMinutesAgo("just now");
      else if (diff === 1) setMinutesAgo("1 min ago");
      else setMinutesAgo(`${diff} min ago`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  // Update timestamp
  useEffect(() => {
    const interval = setInterval(() => setLastUpdated(new Date()), 120000);
    return () => clearInterval(interval);
  }, []);

  const filteredFixtures = useMemo(() => {
    if (filter === "all") return fixtures;
    return fixtures.filter((f) => f.sport === filter);
  }, [fixtures, filter]);

  const sportsChannels = useMemo(
    () => channels.filter((ch) => ch.category === "sports"),
    [channels]
  );

  const handlePlay = useCallback(
    (channel: Channel) => {
      incrementView(channel.id);
      addRecentChannel(channel);
      setSelectedChannel(channel);
    },
    []
  );

  const handleWatchChannel = useCallback(
    (channelName: string) => {
      const match = sportsChannels.find(
        (ch) => ch.name.toLowerCase().includes(channelName.toLowerCase())
      );
      if (match) handlePlay(match);
    },
    [sportsChannels, handlePlay]
  );

  const toggleReminder = useCallback(
    async (fixture: SportFixture) => {
      if (remindedIds.includes(fixture.id)) {
        removeReminder(fixture.id);
        setRemindedIds((prev) => prev.filter((id) => id !== fixture.id));
        return;
      }

      const granted = await requestNotificationPermission();
      if (!granted) {
        showToast("Enable notifications in browser settings", "warning");
        return;
      }

      setReminder(fixture);
      setRemindedIds((prev) => [...prev, fixture.id]);
      showToast("🔔 Reminder set!", "success");
    },
    [remindedIds, showToast]
  );

  const filterLive = useMemo(
    () => filteredFixtures.filter((f) => f.status === "live"),
    [filteredFixtures]
  );

  const filterToday = useMemo(
    () => filteredFixtures.filter((f) => {
      if (f.status === "live") return false;
      const today = new Date().toISOString().slice(0, 10);
      return f.date === today;
    }),
    [filteredFixtures]
  );

  const filterUpcoming = useMemo(
    () => filteredFixtures.filter((f) => f.status === "upcoming"),
    [filteredFixtures]
  );

  // Group upcoming by day
  const upcomingByDay = useMemo(() => {
    const groups: Record<string, SportFixture[]> = {};
    for (const f of filterUpcoming) {
      if (!groups[f.date]) groups[f.date] = [];
      groups[f.date].push(f);
    }
    return Object.entries(groups).sort(
      ([a], [b]) => new Date(a).getTime() - new Date(b).getTime()
    );
  }, [filterUpcoming]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 px-4" style={{ background: "#0A0A0F" }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="h-14 w-64 rounded skeleton mb-2" />
          <div className="h-5 w-80 rounded skeleton mb-8" />
          <div className="h-10 w-full rounded skeleton mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 rounded-xl skeleton" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#0A0A0F" }}>
      <div className="pt-20 pb-10 px-4">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="mb-2">
            <h1 className="font-display text-[36px] sm:text-[56px] leading-none text-white mb-1">
              ⚽ SPORTS <span style={{ color: "#E50914" }}>LIVE</span>
            </h1>
            <p className="text-text-secondary text-sm mb-1">
              Live matches, upcoming fixtures &amp; reminders
            </p>
            <div className="flex items-center gap-1.5 text-text-secondary text-xs">
              <RefreshCw size={12} className="animate-spin-slow" />
              🔄 Updated {minutesAgo}
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-2 my-6">
            {([
              { id: "all", label: "All" },
              { id: "football", label: "Football ⚽" },
              { id: "cricket", label: "Cricket 🏏" },
              { id: "other", label: "Others 🎾" },
            ] as { id: SportFilter; label: string }[]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                style={{
                  background: filter === tab.id ? "#E50914" : "#1A1A24",
                  color: filter === tab.id ? "#FFFFFF" : "#9999AA",
                  border: filter === tab.id ? "1px solid #E50914" : "1px solid #2A2A38",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* LIVE NOW */}
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-white text-lg font-semibold flex items-center gap-2">
                🔴 LIVE NOW
                <span className="px-2 py-0.5 rounded bg-accent/20 text-accent text-[10px] font-bold live-badge">
                  {filterLive.length}
                </span>
              </h2>
              <div className="h-px flex-1" style={{ background: "rgba(229,9,20,0.3)" }} />
            </div>

            {filterLive.length === 0 ? (
              <p className="text-text-secondary text-sm py-6">No live matches right now</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterLive.map((f) => (
                  <MatchCard
                    key={f.id}
                    fixture={f}
                    isReminded={remindedIds.includes(f.id)}
                    onToggleReminder={() => toggleReminder(f)}
                    onWatch={handleWatchChannel}
                    isLive
                  />
                ))}
              </div>
            )}
          </section>

          {/* TODAY */}
          {filterToday.length > 0 && (
            <section className="mb-10">
              <h2 className="text-white text-lg font-semibold mb-4">📅 TODAY</h2>
              <div className="relative pl-6">
                <div
                  className="absolute left-[3px] top-2 bottom-2 w-[2px]"
                  style={{ background: "#E50914" }}
                />
                <div className="flex flex-col gap-4">
                  {filterToday.map((f) => (
                    <div key={f.id} className="flex items-start gap-3">
                      <div className="text-text-secondary text-xs font-mono mt-3 min-w-[40px]">
                        {f.time}
                      </div>
                      <MatchCard
                        fixture={f}
                        isReminded={remindedIds.includes(f.id)}
                        onToggleReminder={() => toggleReminder(f)}
                        onWatch={handleWatchChannel}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* UPCOMING */}
          {upcomingByDay.length > 0 && (
            <section className="mb-10">
              <h2 className="text-white text-lg font-semibold mb-4">📆 UPCOMING</h2>
              <div className="flex flex-col gap-6">
                {upcomingByDay.map(([date, dayFixtures]) => (
                  <div key={date} className="relative pl-6">
                    <h3 className="text-text-secondary text-sm font-medium mb-3">
                      {formatDay(date)}
                    </h3>
                    <div
                      className="absolute left-[3px] top-6 bottom-2 w-[2px]"
                      style={{ background: "#E50914" }}
                    />
                    <div className="flex flex-col gap-3">
                      {dayFixtures.map((f) => (
                        <div key={f.id} className="flex items-start gap-3">
                          <div className="text-text-secondary text-xs font-mono mt-3 min-w-[40px]">
                            {f.time}
                          </div>
                          <MatchCard
                            fixture={f}
                            isReminded={remindedIds.includes(f.id)}
                            onToggleReminder={() => toggleReminder(f)}
                            onWatch={handleWatchChannel}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Sports Channels */}
          <section className="mt-12">
            <h2 className="text-white text-lg font-semibold mb-4">
              📡 Sports Channels
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {sportsChannels.map((ch) => (
                <ChannelCard
                  key={ch.id}
                  channel={ch}
                  onPlay={handlePlay}
                  isFavorite={isFavorite(ch.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </section>
        </div>
      </div>

      {selectedChannel && (
        <VideoPlayer
          channel={selectedChannel}
          onClose={() => setSelectedChannel(null)}
        />
      )}
    </div>
  );
}

function MatchCard({
  fixture,
  isReminded,
  onToggleReminder,
  onWatch,
  isLive,
}: {
  fixture: SportFixture;
  isReminded: boolean;
  onToggleReminder: () => void;
  onWatch: (name: string) => void;
  isLive?: boolean;
}) {
  return (
    <div
      className="flex-1 rounded-xl p-4"
      style={{
        background: "#1A1A24",
        border: isLive
          ? "1px solid rgba(229,9,20,0.5)"
          : "1px solid #2A2A38",
        boxShadow: isLive ? "0 0 24px rgba(229,9,20,0.15)" : "none",
      }}
    >
      {/* League */}
      <div className="flex items-center gap-2 mb-3">
        {fixture.leagueLogo && (
          <Image
            src={fixture.leagueLogo}
            alt={fixture.league}
            width={20}
            height={20}
            className="w-5 h-5 object-contain rounded"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
            unoptimized
          />
        )}
        <span className="text-xs text-text-secondary font-medium truncate">
          {fixture.league}
        </span>
        {isLive && (
          <span className="ml-auto px-2 py-0.5 rounded bg-accent/20 text-accent text-[10px] font-bold live-badge">
            🔴 LIVE
          </span>
        )}
        {!isLive && (
          <span className="ml-auto text-xs text-text-secondary flex items-center gap-1">
            <Clock size={11} />
            {fixture.time}
          </span>
        )}
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
          {fixture.homeLogo && (
            <Image
              src={fixture.homeLogo}
              alt={fixture.homeTeam}
              width={56}
              height={56}
              className="w-14 h-14 object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
              unoptimized
            />
          )}
          <span className="text-white text-sm font-bold text-center truncate w-full">
            {fixture.homeTeam}
          </span>
        </div>

        <div className="flex-shrink-0 px-2">
          {isLive && fixture.score ? (
            <span className="text-white text-xl font-bold">{fixture.score}</span>
          ) : (
            <span className="font-display text-2xl" style={{ color: "#E50914" }}>
              VS
            </span>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
          {fixture.awayLogo && (
            <Image
              src={fixture.awayLogo}
              alt={fixture.awayTeam}
              width={56}
              height={56}
              className="w-14 h-14 object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
              unoptimized
            />
          )}
          <span className="text-white text-sm font-bold text-center truncate w-full">
            {fixture.awayTeam}
          </span>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
        <Calendar size={12} className="text-text-secondary" />
        <span className="text-xs text-text-secondary">{fixture.date}</span>

        {fixture.watchChannel && (
          <button
            onClick={() => onWatch(fixture.watchChannel!)}
            className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors"
            style={{ background: "#3498DB20", color: "#3498DB" }}
          >
            <Play size={11} />
            📺 Watch on {fixture.watchChannel}
          </button>
        )}
      </div>

      {/* Reminder */}
      <button
        onClick={onToggleReminder}
        className="flex items-center gap-1.5 mt-2 text-xs transition-colors"
        style={{ color: isReminded ? "#22c55e" : "#9999AA" }}
      >
        {isReminded ? <BellRing size={13} /> : <Bell size={13} />}
        {isReminded ? "✅ Reminder Set" : "🔔 Set Reminder"}
      </button>
    </div>
  );
}
