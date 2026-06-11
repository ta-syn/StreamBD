"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Channel } from "@/types";

const ROTATION_INTERVAL = 6000;

interface FeaturedBannerProps {
  channels: Channel[];
  onPlay: (channel: Channel) => void;
  onToggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
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

export default function FeaturedBanner({
  channels,
  onPlay,
  onToggleFavorite,
  isFavorite,
}: FeaturedBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const featured = useMemo(() => channels.slice(0, 5), [channels]);
  const active = featured[currentIndex] || featured[0];

  useEffect(() => {
    if (isHovered || featured.length <= 1) return;
    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length);
    }, ROTATION_INTERVAL);
    return () => clearInterval(id);
  }, [isHovered, featured.length]);

  const goTo = useCallback(
    (idx: number) => {
      setCurrentIndex(((idx % featured.length) + featured.length) % featured.length);
    },
    [featured.length]
  );

  if (!active) return null;

  return (
    <div
      className="relative w-full overflow-hidden h-[260px] sm:h-[420px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {/* Blurred background */}
          {active.logo && (
            <div
              className="absolute inset-0 scale-110"
              style={{
                backgroundImage: `url(${active.logo})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(40px)",
              }}
            />
          )}

          {/* Dark overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(10,10,15,0.95) 0%, rgba(10,10,15,0.7) 50%, rgba(10,10,15,0.3) 100%)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-1/2"
            style={{
              background:
                "linear-gradient(to top, #0A0A0F 0%, transparent 40%)",
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id + "-content"}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 flex items-center px-6 sm:px-12 lg:px-20"
        >
          <div className="flex items-center justify-between w-full max-w-[1200px] mx-auto">
            {/* Left content */}
            <div className="flex flex-col gap-3 max-w-[600px]">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-accent/20 text-accent text-[11px] font-bold live-badge w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                LIVE NOW
              </div>

              <h1 className="font-display text-white leading-none text-[36px] sm:text-[64px]">
                {active.name}
              </h1>

              {active.currentShow && (
                <p className="text-text-secondary text-sm italic">
                  {active.currentShow}
                </p>
              )}

              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-medium"
                  style={{
                    backgroundColor: `${getCategoryColor(active.category)}20`,
                    color: getCategoryColor(active.category),
                  }}
                >
                  {active.category}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mt-2">
                <button
                  onClick={() => onPlay(active)}
                  className="flex sm:w-auto w-full items-center justify-center gap-1.5 px-6 rounded-lg bg-accent hover:bg-accent/90 active:scale-95 text-white text-sm font-semibold transition-colors"
                  style={{ height: "48px", borderRadius: "8px" }}
                >
                  <Play size={16} fill="white" />
                  Watch Now
                </button>
                <button
                  onClick={() => onToggleFavorite(active.id)}
                  className="flex sm:w-auto w-full items-center justify-center gap-1.5 px-5 rounded-lg text-sm font-medium active:scale-95 transition-colors"
                  style={{
                    height: "48px",
                    borderRadius: "8px",
                    background: "transparent",
                    border: "1px solid #2A2A38",
                    color: isFavorite(active.id) ? "#E50914" : "#9999AA",
                  }}
                >
                  <Star
                    size={16}
                    fill={isFavorite(active.id) ? "#E50914" : "none"}
                    color={isFavorite(active.id) ? "#E50914" : "#9999AA"}
                  />
                  Favorites
                </button>
              </div>
            </div>

            {/* Right: channel logo card — desktop only */}
            <div
              className="hidden lg:flex items-center justify-center flex-shrink-0 rounded-[16px] overflow-hidden"
              style={{
                width: "160px",
                height: "160px",
                background: "rgba(26,26,36,0.8)",
                border: "1px solid #2A2A38",
              }}
            >
              {active.logo && (
                <Image
                  src={active.logo}
                  alt={active.name}
                  width={128}
                  height={128}
                  className="max-w-[80%] max-h-[80%] object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                  unoptimized
                />
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Bottom: dots + arrows */}
      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4">
        <button
          onClick={() => goTo(currentIndex - 1)}
          className="p-1 rounded-full hover:bg-white/10 transition-colors"
          style={{ width: "32px", height: "32px" }}
        >
          <ChevronLeft size={18} color="white" />
        </button>

        <div className="flex items-center gap-2">
          {featured.map((ch, idx) => (
            <button
              key={ch.id}
              onClick={() => goTo(idx)}
              className="rounded-full transition-colors"
              style={{
                width: idx === currentIndex ? "8px" : "6px",
                height: idx === currentIndex ? "8px" : "6px",
                backgroundColor:
                  idx === currentIndex ? "#E50914" : "#555555",
              }}
            />
          ))}
        </div>

        <button
          onClick={() => goTo(currentIndex + 1)}
          className="p-1 rounded-full hover:bg-white/10 transition-colors"
          style={{ width: "32px", height: "32px" }}
        >
          <ChevronRight size={18} color="white" />
        </button>
      </div>
    </div>
  );
}
