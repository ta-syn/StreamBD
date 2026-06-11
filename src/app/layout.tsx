import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import Providers from "./providers";
import { ClientLayout } from "./client-layout";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#E50914",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://streambd.vercel.app"),
  title: "StreamBD — Watch 100+ Live TV Channels Free | Bangladesh #1",
  description:
    "Watch Bangladeshi, Indian, Sports, Music, Cartoon channels live free. T Sports, GTV, NTV, Star Jalsha, Zee Bangla and more — HD quality.",
  keywords: [
    "bangla tv live",
    "bangladesh iptv",
    "bd live tv",
    "t sports live",
    "gtv live",
    "ntv live",
    "star jalsha live",
  ],
  openGraph: {
    title: "StreamBD — Bangladesh #1 Free Live TV",
    description: "Watch 100+ live TV channels free",
    url: "https://streambd.vercel.app",
    siteName: "StreamBD",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StreamBD — BD #1 Free Live TV",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
      style={{ background: "#0A0A0F" }}
    >
      <head>
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
      </head>
      <body
        className="min-h-full flex flex-col bg-[var(--color-bg)]"
      >
        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
