import { Channel } from "@/types";

const BASE_LOGO = "https://iptv-org.github.io/iptv/logos";

export const FALLBACK_CHANNELS: Channel[] = [
  // Bangladesh — isFeatured for top 5
  { id: "ntv-bd", name: "NTV", logo: `${BASE_LOGO}/ntv.png`, streamUrl: "", category: "bangladesh", country: "BD", isLive: true, isFeatured: true, currentShow: "Live News" },
  { id: "somoy-tv", name: "Somoy TV", logo: `${BASE_LOGO}/somoy-tv.png`, streamUrl: "", category: "bangladesh", country: "BD", isLive: true },
  { id: "atn-bangla", name: "ATN Bangla", logo: `${BASE_LOGO}/atn-bangla.png`, streamUrl: "", category: "bangladesh", country: "BD", isLive: true },
  { id: "channel-i", name: "Channel i", logo: `${BASE_LOGO}/channel-i.png`, streamUrl: "", category: "bangladesh", country: "BD", isLive: true },
  { id: "gtv-bd", name: "GTV", logo: `${BASE_LOGO}/gtv.png`, streamUrl: "", category: "bangladesh", country: "BD", isLive: true, isFeatured: true },
  { id: "tsports", name: "T Sports", logo: `${BASE_LOGO}/t-sports.png`, streamUrl: "", category: "sports", country: "BD", isLive: true, isFeatured: true },
  { id: "maasranga", name: "Maasranga TV", logo: `${BASE_LOGO}/maasranga-tv.png`, streamUrl: "", category: "bangladesh", country: "BD", isLive: true },
  { id: "boishakhi", name: "Boishakhi TV", logo: `${BASE_LOGO}/boishakhi-tv.png`, streamUrl: "", category: "bangladesh", country: "BD", isLive: true },
  { id: "rtv-bd", name: "RTV", logo: `${BASE_LOGO}/rtv.png`, streamUrl: "", category: "bangladesh", country: "BD", isLive: true },
  { id: "desh-tv", name: "Desh TV", logo: `${BASE_LOGO}/desh-tv.png`, streamUrl: "", category: "bangladesh", country: "BD", isLive: true },
  { id: "ekattor-tv", name: "Ekattor TV", logo: `${BASE_LOGO}/ekattor-tv.png`, streamUrl: "", category: "news", country: "BD", isLive: true },

  // Bengali
  { id: "star-jalsha", name: "Star Jalsha", logo: `${BASE_LOGO}/star-jalsha.png`, streamUrl: "", category: "bengali", country: "IN", isLive: true, isFeatured: true },
  { id: "zee-bangla", name: "Zee Bangla", logo: `${BASE_LOGO}/zee-bangla.png`, streamUrl: "", category: "bengali", country: "IN", isLive: true, isFeatured: true },
  { id: "jalsha-movies", name: "Jalsha Movies", logo: `${BASE_LOGO}/jalsha-movies.png`, streamUrl: "", category: "bengali", country: "IN", isLive: true },

  // Sports
  { id: "star-sports-1", name: "Star Sports 1", logo: `${BASE_LOGO}/star-sports-1.png`, streamUrl: "", category: "sports", country: "IN", isLive: true },
  { id: "sony-six", name: "Sony Six", logo: `${BASE_LOGO}/sony-six.png`, streamUrl: "", category: "sports", country: "IN", isLive: true },

  // Hindi
  { id: "star-plus", name: "Star Plus", logo: `${BASE_LOGO}/star-plus.png`, streamUrl: "", category: "hindi-entertainment", country: "IN", isLive: true },
  { id: "colors-tv", name: "Colors TV", logo: `${BASE_LOGO}/colors-tv.png`, streamUrl: "", category: "hindi-entertainment", country: "IN", isLive: true },
  { id: "zee-tv", name: "Zee TV", logo: `${BASE_LOGO}/zee-tv.png`, streamUrl: "", category: "hindi-entertainment", country: "IN", isLive: true },

  // Music
  { id: "mtv-india", name: "MTV India", logo: `${BASE_LOGO}/mtv.png`, streamUrl: "", category: "music", country: "IN", isLive: true },
  { id: "channel-v", name: "Channel V", logo: `${BASE_LOGO}/channel-v.png`, streamUrl: "", category: "music", country: "IN", isLive: true },

  // Cartoon
  { id: "cartoon-network", name: "Cartoon Network", logo: `${BASE_LOGO}/cartoon-network.png`, streamUrl: "", category: "cartoon", country: "US", isLive: true },
  { id: "nickelodeon", name: "Nickelodeon", logo: `${BASE_LOGO}/nickelodeon.png`, streamUrl: "", category: "cartoon", country: "US", isLive: true },

  // International
  { id: "bbc-world", name: "BBC World News", logo: `${BASE_LOGO}/bbc-news.png`, streamUrl: "", category: "international", country: "UK", isLive: true },
  { id: "cnn-intl", name: "CNN International", logo: `${BASE_LOGO}/cnn.png`, streamUrl: "", category: "international", country: "US", isLive: true },
];
