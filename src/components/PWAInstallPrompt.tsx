"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share, PlusSquare } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Detect PWA installation status & environment asynchronously
    const checkPWA = () => {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
      if (isStandalone) return;

      const dismissed = sessionStorage.getItem("streambd_pwa_dismissed");
      if (dismissed === "true") return;

      const userAgent = window.navigator.userAgent;
      const isDeviceIOS = /iPad|iPhone|iPod/.test(userAgent) && !("MSStream" in window);
      const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
      
      setIsIOS(isDeviceIOS);

      if (isDeviceIOS && isSafari) {
        setShowPrompt(true);
      }
    };

    // Delay mount check to prevent synchronous layout/render cascade
    const startTimer = setTimeout(checkPWA, 3000);

    // 2. Android / Chrome beforeinstallprompt handling
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    
    return () => {
      clearTimeout(startTimer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem("streambd_pwa_dismissed", "true");
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="fixed bottom-[74px] left-4 right-4 md:bottom-6 md:right-6 md:left-auto md:w-[360px] z-[90] rounded-2xl p-4 flex flex-col gap-3 shadow-2xl"
          style={{
            background: "rgba(26,26,36,0.92)",
            border: "1px solid rgba(229,9,20,0.3)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.6), 0 0 20px rgba(229,9,20,0.1)",
          }}
        >
          {/* Header section with App info */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden"
                style={{
                  background: "#111118",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <Image
                  src="/icon-192.png"
                  alt="StreamBD Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-white text-sm font-semibold leading-tight">
                  Install StreamBD App
                </h4>
                <p className="text-[11px] text-text-secondary mt-0.5 leading-snug">
                  Add to home screen for full-screen dynamic live TV experience!
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-full text-text-secondary hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>

          {/* Conditional actions based on OS */}
          {isIOS ? (
            <div
              className="rounded-lg p-2.5 flex items-center gap-2.5 text-xs text-text-secondary leading-normal"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <span className="flex-shrink-0 text-accent">
                <Share size={14} />
              </span>
              <span>
                Tap the <strong className="text-white">Share</strong> button in Safari, then select <strong className="text-white">Add to Home Screen</strong> <span className="inline-block text-white font-bold ml-1"><PlusSquare size={13} className="inline mr-0.5" />+</span>.
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={handleDismiss}
                className="flex-1 py-2 rounded-lg text-xs font-medium text-text-secondary hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                Not Now
              </button>
              <button
                onClick={handleInstallClick}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-accent hover:bg-accent/90 text-white transition-colors"
              >
                <Download size={13} />
                Install App
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
