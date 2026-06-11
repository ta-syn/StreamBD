"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff } from "lucide-react";

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window !== "undefined") {
      return navigator.onLine;
    }
    return true;
  });
  const [showOnlineToast, setShowOnlineToast] = useState(false);

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    setShowOnlineToast(true);
    setTimeout(() => setShowOnlineToast(false), 3000);
  }, []);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
  }, []);

  useEffect(() => {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return (
    <>
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div
              className="flex items-center justify-center gap-2 py-2 px-4 text-sm text-accent"
              style={{
                background: "rgba(229,9,20,0.1)",
                borderBottom: "1px solid rgba(229,9,20,0.3)",
              }}
            >
              <WifiOff size={14} />
              <span>📡 No internet connection — Showing cached data</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showOnlineToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[150] px-4 py-2 rounded-lg text-sm text-white bg-success"
          >
            ✅ Back online!
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
