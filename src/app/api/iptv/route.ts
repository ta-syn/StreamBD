import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

const URL_MAP: Record<string, string> = {
  bangladesh: "https://iptv-org.github.io/iptv/countries/bd.m3u",
  india: "https://iptv-org.github.io/iptv/countries/in.m3u",
  sports: "https://iptv-org.github.io/iptv/categories/sports.m3u",
  music: "https://iptv-org.github.io/iptv/categories/music.m3u",
  kids: "https://iptv-org.github.io/iptv/categories/kids.m3u",
  news: "https://iptv-org.github.io/iptv/categories/news.m3u",
};

export async function GET(request: NextRequest) {
  // Bypasses network if running E2E tests
  if (request.headers.get("x-playwright-test") === "true") {
    const mockM3U = `#EXTM3U
#EXTINF:-1 tvg-id="ntv-bd" tvg-name="NTV" tvg-logo="https://iptv-org.github.io/iptv/logos/ntv.png" group-title="Bangladesh",NTV
http://example.com/ntv.m3u8
#EXTINF:-1 tvg-id="tsports" tvg-name="T Sports" tvg-logo="https://iptv-org.github.io/iptv/logos/t-sports.png" group-title="Sports",T Sports
http://example.com/tsports.m3u8`;
    return new NextResponse(mockM3U, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  try {
    // Rate limit
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = (forwarded?.split(",")[0] || request.headers.get("x-real-ip") || "unknown").trim();
    const { success, remaining } = await rateLimit(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        {
          status: 429,
          headers: { "X-RateLimit-Remaining": String(remaining) },
        }
      );
    }

    const type = request.nextUrl.searchParams.get("type");

    if (!type || !URL_MAP[type]) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${Object.keys(URL_MAP).join(", ")}` },
        { status: 400 }
      );
    }

    const url = URL_MAP[type];
    const response = await fetch(url, {
      headers: { "Accept": "text/plain" },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.error(`[iptv-proxy] Failed to fetch ${type}: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Failed to fetch playlist from source (${response.status})` },
        { status: 502 }
      );
    }

    const text = await response.text();

    return new NextResponse(text, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        "X-RateLimit-Remaining": String(remaining),
      },
    });
  } catch (err) {
    console.error(`[iptv-proxy] Error:`, err);
    return NextResponse.json(
      { error: "Internal proxy error" },
      { status: 502 }
    );
  }
}
