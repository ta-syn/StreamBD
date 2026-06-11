"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Flag, Radio, Star, Search, Play, X } from "lucide-react";
import { Channel, ChannelCategory } from "@/types";

interface MobileNavProps {
  activeCategory: ChannelCategory;
  onCategoryChange: (cat: ChannelCategory) => void;
  favoritesCount: number;
  onSearchOpen: () => void;
  favorites: Channel[];
  onPlay: (channel: Channel) => void;
}

const TABS = [
  { id: "home", icon: Home, label: "Home", navCategory: "bangladesh" as const },
  { id: "bd", icon: Flag, label: "Bengali", navCategory: "bengali" as const },
  { id: "sports", icon: Radio, label: "Sports", navCategory: "sports" as const },
  { id: "favorites", icon: Star, label: "Favorites", navCategory: "favorites" as const },
  { id: "search", icon: Search, label: "Search", navCategory: "search" as const },
];

export default function MobileNav({
  activeCategory,
  onCategoryChange,
  favoritesCount,
  onSearchOpen,
  favorites,
  onPlay,
}: MobileNavProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleTabPress = (tab: (typeof TABS)[number]) => {
    if (tab.id === "search") {
      onSearchOpen();
    } else if (tab.id === "favorites") {
      setDrawerOpen(true);
    } else {
      onCategoryChange(tab.navCategory as ChannelCategory);
    }
  };

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around"
        style={{
          height: "64px",
          background: "rgba(17,17,24,0.97)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid #2A2A38",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {TABS.map((tab) => {
          const isActive =
            tab.id === "favorites"
              ? drawerOpen
              : tab.id === "search"
                ? false
                : tab.navCategory === activeCategory;

          const isFavoritesTab = tab.id === "favorites";
          const Icon = tab.icon;

          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.88 }}
              onClick={() => handleTabPress(tab)}
              className="flex flex-col items-center justify-center gap-0.5"
              style={{ minWidth: "44px", minHeight: "44px" }}
            >
              <div className="relative">
                <Icon
                  size={24}
                  color={isActive ? "#E50914" : "#666666"}
                  fill={isActive ? "#E50914" : "none"}
                />
                {isFavoritesTab && favoritesCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center px-1">
                    {favoritesCount}
                  </span>
                )}
              </div>
              <span
                className="text-[10px] font-medium"
                style={{ color: isActive ? "#E50914" : "#666666" }}
              >
                {isFavoritesTab && favoritesCount > 0
                  ? `${tab.label} (${favoritesCount})`
                  : tab.label}
              </span>
            </motion.button>
          );
        })}
      </nav>

      {/* Favorites Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100]"
              style={{ background: "rgba(0,0,0,0.85)" }}
              onClick={() => setDrawerOpen(false)}
            />

            {/* Bottom sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-[110] max-h-[70vh] overflow-y-auto rounded-t-[20px]"
              style={{
                background: "#111118",
                borderTop: "1px solid #2A2A38",
              }}
            >
              {/* Header */}
              <div className="sticky top-0 flex items-center justify-between px-4 py-3" style={{ background: "#111118" }}>
                <div className="flex items-center gap-2">
                  <Star size={18} fill="#E50914" color="#E50914" />
                  <span className="text-white font-semibold text-sm">
                    Favorites
                  </span>
                  <span className="text-text-secondary text-xs">
                    ({favorites.length})
                  </span>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-full hover:bg-card/50 text-text-secondary hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              {favorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Star size={32} className="text-text-secondary" />
                  <p className="text-text-secondary text-sm text-center px-4">
                    No favorites yet. Tap ⭐ on any channel.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 p-4">
                  {favorites.map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => {
                        setDrawerOpen(false);
                        onPlay(ch);
                      }}
                      className="flex items-center gap-3 p-3 rounded-[12px] text-left transition-colors hover:bg-card"
                      style={{
                        background: "#1A1A24",
                        border: "1px solid #2A2A38",
                      }}
                    >
                      <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center overflow-hidden flex-shrink-0">
                        {ch.logo ? (
                          <Image
                            src={ch.logo}
                            alt={ch.name}
                            width={32}
                            height={32}
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                            unoptimized
                          />
                        ) : (
                          <span className="text-white text-xs font-bold">
                            {ch.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-xs font-medium truncate">
                          {ch.name}
                        </div>
                        <div className="text-[10px] text-text-secondary truncate">
                          {ch.category}
                        </div>
                      </div>
                      <Play size={14} className="text-accent flex-shrink-0" fill="#E50914" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
