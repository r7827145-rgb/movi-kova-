import { useParams, useLocation } from "wouter";
import { Showtime } from "../data/movies";
import { getAllMovies } from "../lib/adminData";
import { useBookingStore } from "../store/booking";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ShowtimePill from "../components/ShowtimePill";
import StickyCTA from "../components/StickyCTA";
import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { clsx } from "clsx";

export default function MovieDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const movie = getAllMovies().find(m => m.id === id);
  const setMovie = useBookingStore(state => state.setMovie);
  const selectedShowtime = useBookingStore(state => state.selectedShowtime);
  const setShowtime = useBookingStore(state => state.setShowtime);
  
  const [activeDate, setActiveDate] = useState<string>("");

  useEffect(() => {
    if (movie) {
      setMovie(movie);
      setShowtime(null);
      if (movie.showtimes.length > 0) {
        setActiveDate(movie.showtimes[0].date);
      } else {
        setActiveDate("");
      }
    }
  }, [movie, setMovie, setShowtime]);

  if (!movie) return <div className="p-8 text-center text-white">Movie not found</div>;

  const dates = Array.from(new Set(movie.showtimes.map(s => s.date))).sort();
  const activeShowtimes = movie.showtimes.filter(s => s.date === activeDate);

  const handleShowtimeSelect = (s: Showtime) => {
    setShowtime(s);
  };

  const handleProceed = () => {
    if (selectedShowtime) {
      setLocation(`/movies/${movie.id}/seats?showtime=${selectedShowtime.id}`);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#0f0f0f]">
      <Navbar />

      <main className="flex-1 pb-32">
        {/* Movie info header — no full-height hero */}
        <div className="pt-20 pb-8 bg-gradient-to-b from-[#0f0f0f] to-[#0f0f0f] relative overflow-hidden">
          {/* Subtle blurred backdrop behind header */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: `url(${movie.backdropUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(30px)' }} />
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row gap-8 mt-6">
              {/* Poster */}
              <div className="w-full md:w-56 flex-shrink-0">
                <img src={movie.posterUrl} alt={movie.title} className="w-48 md:w-56 aspect-[2/3] object-cover rounded-lg shadow-2xl mx-auto md:mx-0 border border-white/10" />
              </div>
              
              {/* Info */}
              <div className="flex-1">
                <h1 className="text-white font-display font-bold text-3xl md:text-5xl tracking-tight mb-3 drop-shadow-md">{movie.title}</h1>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="bms-rating">★ {(movie.score/10).toFixed(1)}/10</span>
                  <span className="bms-chip">{movie.rating}</span>
                  <span className="bms-chip">{movie.duration}m</span>
                  <span className="bms-chip">{movie.year}</span>
                  {movie.genre.map(g => <span key={g} className="bms-chip">{g}</span>)}
                </div>
                
                {/* Language chips */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Language:</span>
                  {["English", "Hindi"].map(lang => (
                    <button key={lang} className="px-3 py-1 text-xs border border-white/20 rounded bg-white/5 text-gray-300 hover:border-[#f84464] hover:text-[#f84464] transition-colors">{lang}</button>
                  ))}
                </div>

                {/* Format chips */}
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Format:</span>
                  {["2D", "IMAX", "4DX"].map(fmt => (
                    <button key={fmt} className="px-3 py-1 text-xs border border-white/20 rounded bg-white/5 text-gray-300 hover:border-[#f84464] hover:text-[#f84464] transition-colors">{fmt}</button>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {movie.isNowShowing ? (
                    <button className="btn-hs-primary px-8 py-3 w-full sm:w-auto justify-center" onClick={() => document.getElementById('showtimes-section')?.scrollIntoView({ behavior: 'smooth' })}>
                      Book tickets
                    </button>
                  ) : (
                    <button className="px-8 py-3 rounded border border-white/20 text-gray-300 font-semibold w-full sm:w-auto" disabled>Coming Soon</button>
                  )}

                  {movie.isStreamable && (
                    <button 
                      className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
                      onClick={() => setLocation(`/watch/${movie.id}`)}
                    >
                      <span>Watch Now</span>
                      {movie.isPremium && (
                        <span className="text-[10px] bg-amber-500 text-black px-1.5 py-0.5 rounded font-extrabold tracking-wide uppercase">VIP</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10 py-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-10">
              {/* Overview */}
              <section>
                <h3 className="text-white font-bold text-lg mb-3">Overview</h3>
                <p className="text-gray-300 leading-relaxed max-w-3xl">
                  {movie.synopsis}
                </p>
                <div className="mt-4 text-sm text-gray-400">
                  <span className="font-semibold text-gray-300">Director:</span> {movie.director}
                </div>
              </section>

              {/* Cast */}
              <section>
                <h3 className="text-white font-bold text-lg mb-4">Cast</h3>
                <div className="carousel-scroll flex gap-6 pb-4">
                  {movie.cast.map(person => (
                    <div key={person.name} className="flex flex-col gap-3 min-w-[90px] scroll-snap-align-start items-center text-center">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-[#1a1a2e] border border-white/10">
                        <img src={`https://picsum.photos/seed/${person.name.replace(/\s/g, '')}/100/100`} alt={person.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-200">{person.name}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">{person.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Score & Details */}
            <div className="space-y-6">
              <div className="bg-[#1a1a2e] p-6 rounded-lg border border-white/8 flex items-center gap-6">
                <div className="flex flex-col items-center justify-center">
                  <div className="text-4xl font-display font-bold text-[#f84464] flex items-center gap-1">
                    {(movie.score / 10).toFixed(1)}
                  </div>
                  <div className="flex items-center mt-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className={clsx("w-4 h-4", star <= movie.score / 20 ? "text-[#f84464] fill-current" : "text-gray-600")} />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-white font-bold mb-1">Audience Score</div>
                  <div className="text-xs text-gray-400">Based on thousands of ratings</div>
                </div>
              </div>
              
              <div className="bg-[#1a1a2e] p-6 rounded-lg border border-white/8">
                <h3 className="text-white font-bold mb-4">Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Audio</span>
                    <span className="text-white font-medium">English, Hindi</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subtitles</span>
                    <span className="text-white font-medium">English (CC)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Formats</span>
                    <span className="text-white font-medium">2D, IMAX, 4DX</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Showtimes */}
          {movie.isNowShowing && (
            <div id="showtimes-section" className="mt-16 pt-12 border-t border-white/10">
              <h2 className="section-title-hs">SELECT SHOWTIME</h2>

              <div className="flex gap-3 mb-8 carousel-scroll pb-2">
                {dates.map((date, idx) => {
                  const isSelected = activeDate === date;
                  return (
                    <button
                      key={date}
                      onClick={() => setActiveDate(date)}
                      className={clsx(
                        "px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors border",
                        isSelected 
                          ? "bg-[#f84464] text-white border-[#f84464]" 
                          : "bg-transparent text-gray-400 border-white/20 hover:border-[#f84464] hover:text-white"
                      )}
                    >
                      {idx === 0 ? 'TODAY' : idx === 1 ? 'TOMORROW' : date}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {activeShowtimes.map(s => (
                  <ShowtimePill
                    key={s.id}
                    showtime={s}
                    selected={selectedShowtime?.id === s.id}
                    onClick={() => handleShowtimeSelect(s)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <StickyCTA 
        show={selectedShowtime !== null && movie.showtimes.some(s => s.id === selectedShowtime.id)} 
        text="SELECT SEATS" 
        onClick={handleProceed} 
      />
      <Footer />
    </div>
  );
}
