"use client";

import { createContext, useContext, useReducer, useState, useCallback, type ReactNode } from "react";
import { Channel } from "@/types";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

type ToastAction =
  | { type: "ADD"; toast: Toast }
  | { type: "REMOVE"; id: string };

function toastReducer(state: Toast[], action: ToastAction): Toast[] {
  switch (action.type) {
    case "ADD": {
      const next = [...state, action.toast];
      return next.length > 3 ? next.slice(-3) : next;
    }
    case "REMOVE":
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

interface AppContextType {
  selectedChannel: Channel | null;
  setSelectedChannel: (ch: Channel | null) => void;
  toasts: Toast[];
  addToast: (message: string, type: Toast["type"], duration?: number) => void;
  removeToast: (id: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isFavPanelOpen: boolean;
  setIsFavPanelOpen: (open: boolean) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFavPanelOpen, setIsFavPanelOpen] = useState(false);
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const addToast = useCallback(
    (message: string, type: Toast["type"], duration = 3000) => {
      const id = Math.random().toString(36).slice(2, 10);
      dispatch({ type: "ADD", toast: { id, message, type } });
      setTimeout(() => dispatch({ type: "REMOVE", id }), duration);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    dispatch({ type: "REMOVE", id });
  }, []);

  return (
    <AppContext.Provider
      value={{
        selectedChannel,
        setSelectedChannel,
        toasts,
        addToast,
        removeToast,
        isSearchOpen,
        setIsSearchOpen,
        isFavPanelOpen,
        setIsFavPanelOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
