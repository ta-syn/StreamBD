"use client";

import { Globe, Play, Send } from "lucide-react";
import { CATEGORIES } from "@/types";

interface FooterProps {
  channelCount: number;
  lastUpdatedMinutes: number;
}

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Sports Live", href: "/sports" },
  { label: "Favorites", href: "#favorites" },
  { label: "Most Watched", href: "#most-watched" },
  { label: "All Channels", href: "/" },
];

const SOCIAL_LINKS = [
  { icon: Globe, href: "#", label: "Website" },
  { icon: Play, href: "#", label: "YouTube" },
  { icon: Send, href: "#", label: "Telegram" },
];

export default function Footer({ channelCount, lastUpdatedMinutes }: FooterProps) {
  return (
    <footer className="mt-12" style={{ background: "var(--color-surface)" }}>
      {/* Top border with glow */}
      <div
        className="h-px w-full"
        style={{
          background: "#2A2A38",
          boxShadow: "0 0 6px rgba(229,9,20,0.15)",
        }}
      />

      <div className="max-w-[1200px] mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1 — Branding */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-1">
              <span className="font-display text-2xl" style={{ color: "#E50914" }}>
                STREAM
              </span>
              <span className="font-display text-2xl text-white">BD</span>
            </div>
            <p className="text-text-secondary text-xs leading-relaxed">
              বাংলাদেশের #1 Free Live TV Platform
            </p>
            <div className="flex items-center gap-2 mt-1">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="flex items-center justify-center rounded-full transition-colors hover:bg-accent hover:text-white"
                    style={{
                      width: "36px",
                      height: "36px",
                      background: "#1A1A24",
                      color: "#9999AA",
                    }}
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Column 2 — Quick Links */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Quick Links</h4>
            <div className="flex flex-col gap-2">
              {QUICK_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-text-secondary text-xs hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Column 3 — Categories */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Categories</h4>
            <div className="flex flex-col gap-2">
              {CATEGORIES.map((cat) => (
                <a
                  key={cat.id}
                  href={`/?category=${cat.id}`}
                  className="text-text-secondary text-xs hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Column 4 — Info */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Info</h4>
            <div className="flex flex-col gap-2 text-xs">
              <div className="text-text-secondary">
                📺 {channelCount} channels loaded
              </div>
              <div className="text-text-secondary">
                🔄 Updated {lastUpdatedMinutes === 0 ? "just now" : `${lastUpdatedMinutes} minutes ago`}
              </div>
              <div className="text-text-secondary">
                🟢 All systems operational
              </div>
              <div className="text-text-secondary">
                💻 Works best on Chrome + Firefox
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border" style={{ background: "var(--color-bg)" }}>
        <div className="max-w-[1200px] mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-text-secondary">
          <span>
            © 2026 StreamBD by{" "}
            <span
              style={{
                background: "linear-gradient(to right, #FF4D4D, #E50914, #FF007D)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: "bold",
                display: "inline-block",
              }}
            >
              Ta-syn Islam
            </span>
            . All rights reserved.
          </span>
          <span>
            Built with Passion by{" "}
            <span
              style={{
                background: "linear-gradient(to right, #FF4D4D, #E50914, #FF007D)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: "bold",
                display: "inline-block",
              }}
            >
              Ta-syn Islam
            </span>{" "}
            🇧🇩
          </span>
          <span className="flex items-center gap-3">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <span className="text-border">|</span>
            <a href="#" className="hover:text-white transition-colors">
              Terms
            </a>
          </span>
        </div>
      </div>

      {/* Disclaimer */}
      <div
        className="px-4 py-3 text-center text-[11px] text-text-secondary leading-relaxed"
        style={{
          background: "rgba(229,9,20,0.05)",
          borderTop: "1px solid rgba(229,9,20,0.1)",
        }}
      >
        ⚠️ We do not host any video content. All streams are publicly available on
        the internet. StreamBD is not responsible for the content of external streams.
      </div>
    </footer>
  );
}
