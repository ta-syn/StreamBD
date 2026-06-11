"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";

export default function BackToTop() {
  const [visible, setVisible] = useState(() => {
    if (typeof window !== "undefined") {
      return window.scrollY > 500;
    }
    return false;
  });

  const handleScroll = useCallback(() => {
    setVisible(window.scrollY > 500);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          onClick={scrollToTop}
          className="fixed z-40 flex items-center justify-center rounded-full bg-accent hover:bg-accent/90 shadow-lg transition-colors"
          style={{
            bottom: "80px",
            right: "20px",
            width: "44px",
            height: "44px",
          }}
          aria-label="Back to top"
        >
          <ChevronUp size={22} color="white" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
