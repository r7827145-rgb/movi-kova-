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
