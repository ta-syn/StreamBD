"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProvider } from "@/context/AppContext";
import { ToastProvider } from "@/components/Toaster";
import { useState, useEffect } from "react";
import { checkReminders } from "@/lib/reminders";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 30 * 60 * 1000,
            gcTime: 60 * 60 * 1000,
            retry: 2,
            retryDelay: 1000,
          },
        },
      })
  );

  // Fire browser match notifications 15 min before saved reminders
  useEffect(() => {
    checkReminders(); // immediate check on page load
    const id = setInterval(checkReminders, 60 * 1000); // every 60s
    return () => clearInterval(id);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <ToastProvider>{children}</ToastProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}
