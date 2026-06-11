"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Channel } from "@/types";

interface ChannelRowProps {
  title: string;
  channels: Channel[];
  onPlay: (channel: Channel) => void;
  showViewCount?: boolean;
  viewCounts?: Record<string, number>;
  onInfo?: (channel: Channel) => void;
}

export default function ChannelRow({
  title,
  channels,
  onPlay,
  showViewCount,
  viewCounts,
  onInfo,
}: ChannelRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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
  }, [checkScroll, channels]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -400 : 400, behavior: "smooth" });
  };

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold text-base font-body">{title}</h3>
        <div className="hidden md:flex items-center gap-1">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="p-1 rounded transition-opacity"
            style={{ opacity: canScrollLeft ? 1 : 0.3 }}
          >
            <ChevronLeft size={18} color="white" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="p-1 rounded transition-opacity"
            style={{ opacity: canScrollRight ? 1 : 0.3 }}
          >
            <ChevronRight size={18} color="white" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {channels.map((ch, i) => (
          <motion.button
            key={ch.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            onClick={() => onPlay(ch)}
            onContextMenu={(e) => {
              e.preventDefault();
              onInfo?.(ch);
            }}
            className="group flex-shrink-0 w-[140px] rounded-xl overflow-hidden transition-all duration-200 text-left"
            style={{
              background: "#1A1A24",
              border: "1px solid #2A2A38",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(229,9,20,0.5)";
              e.currentTarget.style.transform = "scale(1.04)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#2A2A38";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {/* Square logo */}
            <div
              className="w-full flex items-center justify-center overflow-hidden"
              style={{
                aspectRatio: "1/1",
                background: "#111118",
              }}
            >
              {ch.logo ? (
                <Image
                  src={ch.logo}
                  alt={ch.name}
                  width={105}
                  height={105}
                  className="w-3/4 h-3/4 object-contain group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                  unoptimized
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: getHashColor(ch.name) }}
                >
                  <span className="text-white font-bold text-lg">
                    {ch.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Name + optional view count */}
            <div className="p-2 flex flex-col gap-0.5">
              <div className="text-white text-xs font-medium truncate leading-tight">
                {ch.name}
              </div>
              {showViewCount && viewCounts && (
                <div className="flex items-center gap-1 text-[10px] text-text-secondary">
                  <Eye size={10} />
                  {viewCounts[ch.id] ?? 0}
                </div>
              )}
            </div>

            {/* Play overlay on hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <div
                  className="ml-0.5"
                  style={{
                    width: 0,
                    height: 0,
                    borderTop: "6px solid transparent",
                    borderBottom: "6px solid transparent",
                    borderLeft: "10px solid white",
                  }}
                />
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
}

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

function getHashColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return HASH_COLORS[Math.abs(hash) % HASH_COLORS.length];
}
