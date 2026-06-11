import { movies as seedMovies, Movie } from "../data/movies";

export interface Theater {
  id: string;
  name: string;
  username: string;
  password: string;
  permissions: string[];
  moviesAssigned: string[];
  createdAt: string;
}

export interface Booking {
  ref: string;
  movie: string;
  movieId: string;
  showtime: string;
  format: string;
  hall: string;
  seats: string[];
  total: number;
  theaterId: string;
  timestamp: string;
  status: "CONFIRMED" | "USED" | "CANCELLED";
}

export interface CustomMovie {
  id: string;
  title: string;
  genre: string[];
  synopsis: string;
  rating: string;
  year: number;
  duration: number;
  score: number;
  director: string;
  posterUrl: string;
  backdropUrl: string;
  isNowShowing: boolean;
  isComingSoon: boolean;
  isCustom: true;
  streamUrl?: string;
  isStreamable?: boolean;
  isPremium?: boolean;
  theaterId?: string;
}

export interface MovieRequest {
  id: string;
  theaterId: string;
  theaterName: string;
  title: string;
  genre: string[];
  synopsis: string;
  rating: string;
  year: number;
  duration: number;
  score: number;
  director: string;
  posterUrl: string;
  backdropUrl: string;
  isNowShowing: boolean;
  isComingSoon: boolean;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt?: string;
  streamUrl?: string;
  isStreamable?: boolean;
  isPremium?: boolean;
}

export interface AdminSession {
  type: "admin" | "theater";
  theaterId?: string;
  theaterName?: string;
  permissions?: string[];
}

const THEATERS_KEY = "mk_theaters";
const BOOKINGS_KEY = "mk_bookings";
const SESSION_KEY = "mk_admin_session";
const CUSTOM_MOVIES_KEY = "mk_custom_movies";
const MOVIE_REQUESTS_KEY = "mk_movie_requests";

export const getTheaters = (): Theater[] => {
  try { return JSON.parse(localStorage.getItem(THEATERS_KEY) || "[]"); }
  catch { return []; }
};

export const saveTheater = (theater: Theater) => {
  const theaters = getTheaters();
  const idx = theaters.findIndex(t => t.id === theater.id);
  if (idx >= 0) theaters[idx] = theater; else theaters.push(theater);
  localStorage.setItem(THEATERS_KEY, JSON.stringify(theaters));
};

export const deleteTheater = (id: string) => {
  localStorage.setItem(THEATERS_KEY, JSON.stringify(getTheaters().filter(t => t.id !== id)));
};

export const getBookings = (): Booking[] => {
  try { return JSON.parse(localStorage.getItem(BOOKINGS_KEY) || "[]"); }
  catch { return []; }
};

export const saveBooking = (booking: Booking) => {
  const bookings = getBookings();
  bookings.unshift(booking);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
};

export const markTicketUsed = (ref: string): Booking | null => {
  const bookings = getBookings();
  const idx = bookings.findIndex(b => b.ref === ref);
  if (idx < 0) return null;
  bookings[idx] = { ...bookings[idx], status: "USED" };
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  return bookings[idx];
};

export const getCustomMovies = (): CustomMovie[] => {
  try { return JSON.parse(localStorage.getItem(CUSTOM_MOVIES_KEY) || "[]"); }
  catch { return []; }
};

export const saveCustomMovie = (movie: CustomMovie) => {
  const movies = getCustomMovies();
  const idx = movies.findIndex(m => m.id === movie.id);
  if (idx >= 0) movies[idx] = movie; else movies.push(movie);
  localStorage.setItem(CUSTOM_MOVIES_KEY, JSON.stringify(movies));
};

export const deleteCustomMovie = (id: string) => {
  localStorage.setItem(CUSTOM_MOVIES_KEY, JSON.stringify(getCustomMovies().filter(m => m.id !== id)));
};

export const getMovieRequests = (): MovieRequest[] => {
  try { return JSON.parse(localStorage.getItem(MOVIE_REQUESTS_KEY) || "[]"); }
  catch { return []; }
};

export const submitMovieRequest = (req: Omit<MovieRequest, "id" | "status" | "submittedAt">): MovieRequest => {
  const requests = getMovieRequests();
  const newReq: MovieRequest = { ...req, id: `mr_${Date.now()}`, status: "pending", submittedAt: new Date().toISOString() };
  requests.unshift(newReq);
  localStorage.setItem(MOVIE_REQUESTS_KEY, JSON.stringify(requests));
  return newReq;
};

export const approveMovieRequest = (id: string): void => {
  const requests = getMovieRequests();
  const idx = requests.findIndex(r => r.id === id);
  if (idx < 0) return;
  requests[idx] = { ...requests[idx], status: "approved", reviewedAt: new Date().toISOString() };
  localStorage.setItem(MOVIE_REQUESTS_KEY, JSON.stringify(requests));
  const r = requests[idx];
  saveCustomMovie({
    id: `cm_${r.id}`, title: r.title, genre: r.genre, synopsis: r.synopsis,
    rating: r.rating, year: r.year, duration: r.duration, score: r.score,
    director: r.director, posterUrl: r.posterUrl, backdropUrl: r.backdropUrl,
    isNowShowing: r.isNowShowing, isComingSoon: r.isComingSoon, isCustom: true,
    streamUrl: r.streamUrl, isStreamable: r.isStreamable, isPremium: r.isPremium,
    theaterId: r.theaterId,
  });
};

export const rejectMovieRequest = (id: string): void => {
  const requests = getMovieRequests();
  const idx = requests.findIndex(r => r.id === id);
  if (idx < 0) return;
  requests[idx] = { ...requests[idx], status: "rejected", reviewedAt: new Date().toISOString() };
  localStorage.setItem(MOVIE_REQUESTS_KEY, JSON.stringify(requests));
};

export const getPendingRequestCount = (): number =>
  getMovieRequests().filter(r => r.status === "pending").length;

export const getSession = (): AdminSession | null => {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); }
  catch { return null; }
};

export const setSession = (session: AdminSession) => {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  sessionStorage.setItem("mk_admin_auth", "1");
};

export const clearSession = () => {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem("mk_admin_auth");
};

export const authenticate = (username: string, password: string): AdminSession | null => {
  if (username === "admin" && password === "786786") return { type: "admin" };
  const theater = getTheaters().find(t => t.username === username && t.password === password);
  if (theater) return { type: "theater", theaterId: theater.id, theaterName: theater.name, permissions: theater.permissions };
  return null;
};

export const getTheaterRevenue = (theaterId: string): number => {
  return getBookings()
    .filter(b => b.theaterId === theaterId && b.status !== "CANCELLED")
    .reduce((sum, b) => sum + b.total, 0);
};

export const getTotalRevenue = (): number => {
  return getBookings()
    .filter(b => b.status !== "CANCELLED")
    .reduce((sum, b) => sum + b.total, 0);
};

export const getAllMovies = (): Movie[] => {
  const custom = getCustomMovies();
  const mappedCustom: Movie[] = custom.map(m => ({
    id: m.id,
    title: m.title,
    tagline: m.synopsis.slice(0, 50) + "...",
    synopsis: m.synopsis,
    genre: m.genre,
    rating: m.rating,
    duration: m.duration,
    year: m.year,
    director: m.director,
    cast: [],
    posterUrl: m.posterUrl || "https://images.unsplash.com/photo-1440404653325-ab127d49abc1",
    backdropUrl: m.backdropUrl || "https://images.unsplash.com/photo-1440404653325-ab127d49abc1",
    trailerYoutubeId: "",
    score: m.score,
    showtimes: [
      { id: `st_${m.id}_1`, time: "12:00 PM", date: new Date().toISOString().split('T')[0], format: "Standard", price: 250, hallName: "Audi 1" },
      { id: `st_${m.id}_2`, time: "4:00 PM", date: new Date().toISOString().split('T')[0], format: "Standard", price: 250, hallName: "Audi 1" },
      { id: `st_${m.id}_3`, time: "8:00 PM", date: new Date().toISOString().split('T')[0], format: "Standard", price: 250, hallName: "Audi 1" },
    ],
    isNowShowing: m.isNowShowing,
    isComingSoon: m.isComingSoon,
    streamUrl: m.streamUrl,
    isStreamable: m.isStreamable,
    isPremium: m.isPremium,
    theaterId: m.theaterId,
  }));
  return [...seedMovies, ...mappedCustom];
};
