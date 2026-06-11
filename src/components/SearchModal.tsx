"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Play, Monitor } from "lucide-react";
import { Channel } from "@/types";

const RECENT_SEARCHES_KEY = "streambd_search_history";
const MAX_RESULTS = 20;
const MAX_RECENT = 5;

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  channels: Channel[];
  onPlay: (channel: Channel) => void;
}

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(term: string) {
  if (typeof window === "undefined") return;
  const recent = getRecentSearches().filter((t) => t !== term);
  recent.unshift(term);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

function removeRecentSearch(term: string) {
  if (typeof window === "undefined") return;
  const recent = getRecentSearches().filter((t) => t !== term);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent));
}

export default function SearchModal({
  isOpen,
  onClose,
  channels,
  onPlay,
}: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Global Ctrl+K and Escape (only active if modal is open)
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        onClose();
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Auto-focus + load recent
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setRecentSearches(getRecentSearches());
      }, 0);
      setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Filter results
  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const q = debouncedQuery.toLowerCase().trim();
    return channels
      .filter((c) => c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q))
      .slice(0, MAX_RESULTS);
  }, [channels, debouncedQuery]);



  const handlePlay = useCallback(
    (channel: Channel) => {
      saveRecentSearch(channel.name);
      onClose();
      setQuery("");
      onPlay(channel);
    },
    [onClose, onPlay]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        handlePlay(results[selectedIndex]);
      }
    },
    [results, selectedIndex, onClose, handlePlay]
  );

  // Scroll selected into view
  useEffect(() => {
    if (resultsRef.current) {
      const el = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (el) el.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[90] flex items-start justify-center pt-[15vh] px-4"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            data-testid="search-modal"
            className="w-full max-w-[580px] rounded-[16px] overflow-hidden"
            style={{
              background: "#111118",
              border: "1px solid #2A2A38",
            }}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 h-[52px] border-b border-border">
              <Search size={18} className="text-text-secondary flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search channels..."
                className="flex-1 bg-transparent text-white text-[16px] outline-none placeholder:text-text-secondary"
                style={{ fontSize: "16px" }}
              />
              <kbd className="hidden sm:inline px-1.5 py-0.5 rounded text-[10px] text-text-secondary bg-card border border-border">
                ESC
              </kbd>
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-card/50 text-text-secondary hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Results area */}
            <div className="max-h-[400px] overflow-y-auto" ref={resultsRef}>
              {!debouncedQuery && recentSearches.length > 0 && (
                <div className="p-3">
                  <p className="text-[11px] text-text-secondary mb-2">
                    🕐 Recent
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-text-secondary bg-card border border-border hover:text-white hover:border-accent/50 transition-colors"
                      >
                        {term}
                        <X
                          size={12}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRecentSearch(term);
                            setRecentSearches(getRecentSearches());
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {debouncedQuery && results.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-10">
                  <Monitor size={32} className="text-text-secondary" />
                  <p className="text-text-secondary text-sm">
                    No channels found for &apos;{debouncedQuery}&apos;
                  </p>
                  <p className="text-text-secondary text-xs">
                    Try: NTV, T Sports, Star Jalsha
                  </p>
                </div>
              )}

              {results.map((channel, index) => (
                <button
                  key={channel.id}
                  onClick={() => handlePlay(channel)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className="flex items-center gap-3 w-full px-4 transition-colors group"
                  style={{
                    height: "52px",
                    background: index === selectedIndex ? "rgba(229,9,20,0.1)" : "transparent",
                  }}
                >
                  {/* Logo */}
                  <div className="w-9 h-9 rounded-full bg-card flex items-center justify-center overflow-hidden flex-shrink-0">
                    {channel.logo ? (
                      <Image
                        src={channel.logo}
                        alt={channel.name}
                        width={28}
                        height={28}
                        className="w-7 h-7 object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                        unoptimized
                      />
                    ) : (
                      <span className="text-white text-xs font-bold">
                        {channel.name.charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* Name + category */}
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-white text-sm font-medium truncate">
                      {channel.name}
                    </div>
                    <div
                      className="text-[10px] font-medium truncate"
                      style={{ color: "#E50914" }}
                    >
                      {channel.category}
                    </div>
                  </div>

                  {/* Play icon */}
                  <Play
                    size={16}
                    className={`flex-shrink-0 transition-opacity ${
                      index === selectedIndex ? "opacity-100 text-accent" : "opacity-0 group-hover:opacity-100 text-white"
                    }`}
                  />
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
