"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Star, Menu, X } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface NavbarProps {
  favoritesCount: number;
}

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Sports", href: "/sports" },
  { label: "Most Watched", href: "#most-watched" },
];

export default function Navbar({ favoritesCount }: NavbarProps) {
  const { setIsSearchOpen, setIsFavPanelOpen } = useApp();
  const [scrolled, setScrolled] = useState(() => {
    if (typeof window !== "undefined") {
      return window.scrollY > 10;
    }
    return false;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 10);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsSearchOpen]);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-shadow duration-300"
        style={{
          background: scrolled ? "rgba(10,10,15,0.98)" : "rgba(10,10,15,0.95)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          height: "64px",
          borderBottom: "1px solid #2A2A38",
          boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.5)" : "none",
        }}
      >
        <div className="h-full max-w-[1440px] mx-auto px-4 flex items-center justify-between gap-4">
          {/* Left: Logo + Nav links */}
          <div className="flex items-center gap-6 flex-shrink-0">
            <Link href="/" className="flex items-center gap-1 flex-shrink-0">
              <span
                className="font-display text-[28px] leading-none"
                style={{ color: "#E50914" }}
              >
                STREAM
              </span>
              <span
                className="font-display text-[28px] leading-none"
                style={{ color: "#FFFFFF" }}
              >
                BD
              </span>
              <span className="inline-block w-[8px] h-[8px] rounded-full bg-accent live-badge ml-0.5" />
              <span className="hidden sm:inline-flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent/20 text-accent live-badge">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                LIVE
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-1.5 rounded-lg text-sm text-text-secondary hover:text-white transition-colors duration-200 hover:bg-card/50"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Center: Search bar (desktop) + PC shortcut */}
          <div className="hidden md:flex flex-1 justify-center max-w-[400px] mx-auto">
            <button
              onClick={() => setIsSearchOpen(true)}
              data-testid="search-nav-btn"
              className="w-full h-[38px] rounded-[20px] flex items-center gap-2 px-4 text-sm text-text-secondary hover:text-white transition-colors duration-200"
              style={{
                background: "#1A1A24",
                border: "1px solid #2A2A38",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(229,9,20,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#2A2A38";
              }}
            >
              <Search size={16} />
              <span className="flex-1 text-left">Search channels...</span>
              <kbd className="px-1.5 py-0.5 rounded text-[10px] bg-surface text-text-secondary border border-border">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setIsFavPanelOpen?.(true)}
              data-testid="favorites-nav-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-text-secondary hover:text-white hover:bg-card/50 transition-colors duration-200"
            >
              <Star size={16} />
              <span className="hidden sm:inline">Favorites</span>
              {favoritesCount > 0 && (
                <span className="min-w-[18px] h-[18px] rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center px-1">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Mobile: search icon */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden p-2 rounded-lg text-text-secondary hover:text-white hover:bg-card/50 transition-colors"
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            {/* Mobile: hamburger */}
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg text-text-secondary hover:text-white hover:bg-card/50 transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`md:hidden fixed top-0 left-0 right-0 z-40 overflow-hidden transition-all duration-300 ${
          mobileMenuOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
        }`}
        style={{
          background: "rgba(10,10,15,0.98)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          marginTop: "64px",
          borderBottom: mobileMenuOpen ? "1px solid #2A2A38" : "none",
        }}
      >
        <div className="flex flex-col py-2 px-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 text-sm text-text-secondary hover:text-white transition-colors border-b border-border last:border-b-0"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
