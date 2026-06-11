"use client";

import { useMemo, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowLeft, Play, Copy, Share2, Check, Star, Heart } from "lucide-react";
import { useIPTV } from "@/hooks/useIPTV";
import { useFavorites } from "@/hooks/useFavorites";
import { incrementView, addRecentChannel } from "@/lib/favorites";
import { SkeletonCard } from "@/components/Skeleton";

const VideoPlayer = dynamic(() => import("@/components/VideoPlayer"), { ssr: false });

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

export default function WatchPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { channels } = useIPTV();
  const { toggleFavorite, isFavorite } = useFavorites();

  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const channel = useMemo(
    () => channels.find((ch) => ch.id === params.id),
    [channels, params.id]
  );

  const sameCategory = useMemo(
    () =>
      channels
        .filter((ch) => ch.category === channel?.category && ch.id !== channel?.id)
        .slice(0, 8),
    [channels, channel]
  );

  // Restore scroll + log play
  useEffect(() => {
    if (channel) {
      incrementView(channel.id);
      addRecentChannel(channel);
      const saved = sessionStorage.getItem(`scroll-${params.id}`);
      if (saved) window.scrollTo(0, parseInt(saved));
    }
  }, [channel, params.id]);

  // Save scroll on leave
  useEffect(() => {
    const save = () => sessionStorage.setItem(`scroll-${params.id}`, String(window.scrollY));
    window.addEventListener("scroll", save, { passive: true });
    return () => window.removeEventListener("scroll", save);
  }, [params.id]);

  const handleBack = useCallback(() => {
    if (window.history.length > 1) router.back();
    else router.push("/");
  }, [router]);

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
        title: `Watch ${channel.name} Live — StreamBD`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      copyUrl();
    }
  }, [channel, copyUrl]);

  const navigateTo = useCallback(
    (id: string) => router.push(`/watch/${id}`),
    [router]
  );

  // Not found state
  if (!channel) {
    if (channels.length === 0) {
      return (
        <div className="min-h-screen pt-20 px-4" style={{ background: "#0A0A0F" }}>
          <div className="max-w-[800px] mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 py-20" style={{ background: "#0A0A0F" }}>
        <div className="text-4xl">📺</div>
        <h2 className="text-white text-lg font-semibold">Channel not available</h2>
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent hover:bg-accent/90 text-white text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          Back to all channels
        </button>
        <div className="mt-4">
          <p className="text-text-secondary text-xs mb-3 text-center">Try these popular channels:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {channels.filter((ch) => ch.isFeatured).slice(0, 4).map((ch) => (
              <button
                key={ch.id}
                onClick={() => navigateTo(ch.id)}
                className="rounded-xl p-3 text-left transition-colors hover:bg-card"
                style={{ background: "#1A1A24", border: "1px solid #2A2A38" }}
              >
                <div className="text-white text-xs font-medium truncate">{ch.name}</div>
                <div className="text-[10px] text-text-secondary mt-0.5">{ch.category}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const fav = isFavorite(channel.id);

  return (
    <div className="min-h-screen" style={{ background: "#0A0A0F" }}>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VideoObject",
            name: `${channel.name} Live`,
            description: "Live TV stream on StreamBD",
            thumbnailUrl: channel.logo || undefined,
          }),
        }}
      />

      {/* Top bar */}
      <div
        className="sticky top-0 z-40 flex items-center gap-3 px-4 h-[56px]"
        style={{
          background: "rgba(10,10,15,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid #2A2A38",
        }}
      >
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-sm font-medium hover:bg-card/50 transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="flex-1 min-w-0">
          <div className="text-white text-sm font-semibold truncate">
            {channel.name}
          </div>
          <div className="flex items-center gap-2">
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
              style={{
                backgroundColor: `${getCategoryColor(channel.category)}20`,
                color: getCategoryColor(channel.category),
              }}
            >
              {channel.category}
            </span>
          </div>
        </div>

        <button
          onClick={() => toggleFavorite(channel.id)}
          className="p-2 rounded-lg hover:bg-card/50 transition-colors"
          style={{ minWidth: 44, minHeight: 44 }}
        >
          {fav ? (
            <Heart size={20} fill="#E50914" color="#E50914" />
          ) : (
            <Star size={20} color="#9999AA" />
          )}
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-col lg:flex-row max-w-[1600px] mx-auto">
        {/* Player + Info (left 70%) */}
        <div className="flex-1 lg:w-[70%]">
          {/* Player */}
          <div className="relative w-full" style={{ aspectRatio: "16/9", background: "#000" }}>
            {isPlaying ? (
              <VideoPlayer
                channel={channel}
                onClose={() => setIsPlaying(false)}
              />
            ) : (
              <button
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 hover:bg-black/40 transition-colors group"
              >
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play size={28} fill="white" color="white" className="ml-1" />
                </div>
                <span className="text-white text-sm font-medium">Click to play</span>
              </button>
            )}
          </div>

          {/* Channel info card */}
          <div className="px-4 py-4 lg:px-8 lg:py-6">
            <div className="flex items-start gap-4 mb-4">
              <div
                className="rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                style={{
                  width: "72px",
                  height: "72px",
                  background: "#1A1A24",
                  border: "1px solid #2A2A38",
                }}
              >
                {channel.logo ? (
                  <Image
                    src={channel.logo}
                    alt={channel.name}
                    width={56}
                    height={56}
                    className="w-4/5 h-4/5 object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                    unoptimized
                  />
                ) : (
                  <span className="font-display text-2xl text-white">
                    {channel.name.charAt(0)}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="font-display text-white text-2xl leading-none mb-1">
                  {channel.name}
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-text-secondary text-xs">{channel.country}</span>
                  {channel.isLive && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-accent/20 text-accent text-[10px] font-bold live-badge">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      LIVE
                    </span>
                  )}
                  {channel.currentShow && (
                    <span className="text-text-secondary text-xs italic">
                      {channel.currentShow}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={copyUrl}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: copied ? "rgba(34,197,94,0.15)" : "#1A1A24",
                  border: copied ? "1px solid #22c55e" : "1px solid #2A2A38",
                  color: copied ? "#22c55e" : "#9999AA",
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy stream URL"}
              </button>

              <button
                onClick={share}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
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
          </div>
        </div>

        {/* Right sidebar — Related channels */}
        <div className="lg:w-[30%] lg:min-w-[320px] px-4 py-4 lg:px-6 lg:py-6 lg:border-l border-border">
          <h2 className="text-white text-sm font-semibold mb-3">
            📺 Related Channels
          </h2>

          {sameCategory.length === 0 ? (
            <p className="text-text-secondary text-xs">No related channels found</p>
          ) : (
            <div className="flex flex-col gap-2">
              {sameCategory.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => navigateTo(ch.id)}
                  className="flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-card text-left w-full"
                  style={{
                    background: ch.id === channel.id ? "rgba(229,9,20,0.1)" : "transparent",
                    border: "1px solid transparent",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full bg-card flex items-center justify-center overflow-hidden flex-shrink-0"
                  >
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
                    <div
                      className="text-[10px] font-medium truncate"
                      style={{ color: getCategoryColor(ch.category) }}
                    >
                      {ch.category}
                    </div>
                  </div>
                  <Play size={14} className="text-accent flex-shrink-0 opacity-0 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
