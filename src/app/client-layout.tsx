"use client";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import OfflineBanner from "@/components/OfflineBanner";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <OfflineBanner />
      <PWAInstallPrompt />
      {children}
    </ErrorBoundary>
  );
}
