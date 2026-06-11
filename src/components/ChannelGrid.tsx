"use client";

import { motion } from "framer-motion";
import { Tv, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { Channel, SportFixture } from "@/types";
import ChannelCard, { ChannelCardSkeleton } from "./ChannelCard";
import SportsFixtures from "./SportsFixtures";

const PAGE_SIZE = 20;

interface ChannelGridProps {
  channels: Channel[];
  isLoading: boolean;
  title?: string;
  showSportsFixtures?: boolean;
  fixtures?: SportFixture[];
  onPlay: (channel: Channel) => void;
  onWatchChannel: (channelName: string) => void;
  onInfo?: (channel: Channel) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
}

export default function ChannelGrid({
  channels,
  isLoading,
  title,
  showSportsFixtures,
  fixtures = [],
  onPlay,
  onWatchChannel,
  onInfo,
  isFavorite,
  onToggleFavorite,
}: ChannelGridProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visibleChannels = useMemo(
    () => channels.slice(0, visibleCount),
    [channels, visibleCount]
  );

  const hasMore = visibleCount < channels.length;

  if (isLoading) {
    return (
      <div>
        {title && (
          <h3 className="text-white font-semibold text-base font-body mb-3">
            {title}
          </h3>
        )}
        <div className="grid grid-cols-2 gap-2 min-[380px]:gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <ChannelCardSkeleton />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Tv size={48} className="text-text-secondary" />
        <p className="text-text-secondary text-sm">No channels found</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-lg text-sm text-white bg-card border border-border hover:border-accent/50 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-white font-semibold text-base font-body">
            {title}
          </h3>
          <span className="text-sm text-text-secondary">
            • {channels.length} channels
          </span>
        </div>
      )}

      {showSportsFixtures && (
        <SportsFixtures fixtures={fixtures} isLoading={false} onWatchChannel={onWatchChannel} />
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {visibleChannels.map((channel, index) => (
        <motion.div
            key={channel.id}
            className="channel-card-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: Math.min(index * 0.04, 0.3), duration: 0.2 }}
          >
            <ChannelCard
              channel={channel}
              onPlay={onPlay}
              isFavorite={isFavorite(channel.id)}
              onToggleFavorite={onToggleFavorite}
              onInfo={onInfo}
            />
          </motion.div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: "#111118",
              border: "1px solid #E50914",
              color: "#E50914",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#E50914";
              e.currentTarget.style.color = "#FFFFFF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#111118";
              e.currentTarget.style.color = "#E50914";
            }}
          >
            <Loader2 size={14} />
            Load More ({channels.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
