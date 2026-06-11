"use client";
import {
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import Hls from "hls.js";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  PictureInPicture2,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { Channel } from "@/types";
import { addRecentChannel } from "@/lib/favorites";
import { markChannelOffline, reportStream } from "@/lib/channel-checker";
import { useApp } from "@/context/AppContext";

interface VideoPlayerProps {
  channel: Channel;
  onClose?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export function VideoPlayer({
  channel,
  onClose,
  onNext,
  onPrev,
}: VideoPlayerProps) {
  const { setSelectedChannel } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastTapRef = useRef<{ time: number; side: "left" | "right" | null }>({
    time: 0,
    side: null,
  });
  const touchStartY = useRef(0);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffering, setBuffering] = useState(true);
  const [error, setError] = useState(false);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [reported, setReported] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [pip, setPip] = useState(false);

  const handleClose = useCallback(() => {
    onClose?.();
    setSelectedChannel(null);
  }, [onClose, setSelectedChannel]);

  // --- HLS init ---
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setBuffering(true);
    setError(false);
    setPlaying(false);
    retryCountRef.current = 0;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const streamUrl = channel.streamUrl;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.play().catch(() => {});
    } else if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setBuffering(false);
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          if (retryCountRef.current < 2) {
            // Retry after 2s delay
            data.fatal = false;
            setBuffering(true);
            retryTimerRef.current = setTimeout(() => {
              retryCountRef.current += 1;
              hls.recoverMediaError();
            }, 2000);
          } else {
            setError(true);
            setBuffering(false);
            markChannelOffline(channel.streamUrl);
          }
        }
      });
    } else {
      if (retryCountRef.current < 2) {
        setBuffering(true);
        retryTimerRef.current = setTimeout(() => {
          retryCountRef.current += 1;
          video.src = streamUrl;
          video.load();
        }, 2000);
      } else {
        setError(true);
        setBuffering(false);
        markChannelOffline(channel.streamUrl);
      }
    }

    const onWaiting = () => setBuffering(true);
    const onPlaying = () => {
      setBuffering(false);
      setPlaying(true);
    };
    const onPause = () => setPlaying(false);
    const onDuration = () => setDuration(video.duration);
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onLoadedData = () => setBuffering(false);

    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("pause", onPause);
    video.addEventListener("durationchange", onDuration);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadeddata", onLoadedData);

    // Log recent channel
    addRecentChannel(channel);

    return () => {
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("durationchange", onDuration);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadeddata", onLoadedData);
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel]);

  // --- Fullscreen ---
  useEffect(() => {
    const el = containerRef.current;
    const handler = () => setFullscreen(!!document.fullscreenElement);
    if (el) el.addEventListener("fullscreenchange", handler);
    return () => el?.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  }, []);

  // --- PiP ---
  const togglePip = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setPip(false);
      } else {
        await video.requestPictureInPicture();
        setPip(true);
      }
    } catch {
      // PiP not supported
    }
  }, []);

  // --- Controls auto-hide ---
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowControls(true);
    }, 0);
    clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
    return () => {
      clearTimeout(timer);
      clearTimeout(controlsTimer.current);
    };
  }, [playing]);

  // --- Keyboard shortcuts ---
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          if (videoRef.current?.paused) videoRef.current?.play();
          else videoRef.current?.pause();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "m":
          setMuted((m) => !m);
          break;
        case "ArrowLeft":
          onPrev?.();
          break;
        case "ArrowRight":
          onNext?.();
          break;
        case "Escape":
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            handleClose();
          }
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleClose, onNext, onPrev, toggleFullscreen]);

  // --- Mobile gestures ---
  const handleTap = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      let clientX: number;
      if ("touches" in e) {
        clientX = e.touches[0]?.clientX || e.changedTouches[0]?.clientX || 0;
      } else {
        clientX = e.clientX;
      }

      const side = clientX < rect.left + rect.width / 2 ? "left" : "right";
      const now = Date.now();
      const prev = lastTapRef.current;

      if (prev.side === side && now - prev.time < 300) {
        if (side === "left") onPrev?.();
        else onNext?.();
        lastTapRef.current = { time: 0, side: null };
      } else {
        lastTapRef.current = { time: now, side };
        resetControlsTimer();
      }
    },
    [onNext, onPrev, resetControlsTimer]
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const dy = e.changedTouches[0].clientY - touchStartY.current;
      if (dy > 80) {
        handleClose();
      }
    },
    [handleClose]
  );

  // --- Sync muted/volume to video ---
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
      videoRef.current.volume = volume;
    }
  }, [muted, volume]);

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100]"
        style={{ background: "rgba(0,0,0,0.95)" }}
        onClick={onClose}
      />

      {/* Player container */}
      <motion.div
        ref={containerRef}
        key="player"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed inset-0 z-[101] flex items-center justify-center pointer-events-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative w-full h-full flex items-center justify-center pointer-events-auto"
          onMouseMove={resetControlsTimer}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={handleTap}
        >
          <video
            ref={videoRef}
            className="max-w-full max-h-full w-auto h-auto object-contain"
            playsInline
            autoPlay
            muted={muted}
          />

          {/* Loading spinner */}
          {buffering && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div
                className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin"
                style={{ borderTopColor: "transparent" }}
              />
              <span className="text-white text-sm font-medium">{channel.name}</span>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <AlertTriangle size={40} className="text-accent" />
              <p className="text-white text-sm text-center max-w-xs">
                ❌ Stream offline
              </p>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onNext) onNext();
                    else handleClose();
                  }}
                  className="px-5 py-2 rounded-lg bg-accent hover:bg-accent/90 text-white text-sm font-medium transition-colors"
                >
                  Try Another
                </button>
                {!reported && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      reportStream(channel.id);
                      setReported(true);
                    }}
                    className="px-5 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      background: "#1A1A24",
                      border: "1px solid #2A2A38",
                      color: "#9999AA",
                    }}
                  >
                    📢 Report this stream
                  </button>
                )}
              </div>
              {reported && (
                <p className="text-success text-xs">
                  Thanks! We&apos;ll look into it ✅
                </p>
              )}
            </div>
          )}

          {/* --- Controls overlay --- */}
          <div
            className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-300 ${
              showControls ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {/* Top bar */}
            <div
              className="flex items-center gap-3 p-4"
              style={{
                background: "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)",
              }}
            >
              {channel.logo && (
                <Image
                  src={channel.logo}
                  alt={channel.name}
                  width={32}
                  height={32}
                  className="rounded object-contain bg-black/40"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                  unoptimized
                />
              )}
              <span className="text-white font-semibold text-sm flex-1 truncate">
                {channel.name}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Close player"
              >
                <X size={18} color="white" />
              </button>
            </div>

            {/* Bottom bar */}
            <div
              className="flex flex-col gap-2 p-4"
              style={{
                background: "linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%)",
              }}
            >
              {/* Seek bar (hidden for live streams) */}
              {!channel.isLive && isFinite(duration) && duration > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-white/70 min-w-[40px]">
                    {formatTime(currentTime)}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={duration || 1}
                    value={currentTime}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (videoRef.current) videoRef.current.currentTime = v;
                      setCurrentTime(v);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 h-1 appearance-none cursor-pointer"
                    aria-label="Seek time"
                    style={{
                      background: `linear-gradient(to right, #E50914 ${
                        (currentTime / (duration || 1)) * 100
                      }%, #444 ${(currentTime / (duration || 1)) * 100}%)`,
                      borderRadius: "4px",
                    }}
                  />
                  <span className="text-[11px] text-white/70 min-w-[40px] text-right">
                    {formatTime(duration)}
                  </span>
                </div>
              )}

              {/* Control buttons */}
              <div className="flex items-center gap-2">
                {/* Prev */}
                {onPrev && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPrev();
                    }}
                    className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                    aria-label="Previous channel"
                  >
                    <ChevronLeft size={20} color="white" />
                  </button>
                )}

                {/* Play/Pause */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (videoRef.current?.paused) {
                      videoRef.current?.play();
                    } else {
                      videoRef.current?.pause();
                    }
                  }}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                  aria-label={playing ? "Pause" : "Play"}
                >
                  {playing ? (
                    <Pause size={22} fill="white" color="white" />
                  ) : (
                    <Play size={22} fill="white" color="white" className="ml-0.5" />
                  )}
                </button>

                {/* Next */}
                {onNext && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNext();
                    }}
                    className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                    aria-label="Next channel"
                  >
                    <ChevronRight size={20} color="white" />
                  </button>
                )}

                {/* Channel name + LIVE */}
                <span className="ml-2 text-white text-xs font-medium truncate flex-1">
                  {channel.name}
                </span>
                {channel.isLive && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-accent/90 text-white text-[10px] font-bold live-badge">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    LIVE
                  </span>
                )}

                {/* Volume */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMuted((m) => !m);
                  }}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                  aria-label={muted || volume === 0 ? "Unmute" : "Mute"}
                >
                  {muted || volume === 0 ? (
                    <VolumeX size={18} color="white" />
                  ) : (
                    <Volume2 size={18} color="white" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={muted ? 0 : volume}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setVolume(v);
                    if (v > 0) setMuted(false);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-20 h-1 appearance-none cursor-pointer"
                  aria-label="Volume"
                  style={{
                    background: `linear-gradient(to right, white ${
                      (muted ? 0 : volume) * 100
                    }%, #444 ${(muted ? 0 : volume) * 100}%)`,
                    borderRadius: "4px",
                  }}
                />

                {/* PiP */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePip();
                  }}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                  aria-label="Picture in Picture"
                >
                  <PictureInPicture2 size={18} color={pip ? "#E50914" : "white"} />
                </button>

                {/* Fullscreen */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFullscreen();
                  }}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                  aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {fullscreen ? (
                    <Minimize size={18} color="white" />
                  ) : (
                    <Maximize size={18} color="white" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Dynamic import wrapper for SSR
const DynamicVideoPlayer = dynamic(() => Promise.resolve(VideoPlayer), {
  ssr: false,
});

export default DynamicVideoPlayer;
