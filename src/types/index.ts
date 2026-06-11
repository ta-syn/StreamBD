export type ChannelCategory =
  | "bangladesh"
  | "bengali"
  | "hindi-entertainment"
  | "hindi-movies"
  | "sports"
  | "news"
  | "music"
  | "cartoon"
  | "international";

export interface Channel {
  id: string;
  name: string;
  logo: string;
  streamUrl: string;
  category: ChannelCategory;
  country: string;
  isLive: boolean;
  isFeatured?: boolean;
  currentShow?: string;
  viewCount?: number;
  lastWatched?: number;
  status?: "online" | "offline" | "unknown";
}

export interface SportFixture {
  id: string;
  league: string;
  leagueLogo: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  date: string;
  time: string;
  status: "live" | "upcoming" | "finished";
  score?: string;
  watchChannel?: string;
  sport?: "football" | "cricket" | "tennis" | "other";
  reminder?: boolean;
}

export interface CategoryInfo {
  id: ChannelCategory;
  label: string;
  icon: string;
  color: string;
  count?: number;
}

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: "bangladesh", label: "বাংলাদেশ", icon: "🇧🇩", color: "#00A550" },
  { id: "bengali", label: "বাংলা", icon: "🎭", color: "#FF6B00" },
  { id: "sports", label: "Sports", icon: "⚽", color: "#E50914" },
  { id: "hindi-entertainment", label: "Hindi", icon: "🎬", color: "#FF9500" },
  { id: "hindi-movies", label: "Movies", icon: "🎥", color: "#9B59B6" },
  { id: "news", label: "News", icon: "📰", color: "#3498DB" },
  { id: "music", label: "Music", icon: "🎵", color: "#E91E8C" },
  { id: "cartoon", label: "Cartoon", icon: "🧒", color: "#F39C12" },
  { id: "international", label: "World", icon: "🌍", color: "#1ABC9C" },
];
