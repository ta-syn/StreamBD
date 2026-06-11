"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, Play, Trash2 } from "lucide-react";
import { Channel } from "@/types";

interface FavoritesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: Channel[];
  onPlay: (channel: Channel) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

export default function FavoritesPanel({
  isOpen,
  onClose,
  favorites,
  onPlay,
  onRemove,
  onClearAll,
}: FavoritesPanelProps) {
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClearAll = () => {
    if (confirmClear) {
      onClearAll();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80]"
        style={{ background: "rgba(0,0,0,0.7)" }}
        onClick={onClose}
      />

      {/* Desktop: right slide-in */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        data-testid="favorites-panel"
        className="fixed top-0 right-0 z-[85] h-full w-[320px] flex flex-col hidden md:flex"
        style={{ background: "#111118", borderLeft: "1px solid #2A2A38" }}
      >
        <PanelContent
          favorites={favorites}
          onPlay={onPlay}
          onRemove={onRemove}
          onClose={onClose}
          onClearAll={handleClearAll}
          confirmClear={confirmClear}
        />
      </motion.div>

      {/* Mobile: bottom sheet — overrides on md+ */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-[85] max-h-[70vh] overflow-y-auto rounded-t-[20px] md:hidden"
        style={{
          background: "#111118",
          borderTop: "1px solid #2A2A38",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <PanelContent
          favorites={favorites}
          onPlay={onPlay}
          onRemove={onRemove}
          onClose={onClose}
          onClearAll={handleClearAll}
          confirmClear={confirmClear}
        />
      </motion.div>
    </>
  );
}

function PanelContent({
  favorites,
  onPlay,
  onRemove,
  onClose,
  onClearAll,
  confirmClear,
}: {
  favorites: Channel[];
  onPlay: (channel: Channel) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
  onClearAll: () => void;
  confirmClear: boolean;
}) {
  return (
    <>
      {/* Header */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-4 py-3"
        style={{ background: "#111118", borderBottom: "1px solid #2A2A38" }}
      >
        <div className="flex items-center gap-2">
          <Star size={18} fill="#E50914" color="#E50914" />
          <span className="text-white font-semibold text-sm">
            My Favorites ({favorites.length})
          </span>
        </div>
        <div className="flex items-center gap-1">
          {favorites.length > 0 && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors"
              style={{
                color: confirmClear ? "#FFFFFF" : "#9999AA",
                background: confirmClear ? "#E50914" : "transparent",
              }}
            >
              <Trash2 size={12} />
              {confirmClear ? `Remove all ${favorites.length}?` : "Clear All"}
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-card/50 text-text-secondary hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 px-4">
          <Star size={40} className="text-text-secondary" />
          <p className="text-text-secondary text-sm text-center">
            ⭐ No favorites yet. Tap ⭐ on any channel.
          </p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="grid grid-cols-2 gap-3 p-4">
            {favorites.map((ch) => (
              <motion.div
                key={ch.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="relative rounded-xl p-3 group"
                data-testid="favorite-item"
                style={{
                  background: "#1A1A24",
                  border: "1px solid #2A2A38",
                }}
              >
                {/* Remove button */}
                <button
                  onClick={() => onRemove(ch.id)}
                  data-testid="remove-favorite-btn"
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/40 hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <X size={12} color="white" />
                </button>

                {/* Logo */}
                <div className="w-12 h-12 rounded-full bg-card flex items-center justify-center mx-auto mb-2 overflow-hidden">
                  {ch.logo ? (
                    <Image
                      src={ch.logo}
                      alt={ch.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 object-contain"
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

                {/* Name */}
                <div className="text-white text-xs font-medium text-center truncate mb-2">
                  {ch.name}
                </div>

                {/* Play button */}
                <button
                  onClick={() => onPlay(ch)}
                  className="flex items-center justify-center gap-1 w-full py-1.5 rounded-lg text-xs font-medium bg-accent hover:bg-accent/90 text-white transition-colors"
                >
                  <Play size={12} fill="white" />
                  Play
                </button>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </>
  );
}
