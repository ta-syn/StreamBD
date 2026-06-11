"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChannelCategory, CATEGORIES } from "@/types";

interface CategoryTabsProps {
  activeCategory: ChannelCategory;
  onCategoryChange: (cat: ChannelCategory) => void;
  channelCounts: Record<ChannelCategory, number>;
}

export default function CategoryTabs({
  activeCategory,
  onCategoryChange,
  channelCounts,
}: CategoryTabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tabsRef.current) {
      const container = tabsRef.current;
      const activeEl = container.querySelector<HTMLButtonElement>(
        `[data-category="${activeCategory}"]`
      );
      if (activeEl) {
        const scrollLeft =
          activeEl.offsetLeft - container.offsetWidth / 2 + activeEl.offsetWidth / 2;
        container.scrollTo({ left: scrollLeft, behavior: "smooth" });
      }
    }
  }, [activeCategory]);

  return (
    <div
      className="sticky z-40 flex items-center overflow-x-auto scroll-touch"
      style={{
        top: "64px",
        background: "#111118",
        borderBottom: "1px solid #2A2A38",
        padding: "0 12px",
        height: "60px",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
      ref={tabsRef}
    >
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="flex items-center gap-2">
        {CATEGORIES.map((cat) => {
          const isActive = cat.id === activeCategory;
          const count = channelCounts[cat.id] ?? 0;

          return (
            <motion.button
              key={cat.id}
              data-category={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              layout
              className="relative flex items-center gap-1.5 rounded-[20px] px-3 sm:px-4 text-sm font-medium whitespace-nowrap active:scale-95"
              style={{
                height: "44px",
                backgroundColor: isActive ? `${cat.color}20` : "transparent",
                border: `1px solid ${isActive ? cat.color : "#2A2A38"}`,
                color: isActive ? "#FFFFFF" : "#9999AA",
                boxShadow: isActive ? `0 0 10px ${cat.color}30` : "none",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "#1A1A24";
                  e.currentTarget.style.color = "#FFFFFF";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#9999AA";
                }
              }}
            >
              {isActive && (
                <span
                  className="inline-block w-[6px] h-[6px] rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
              )}
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              {count > 0 && (
                <span className="text-[10px] leading-none opacity-70">
                  ({count})
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
