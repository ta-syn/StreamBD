"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Play, Heart } from "lucide-react";
import { Channel } from "@/types";

const HASH_COLORS = [
  "#E50914",
  "#FF6B00",
  "#FF9500",
  "#9B59B6",
  "#3498DB",
  "#E91E8C",
  "#F39C12",
  "#1ABC9C",
  "#00A550",
];

function getInitialColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return HASH_COLORS[Math.abs(hash) % HASH_COLORS.length];
}

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

interface ChannelCardProps {
  channel: Channel;
  onPlay: (channel: Channel) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onInfo?: (channel: Channel) => void;
}

export default function ChannelCard({
  channel,
  onPlay,
  isFavorite,
  onToggleFavorite,
  onInfo,
}: ChannelCardProps) {
  const [imgError, setImgError] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onInfo?.(channel);
    },
    [channel, onInfo]
  );

  const handleTouchStart = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      onInfo?.(channel);
    }, 600);
  }, [channel, onInfo]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleTouchMove = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const statusColor =
    channel.status === "online"
      ? "var(--color-success)"
      : channel.status === "offline"
        ? "var(--color-error)"
        : "#666666";

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
      onClick={() => onPlay(channel)}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      data-testid="channel-card"
      className="group relative cursor-pointer rounded-[12px] overflow-hidden"
      style={{
        background: "#1A1A24",
        border: "1px solid #2A2A38",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(229,9,20,0.5)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(229,9,20,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#2A2A38";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Logo area */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: "16/9",
          background: "#111118",
        }}
      >
        {channel.logo && !imgError ? (
          <Image
            src={channel.logo}
            alt={channel.name}
            fill
            className="object-contain p-4"
            onError={() => setImgError(true)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            unoptimized
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: "56px",
                height: "56px",
                backgroundColor: getInitialColor(channel.name),
              }}
            >
              <span className="text-white font-bold text-2xl">
                {getInitial(channel.name)}
              </span>
            </div>
          </div>
        )}

        {/* Overlay: always visible on mobile, hover on desktop */}
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay(channel);
            }}
            className="flex items-center justify-center rounded-full bg-accent hover:bg-accent/90 transition-colors"
            style={{ width: "56px", height: "56px" }}
          >
            <Play size={24} fill="white" color="white" className="ml-1" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(channel.id);
            }}
            data-testid="favorite-btn"
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
          >
            {isFavorite ? (
              <Heart size={14} fill="#E50914" color="#E50914" />
            ) : (
              <Heart size={14} color="white" />
            )}
          </button>
        </div>

        {/* LIVE badge */}
        {(channel.isLive || channel.status === "online") && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-accent/90 text-white text-[10px] font-bold live-badge z-20">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            LIVE
          </div>
        )}

        {/* Status dot */}
        <div className="absolute top-2 right-2 z-20">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: statusColor }}
          />
        </div>
      </div>

      {/* Info area */}
      <div className="p-2.5 flex flex-col gap-1">
        <div className="text-white font-semibold text-sm truncate">
          {channel.name}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="px-1.5 py-0.5 rounded text-[10px] font-medium"
            style={{
              backgroundColor: `${getInitialColor(channel.category)}20`,
              color: getInitialColor(channel.category),
            }}
          >
            {channel.category}
          </span>
          {channel.viewCount != null && (
            <span className="text-[11px] text-text-secondary">
              👁 {channel.viewCount >= 1000 ? `${(channel.viewCount / 1000).toFixed(1)}K` : channel.viewCount}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function ChannelCardSkeleton() {
  return (
    <div
      className="rounded-[12px] overflow-hidden"
      style={{
        background: "#1A1A24",
        border: "1px solid #2A2A38",
      }}
    >
      <div
        className="w-full skeleton"
        style={{ aspectRatio: "16/9" }}
      />
      <div className="p-2.5 flex flex-col gap-2">
        <div className="h-4 w-3/4 rounded skeleton" />
        <div className="h-3 w-1/3 rounded skeleton" />
      </div>
    </div>
  );
}
