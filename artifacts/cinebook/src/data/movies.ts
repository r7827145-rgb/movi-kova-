export interface FBOCombo {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
}

export interface Showtime {
  id: string;
  time: string;
  date: string;
  format: string;
  price: number;
  hallName: string;
}

export interface Movie {
  id: string;
  title: string;
  tagline: string;
  synopsis: string;
  genre: string[];
  rating: string;
  duration: number;
  year: number;
  director: string;
  cast: { name: string; role: string; }[];
  posterUrl: string;
  backdropUrl: string;
  trailerYoutubeId: string;
  score: number;
  showtimes: Showtime[];
  isNowShowing: boolean;
  isComingSoon: boolean;
  streamUrl?: string;
  isStreamable?: boolean;
  isPremium?: boolean;
}

const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

export const movies: Movie[] = [
  {
    id: "dune3",
    title: "DUNE: PART THREE",
    tagline: "The final war begins.",
    synopsis: "Paul Atreides faces the ultimate test of his prescience as the great houses of the Landsraad unite against him. A sweeping conclusion to the sci-fi epic.",
    genre: ["SCI-FI", "EPIC", "DRAMA"],
    rating: "PG-13",
    duration: 175,
    year: 2026,
    director: "Denis Villeneuve",
    cast: [
      { name: "Timothée Chalamet", role: "Paul Atreides" },
      { name: "Zendaya", role: "Chani" },
      { name: "Florence Pugh", role: "Princess Irulan" }
    ],
    posterUrl: "/posters/dune3.png",
    backdropUrl: "https://picsum.photos/seed/dune3b/1200/600",
    trailerYoutubeId: "U2Qp5pL3ovA",
    score: 94,
    showtimes: [
      { id: "s1", time: "14:30", date: today, format: "IMAX", price: 24, hallName: "SCREEN 1" },
      { id: "s2", time: "18:00", date: today, format: "Standard", price: 18, hallName: "SCREEN 4" },
      { id: "s3", time: "21:15", date: today, format: "IMAX", price: 24, hallName: "SCREEN 1" },
      { id: "s4", time: "15:00", date: tomorrow, format: "IMAX", price: 24, hallName: "SCREEN 1" }
    ],
    isNowShowing: true,
    isComingSoon: false,
    streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    isStreamable: true,
    isPremium: true
  },
  {
    id: "missionx",
    title: "MISSION: IMPOSSIBLE",
    tagline: "The Final Reckoning.",
    synopsis: "Ethan Hunt and his IMF team embark on their most dangerous mission yet: tracking down a terrifying new weapon that threatens all of humanity.",
    genre: ["ACTION", "THRILLER"],
    rating: "PG-13",
    duration: 156,
    year: 2025,
    director: "Christopher McQuarrie",
    cast: [
      { name: "Tom Cruise", role: "Ethan Hunt" },
      { name: "Hayley Atwell", role: "Grace" },
      { name: "Ving Rhames", role: "Luther Stickell" }
    ],
    posterUrl: "/posters/missionx.png",
    backdropUrl: "https://picsum.photos/seed/missionxb/1200/600",
    trailerYoutubeId: "NOhDyUmT9z0",
    score: 88,
    showtimes: [
      { id: "s5", time: "16:00", date: today, format: "4DX", price: 26, hallName: "SCREEN 2" },
      { id: "s6", time: "20:30", date: today, format: "Standard", price: 18, hallName: "SCREEN 5" },
      { id: "s7", time: "19:00", date: tomorrow, format: "4DX", price: 26, hallName: "SCREEN 2" }
    ],
    isNowShowing: true,
    isComingSoon: false,
    streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    isStreamable: true,
    isPremium: false
  },
  {
    id: "andromeda",
    title: "ANDROMEDA PROTOCOL",
    tagline: "Some doors shouldn't be opened.",
    synopsis: "When a deep space exploration vessel intercepts a mysterious signal from an uncharted galaxy, the crew discovers they are not the first to arrive.",
    genre: ["SCI-FI", "MYSTERY"],
    rating: "R",
    duration: 132,
    year: 2025,
    director: "Alex Garland",
    cast: [
      { name: "Oscar Isaac", role: "Cmdr. Vance" },
      { name: "Rebecca Ferguson", role: "Dr. Elena Rostova" }
    ],
    posterUrl: "/posters/andromeda.png",
    backdropUrl: "https://picsum.photos/seed/andromedab/1200/600",
    trailerYoutubeId: "dQw4w9WgXcQ",
    score: 82,
    showtimes: [
      { id: "s8", time: "17:15", date: today, format: "Standard", price: 16, hallName: "SCREEN 3" },
      { id: "s9", time: "22:00", date: today, format: "Standard", price: 16, hallName: "SCREEN 3" }
    ],
    isNowShowing: true,
    isComingSoon: false,
    streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    isStreamable: true,
    isPremium: true
  },
  {
    id: "phantom",
    title: "THE PHANTOM HOUR",
    tagline: "Don't look behind you.",
    synopsis: "A psychological thriller about a renowned architect who begins to notice subtle, terrifying changes in the buildings he designed.",
    genre: ["THRILLER", "HORROR"],
    rating: "R",
    duration: 118,
    year: 2025,
    director: "David Fincher",
    cast: [
      { name: "Jake Gyllenhaal", role: "Arthur Penhaligon" },
      { name: "Anya Taylor-Joy", role: "Sarah" }
    ],
    posterUrl: "/posters/phantom.png",
    backdropUrl: "https://picsum.photos/seed/phantomb/1200/600",
    trailerYoutubeId: "dQw4w9WgXcQ",
    score: 89,
    showtimes: [
      { id: "s10", time: "21:45", date: today, format: "Standard", price: 16, hallName: "SCREEN 6" },
      { id: "s11", time: "23:30", date: today, format: "Standard", price: 16, hallName: "SCREEN 6" }
    ],
    isNowShowing: true,
    isComingSoon: false,
    streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    isStreamable: true,
    isPremium: true
  },
  {
    id: "solstice",
    title: "SOLSTICE",
    tagline: "A lifetime in a single day.",
    synopsis: "Two strangers cross paths during the longest day of the year in a remote Scandinavian village, changing their lives forever.",
    genre: ["DRAMA", "ROMANCE"],
    rating: "PG-13",
    duration: 104,
    year: 2025,
    director: "Celine Song",
    cast: [
      { name: "Saoirse Ronan", role: "Mia" },
      { name: "Paul Mescal", role: "Lukas" }
    ],
    posterUrl: "/posters/solstice.png",
    backdropUrl: "https://picsum.photos/seed/solsticeb/1200/600",
    trailerYoutubeId: "dQw4w9WgXcQ",
    score: 91,
    showtimes: [
      { id: "s12", time: "13:00", date: tomorrow, format: "Standard", price: 14, hallName: "SCREEN 7" },
      { id: "s13", time: "15:45", date: tomorrow, format: "Standard", price: 14, hallName: "SCREEN 7" }
    ],
    isNowShowing: false,
    isComingSoon: true,
    isStreamable: false,
    isPremium: false
  },
  {
    id: "ironclad",
    title: "IRONCLAD",
    tagline: "Steel and blood.",
    synopsis: "A gritty, historically accurate retelling of the siege of Rochester Castle in 1215.",
    genre: ["ACTION", "HISTORY"],
    rating: "R",
    duration: 142,
    year: 2025,
    director: "Ridley Scott",
    cast: [
      { name: "Michael Fassbender", role: "Baron Albany" },
      { name: "Jodie Comer", role: "Isabel" }
    ],
    posterUrl: "/posters/ironclad.png",
    backdropUrl: "https://picsum.photos/seed/ironcladb/1200/600",
    trailerYoutubeId: "dQw4w9WgXcQ",
    score: 78,
    showtimes: [
      { id: "s14", time: "19:30", date: tomorrow, format: "IMAX", price: 24, hallName: "SCREEN 1" },
      { id: "s15", time: "22:15", date: tomorrow, format: "Standard", price: 18, hallName: "SCREEN 4" }
    ],
    isNowShowing: false,
    isComingSoon: true,
    isStreamable: false,
    isPremium: false
  }
];
