"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Star, Heart, Copy, Share2, X, Check } from "lucide-react";
import { Channel } from "@/types";

interface ChannelDetailPanelProps {
  channel: Channel | null;
  onClose: () => void;
  onPlay: (channel: Channel) => void;
  onToggleFavorite: (id: string) => void;
  isFavorite: boolean;
  allChannels: Channel[];
}

export default function ChannelDetailPanel({
  channel,
  onClose,
  onPlay,
  onToggleFavorite,
  isFavorite,
  allChannels,
}: ChannelDetailPanelProps) {
  const [copied, setCopied] = useState(false);
  const touchStartY = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const similarChannels = allChannels
    .filter((ch) => ch.category === channel?.category && ch.id !== channel?.id)
    .slice(0, 4);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const copyUrl = useCallback(() => {
    if (!channel?.streamUrl) return;
    navigator.clipboard.writeText(channel.streamUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [channel]);

  const share = useCallback(() => {
    if (!channel) return;
    if (navigator.share) {
      navigator.share({
        title: channel.name,
        text: `Watch ${channel.name} live on StreamBD`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      copyUrl();
    }
  }, [channel, copyUrl]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (e.changedTouches[0].clientY - touchStartY.current > 80) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <AnimatePresence>
      {channel && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[75]"
            style={{ background: "rgba(0,0,0,0.7)" }}
            onClick={onClose}
          />

          {/* Desktop: right slide-in */}
          <motion.div
            ref={panelRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 z-[78] h-full w-[320px] flex flex-col hidden md:flex"
            style={{
              background: "#111118",
              borderLeft: "1px solid #2A2A38",
            }}
          >
            <PanelContent
              channel={channel}
              isFavorite={isFavorite}
              copied={copied}
              similarChannels={similarChannels}
              onPlay={onPlay}
              onToggleFavorite={onToggleFavorite}
              onClose={onClose}
              onCopy={copyUrl}
              onShare={share}
            />
          </motion.div>

          {/* Mobile: bottom sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="fixed bottom-0 left-0 right-0 z-[78] max-h-[80vh] overflow-y-auto md:hidden"
            style={{
              borderRadius: "16px 16px 0 0",
              background: "#111118",
              borderTop: "1px solid #2A2A38",
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
          >
            <PanelContent
              channel={channel}
              isFavorite={isFavorite}
              copied={copied}
              similarChannels={similarChannels}
              onPlay={onPlay}
              onToggleFavorite={onToggleFavorite}
              onClose={onClose}
              onCopy={copyUrl}
              onShare={share}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function PanelContent({
  channel,
  isFavorite,
  copied,
  similarChannels,
  onPlay,
  onToggleFavorite,
  onClose,
  onCopy,
  onShare,
}: {
  channel: Channel;
  isFavorite: boolean;
  copied: boolean;
  similarChannels: Channel[];
  onPlay: (c: Channel) => void;
  onToggleFavorite: (id: string) => void;
  onClose: () => void;
  onCopy: () => void;
  onShare: () => void;
}) {
  return (
    <>
      {/* Header */}
      <div className="sticky top-0 flex items-center justify-between px-4 py-3 z-10" style={{ background: "#111118" }}>
        <div />
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-card/50 text-text-secondary hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Logo */}
      <div className="flex justify-center mb-3">
        <div
          className="rounded-2xl overflow-hidden flex items-center justify-center"
          style={{
            width: "96px",
            height: "96px",
            background: "#1A1A24",
            border: "1px solid #2A2A38",
          }}
        >
          {channel.logo ? (
            <Image
              src={channel.logo}
              alt={channel.name}
              width={80}
              height={80}
              className="w-4/5 h-4/5 object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
              unoptimized
            />
          ) : (
            <span className="font-display text-3xl text-white">
              {channel.name.charAt(0)}
            </span>
          )}
        </div>
      </div>

      {/* Name */}
      <h2 className="font-display text-[28px] text-white text-center leading-none mb-2 px-4">
        {channel.name}
      </h2>

      {/* Meta */}
      <div className="flex items-center justify-center gap-2 mb-1 px-4">
        <span className="text-text-secondary text-xs">{channel.country}</span>
        <span
          className="px-2 py-0.5 rounded text-[10px] font-medium"
          style={{
            background: `${getCategoryColor(channel.category)}20`,
            color: getCategoryColor(channel.category),
          }}
        >
          {channel.category}
        </span>
      </div>

      {channel.isLive && (
        <div className="flex justify-center mb-3">
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-accent/20 text-accent text-[10px] font-bold live-badge">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            LIVE
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 px-4 mt-3">
        <button
          onClick={() => onPlay(channel)}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-accent hover:bg-accent/90 text-white text-sm font-semibold transition-colors"
        >
          <Play size={16} fill="white" />
          Watch Now
        </button>

        <button
          onClick={() => onToggleFavorite(channel.id)}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium transition-colors"
          style={{
            background: isFavorite ? "rgba(229,9,20,0.15)" : "#1A1A24",
            border: isFavorite ? "1px solid #E50914" : "1px solid #2A2A38",
            color: isFavorite ? "#E50914" : "#9999AA",
          }}
        >
          {isFavorite ? (
            <Heart size={14} fill="#E50914" />
          ) : (
            <Star size={14} />
          )}
          {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        </button>

        <button
          onClick={onCopy}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium transition-colors"
          style={{
            background: copied ? "rgba(34,197,94,0.15)" : "#1A1A24",
            border: copied ? "1px solid #22c55e" : "1px solid #2A2A38",
            color: copied ? "#22c55e" : "#9999AA",
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied!" : "Copy Stream URL"}
        </button>

        <button
          onClick={onShare}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium transition-colors"
          style={{
            background: "#1A1A24",
            border: "1px solid #2A2A38",
            color: "#9999AA",
          }}
        >
          <Share2 size={14} />
          Share
        </button>
      </div>

      {/* Similar Channels */}
      {similarChannels.length > 0 && (
        <div className="mt-6 px-4 pb-4">
          <h3 className="text-white text-sm font-semibold mb-3">
            Similar Channels
          </h3>
          <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            <style jsx>{`div::-webkit-scrollbar{display:none}`}</style>
            {similarChannels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => onPlay(ch)}
                className="flex-shrink-0 w-[100px] rounded-xl p-2 transition-colors hover:bg-card"
                style={{
                  background: "#1A1A24",
                  border: "1px solid #2A2A38",
                }}
              >
                <div className="w-full aspect-square flex items-center justify-center overflow-hidden mb-1">
                  {ch.logo ? (
                    <Image
                      src={ch.logo}
                      alt={ch.name}
                      width={80}
                      height={80}
                      className="w-3/4 h-3/4 object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                      unoptimized
                    />
                  ) : (
                    <span className="text-white text-lg font-bold">
                      {ch.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="text-white text-[10px] font-medium text-center truncate">
                  {ch.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function getCategoryColor(category: string): string {
  const map: Record<string, string> = {
    bangladesh: "#00A550",
    bengali: "#FF6B00",
    sports: "#E50914",
    "hindi-entertainment": "#FF9500",
    "hindi-movies": "#9B59B6",
    news: "#3498DB",
    music: "#E91E8C",
    cartoon: "#F39C12",
    international: "#1ABC9C",
  };
  return map[category] || "#E50914";
}
