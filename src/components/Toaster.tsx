"use client";

import { createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { useApp } from "@/context/AppContext";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastContextValue {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx.showToast;
}

const TOAST_CONFIG: Record<ToastType, { icon: string; border: string; Icon: typeof CheckCircle }> = {
  success: { icon: "✅", border: "#22c55e", Icon: CheckCircle },
  error: { icon: "❌", border: "#ef4444", Icon: AlertCircle },
  info: { icon: "ℹ️", border: "#3b82f6", Icon: Info },
  warning: { icon: "⚠️", border: "#f59e0b", Icon: AlertTriangle },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { addToast, toasts, removeToast } = useApp();

  const showToast = (message: string, type: ToastType) => {
    addToast(message, type);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 md:left-auto md:right-4 md:translate-x-0 z-[9999] flex flex-col gap-2 pointer-events-none w-[90vw] max-w-[400px] md:w-auto">
        <AnimatePresence>
          {toasts.map((toast) => {
            const config = TOAST_CONFIG[toast.type];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 100, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="pointer-events-auto relative overflow-hidden flex items-center gap-2 px-4 py-3 rounded-[10px]"
                style={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderLeft: `3px solid ${config.border}`,
                  boxShadow: `0 4px 20px ${config.border}20`,
                }}
              >
                <span className="text-sm">{config.icon}</span>
                <span className="text-white text-sm flex-1">{toast.message}</span>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-text-secondary hover:text-white transition-colors flex-shrink-0"
                  style={{ minWidth: 32, minHeight: 32 }}
                >
                  <X size={14} />
                </button>

                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 3, ease: "linear" }}
                  className="absolute bottom-0 left-0 h-[3px] rounded-b-[10px]"
                  style={{ background: config.border }}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
