"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Channel, ChannelCategory } from "@/types";
import { useIPTV } from "@/hooks/useIPTV";
import { useSports } from "@/hooks/useSports";
import { useFavorites } from "@/hooks/useFavorites";
import { incrementView, addRecentChannel, getRecentChannels, removeRecentChannel, getViewCount, getMostWatched } from "@/lib/favorites";
import { batchCheckChannels } from "@/lib/channel-checker";

import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import FeaturedBanner from "@/components/FeaturedBanner";
import CategoryTabs from "@/components/CategoryTabs";
import ChannelGrid from "@/components/ChannelGrid";
import MobileNav from "@/components/MobileNav";
import ChannelRow from "@/components/ChannelRow";
import BackToTop from "@/components/BackToTop";
import Footer from "@/components/Footer";

const VideoPlayer = dynamic(() => import("@/components/VideoPlayer"), { ssr: false });
const SearchModal = dynamic(() => import("@/components/SearchModal"), { ssr: false });
const ChannelDetailPanel = dynamic(() => import("@/components/ChannelDetailPanel"), { ssr: false });
const FavoritesPanel = dynamic(() => import("@/components/FavoritesPanel"), { ssr: false });

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<ChannelCategory>("bangladesh");
  const [detailChannel, setDetailChannel] = useState<Channel | null>(null);
  const [appLoadTime] = useState(() => Date.now());
  const [recentChannels, setRecentChannels] = useState<Channel[]>([]);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [mostWatched, setMostWatched] = useState<Channel[]>([]);
  const { selectedChannel, setSelectedChannel, isSearchOpen, setIsSearchOpen, isFavPanelOpen, setIsFavPanelOpen } = useApp();

  // Sync recent channels on mount and set elapsed minutes timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setRecentChannels(getRecentChannels());
      setElapsedMinutes(Math.floor((Date.now() - appLoadTime) / 60000));
    }, 0);
    const interval = setInterval(() => {
      setElapsedMinutes(Math.floor((Date.now() - appLoadTime) / 60000));
    }, 60000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [appLoadTime]);



  const { channels, isLoading } = useIPTV();
  const { liveFixtures = [] } = useSports();
  const { favorites, toggleFavorite, isFavorite, clearAll } = useFavorites();

  // Background: batch check top 20 channels
  useEffect(() => {
    if (channels.length === 0) return;
    const top20 = channels.slice(0, 20);
    const idle = "requestIdleCallback" in window ? window.requestIdleCallback : (fn: () => void) => setTimeout(fn, 2000);
    idle(() => {
      batchCheckChannels(top20, 3);
    });
  }, [channels]);

  const channelCounts = useMemo(() => {
    const counts: Partial<Record<ChannelCategory, number>> = {};
    for (const ch of channels) {
      counts[ch.category] = (counts[ch.category] || 0) + 1;
    }
    return counts as Record<ChannelCategory, number>;
  }, [channels]);

  const featuredChannels = useMemo(
    () => [...channels].filter((ch) => ch.isFeatured).slice(0, 5),
    [channels]
  );

  // Sync most watched channels when channels change
  useEffect(() => {
    const viewedIds = getMostWatched(10);
    let list: Channel[] = [];
    if (viewedIds.length > 0) {
      list = viewedIds
        .map((id) => channels.find((ch) => ch.id === id))
        .filter((ch): ch is Channel => !!ch);
    }
    if (list.length === 0 && channels.length > 0) {
      list = channels.filter((ch) =>
        ["T Sports", "NTV", "Star Jalsha", "Zee Bangla", "ATN News",
          "GTV", "Somoy TV", "Star Sports", "Cartoon Network", "MTV India"]
          .some((n) => ch.name.toLowerCase().includes(n.toLowerCase()))
      ).slice(0, 10);
    }
    const timer = setTimeout(() => {
      setMostWatched(list);
    }, 0);
    return () => clearTimeout(timer);
  }, [channels]);

  const recentlyAdded = useMemo(
    () => [...channels].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 10),
    [channels]
  );

  const viewCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const ch of channels) {
      map[ch.id] = getViewCount(ch.id);
    }
    return map;
  }, [channels]);

  const categoryChannels = useMemo(
    () => channels.filter((ch) => ch.category === activeCategory),
    [channels, activeCategory]
  );

  const sportsChannels = useMemo(
    () => channels.filter((ch) => ch.category === "sports"),
    [channels]
  );

  const favoriteChannelList = useMemo(
    () => channels.filter((ch) => favorites.includes(ch.id)),
    [channels, favorites]
  );

  const handlePlay = useCallback((channel: Channel) => {
    incrementView(channel.id);
    addRecentChannel(channel);
    setRecentChannels(getRecentChannels());
    setSelectedChannel(channel);
  }, [setSelectedChannel]);

  const handleNext = useCallback(() => {
    if (!selectedChannel) return;
    const list = categoryChannels;
    const idx = list.findIndex((ch) => ch.id === selectedChannel.id);
    if (idx === -1) return;
    const next = list[(idx + 1) % list.length];
    setSelectedChannel(next);
    incrementView(next.id);
    addRecentChannel(next);
  }, [selectedChannel, categoryChannels, setSelectedChannel]);

  const handlePrev = useCallback(() => {
    if (!selectedChannel) return;
    const list = categoryChannels;
    const idx = list.findIndex((ch) => ch.id === selectedChannel.id);
    if (idx === -1) return;
    const prev = list[(idx - 1 + list.length) % list.length];
    setSelectedChannel(prev);
    incrementView(prev.id);
    addRecentChannel(prev);
  }, [selectedChannel, categoryChannels, setSelectedChannel]);

  const handleWatchChannel = useCallback(
    (channelName: string) => {
      const match = channels.find(
        (ch) => ch.name.toLowerCase().includes(channelName.toLowerCase())
      );
      if (match) handlePlay(match);
    },
    [channels, handlePlay]
  );

  const showFavoritesView = activeCategory === ("favorites" as ChannelCategory);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0A0A0F" }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Navbar favoritesCount={favorites.length} />
      </motion.div>

      <main className="flex-1 pb-20 md:pb-0" style={{ paddingTop: "64px" }}>
        {/* FeaturedBanner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {featuredChannels.length > 0 && (
            <FeaturedBanner
              channels={featuredChannels}
              onPlay={handlePlay}
              onToggleFavorite={toggleFavorite}
              isFavorite={isFavorite}
            />
          )}
        </motion.div>

        <div className="max-w-[1440px] mx-auto px-4 py-6">
          {/* Continue Watching */}
          {recentChannels.length > 0 && (
            <section className="mb-8">
              <h3 className="text-white font-semibold text-base font-body mb-3">
                ▶ Continue Watching
              </h3>
              <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                <style jsx>{`div::-webkit-scrollbar{display:none}`}</style>
                {recentChannels.slice(0, 3).map((ch) => (
                  <div
                    key={ch.id}
                    className="flex-shrink-0 w-[200px] rounded-lg p-3 text-left transition-colors hover:bg-card relative group"
                    style={{ background: "#1A1A24", border: "1px solid #2A2A38" }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRecentChannel(ch.id);
                        setRecentChannels(getRecentChannels());
                      }}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/40 hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} color="white" />
                    </button>
                    <button
                      onClick={() => handlePlay(ch)}
                      className="w-full text-left"
                    >
                      <div className="text-white text-sm font-medium truncate">{ch.name}</div>
                      <div className="text-[11px] text-text-secondary mt-1">
                        {(() => {
                          if (!ch.lastWatched) return "";
                          const now = new Date();
                          const watched = new Date(ch.lastWatched);
                          const diffDays = Math.floor(
                            (now.getTime() - watched.getTime()) / (1000 * 60 * 60 * 24)
                          );
                          if (diffDays === 0) return "Watched today";
                          if (diffDays === 1) return "Watched yesterday";
                          return `${diffDays} days ago`;
                        })()}
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Most Watched */}
          {mostWatched.length > 0 && (
            <ChannelRow
              title="🔥 Most Watched Today"
              channels={mostWatched}
              onPlay={handlePlay}
              showViewCount
              viewCounts={viewCountMap}
              onInfo={setDetailChannel}
            />
          )}

          {/* Recently Added */}
          {recentlyAdded.length > 0 && (
            <ChannelRow
              title="✨ Recently Added"
              channels={recentlyAdded}
              onPlay={handlePlay}
              onInfo={setDetailChannel}
            />
          )}

          {/* CategoryTabs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <CategoryTabs
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              channelCounts={channelCounts}
            />
          </motion.div>

          {/* Sports */}
          {activeCategory === "sports" && (
            <>
              {liveFixtures.length > 0 && (
                <div className="mb-6">
                  <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                    <style jsx>{`div::-webkit-scrollbar{display:none}`}</style>
                    {liveFixtures.map((f) => (
                      <div
                        key={f.id}
                        className="flex-shrink-0 w-[280px] rounded-xl p-3"
                        style={{ background: "#1A1A24", border: "1px solid #2A2A38" }}
                      >
                        <div className="text-xs text-text-secondary">{f.league}</div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-white text-sm font-medium">{f.homeTeam}</span>
                          <span className="font-display text-lg text-accent">
                            {f.status === "live" && f.score ? f.score : "VS"}
                          </span>
                          <span className="text-white text-sm font-medium">{f.awayTeam}</span>
                        </div>
                        <div className="text-[11px] text-text-secondary mt-1">
                          {f.date} • {f.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <AnimatePresence mode="wait">
                <motion.div
                  key="sports"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChannelGrid
                    channels={sportsChannels}
                    isLoading={isLoading}
                    title="⚽ Sports"
                    showSportsFixtures
                    fixtures={liveFixtures}
                    onPlay={handlePlay}
                    onWatchChannel={handleWatchChannel}
                    onInfo={setDetailChannel}
                    isFavorite={isFavorite}
                    onToggleFavorite={toggleFavorite}
                  />
                </motion.div>
              </AnimatePresence>
            </>
          )}

          {/* Favorites */}
          {showFavoritesView && (
            <AnimatePresence mode="wait">
              <motion.div
                key="favorites"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <ChannelGrid
                  channels={favoriteChannelList}
                  isLoading={isLoading}
                  title="⭐ Your Favorites"
                  onPlay={handlePlay}
                  onWatchChannel={handleWatchChannel}
                  isFavorite={isFavorite}
                  onToggleFavorite={toggleFavorite}
                />
              </motion.div>
            </AnimatePresence>
          )}

          {/* Default category view */}
          {!showFavoritesView && activeCategory !== "sports" && (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <ChannelGrid
                  channels={categoryChannels}
                  isLoading={isLoading}
                  title={
                    activeCategory === "bangladesh"
                      ? "🇧🇩 Bangladesh"
                      : activeCategory === "bengali"
                        ? "🎭 Bengali"
                        : undefined
                  }
                  onPlay={handlePlay}
                  onWatchChannel={handleWatchChannel}
                  isFavorite={isFavorite}
                  onToggleFavorite={toggleFavorite}
                />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>

      <MobileNav
        activeCategory={activeCategory}
        onCategoryChange={(cat) => setActiveCategory(cat as ChannelCategory)}
        favoritesCount={favorites.length}
        onSearchOpen={() => setIsSearchOpen(true)}
        favorites={favoriteChannelList}
        onPlay={handlePlay}
      />

      <FavoritesPanel
        isOpen={isFavPanelOpen}
        onClose={() => setIsFavPanelOpen(false)}
        favorites={favoriteChannelList}
        onPlay={(ch) => {
          setIsFavPanelOpen(false);
          handlePlay(ch);
        }}
        onRemove={toggleFavorite}
        onClearAll={() => clearAll()}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        channels={channels}
        onPlay={handlePlay}
      />

      {selectedChannel && (
        <VideoPlayer
          channel={selectedChannel}
          onClose={() => setSelectedChannel(null)}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}

      <ChannelDetailPanel
        channel={detailChannel}
        onClose={() => setDetailChannel(null)}
        onPlay={handlePlay}
        onToggleFavorite={toggleFavorite}
        isFavorite={detailChannel ? isFavorite(detailChannel.id) : false}
        allChannels={channels}
      />

      <Footer
        channelCount={channels.length}
        lastUpdatedMinutes={elapsedMinutes}
      />

      <BackToTop />
    </div>
  );
}
