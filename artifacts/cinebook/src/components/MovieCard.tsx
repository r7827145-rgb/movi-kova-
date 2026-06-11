import { Link } from "wouter";
import { motion } from "framer-motion";
import { Movie } from "../data/movies";
import { clsx } from "clsx";

interface MovieCardProps {
  movie: Movie;
  showPrice?: boolean;
  variant?: "portrait" | "landscape";
}

export default function MovieCard({ movie, showPrice = true, variant = "portrait" }: MovieCardProps) {
  const isLandscape = variant === "landscape";

  return (
    <Link href={`/movies/${movie.id}`} data-testid={`link-movie-${movie.id}`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        className="group cursor-pointer movie-card-hs rounded-lg overflow-hidden bg-[#1a1a2e] border border-white/8 hover:border-white/20 transition-all flex flex-col"
      >
        {/* Poster image */}
        <div className={clsx("relative overflow-hidden", isLandscape ? "aspect-video" : "aspect-[2/3]")}>
          <img 
            src={isLandscape ? movie.backdropUrl : movie.posterUrl} 
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {movie.isStreamable && (
            <span className={clsx(
              "absolute top-2 left-2 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wider shadow-md z-10",
              movie.isPremium 
                ? "bg-amber-500 text-black font-extrabold" 
                : "bg-purple-600 text-white"
            )}>
              {movie.isPremium ? "VIP Stream" : "Stream Free"}
            </span>
          )}
          {/* Red overlay on hover with BOOK NOW */}
          <div className="absolute inset-0 bg-[#f84464]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <span className="text-white font-bold text-sm tracking-widest uppercase drop-shadow-md">
              {movie.isStreamable && !movie.isNowShowing ? "Watch Now" : "Book Tickets"}
            </span>
          </div>
        </div>
        
        {/* Info below image */}
        <div className="p-2.5 flex-1 flex flex-col justify-between">
          <h3 className="font-semibold text-white text-[13px] leading-tight truncate mb-1.5" title={movie.title}>
            {movie.title}
          </h3>
          <div className="flex items-center gap-2 flex-wrap mt-auto">
            <span className="bms-rating">★ {(movie.score / 10).toFixed(1)}</span>
            {!isLandscape && <span className="bms-chip">{movie.genre[0]}</span>}
            {showPrice && movie.showtimes.length > 0 && (
              <span className="text-[10px] text-gray-500 ml-auto">
                from ₹{Math.min(...movie.showtimes.map(s => s.price))}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
