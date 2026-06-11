import { useEffect, useState, useRef } from "react";
import { useLocation, Link } from "wouter";
import { ArrowLeft, Lock, Sparkles, AlertTriangle } from "lucide-react";
import Navbar from "@/components/Navbar";
import VideoPlayer from "@/components/VideoPlayer";
import { getAllMovies } from "@/lib/adminData";
import { isSubscribed, addWatchHistory } from "@/lib/subscriptionData";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function WatchMovie({ params }: { params: { id: string } }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  const lastSavedMinuteRef = useRef<number>(-1);
  const wasCompletedRef = useRef<boolean>(false);

  const handleProgress = (progress: { currentTime: number; duration: number; percent: number }) => {
    if (!movie) return;
    const durationMinutes = Math.floor(progress.currentTime / 60);
    const isCompleted = progress.percent > 90;

    if (durationMinutes > lastSavedMinuteRef.current || (isCompleted && !wasCompletedRef.current)) {
      lastSavedMinuteRef.current = durationMinutes;
      if (isCompleted) {
        wasCompletedRef.current = true;
      }

      addWatchHistory({
        movieId: movie.id,
        movieTitle: movie.title,
        duration: durationMinutes,
        completed: isCompleted,
      });
    }
  };

  useEffect(() => {
    const all = getAllMovies();
    const found = all.find((m) => m.id === params.id);
    
    if (!found) {
      setLoading(false);
      return;
    }

    setMovie(found);
    
    // Check access: if premium, user must have subscription
    const subbed = isSubscribed();
    const isPrem = found.isPremium;
    const isStream = found.isStreamable;

    if (!isStream) {
      setHasAccess(false);
    } else if (isPrem && !subbed) {
      setHasAccess(false);
    } else {
      setHasAccess(true);
      // Log watch history
      addWatchHistory({
        movieId: found.id,
        movieTitle: found.title,
        duration: 0,
        completed: false,
      });
    }
    
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070a] text-white flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#f84464] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#07070a] text-white flex flex-col items-center justify-center p-4">
        <AlertTriangle className="w-12 h-12 text-[#f84464] mb-3" />
        <h1 className="font-display font-bold text-xl mb-1">Movie Not Found</h1>
        <p className="text-gray-400 text-sm mb-6">The movie you are looking for does not exist or has been removed.</p>
        <Link href="/" className="btn-hs-primary text-xs py-2 px-4">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 flex flex-col justify-center items-center pt-20 px-4 md:px-8 max-w-7xl mx-auto w-full">
        {/* Back Link */}
        <div className="w-full mb-6 flex justify-start">
          <Link href={`/movies/${movie.id}`} className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Movie Details
          </Link>
        </div>

        {/* Video Player or Locked Screen */}
        <div className="w-full aspect-video max-w-4xl bg-black rounded-2xl overflow-hidden border border-white/5 shadow-2xl relative">
          {hasAccess ? (
            <VideoPlayer 
              src={(!movie.streamUrl || movie.streamUrl.includes("googleapis.com")) ? "https://vjs.zencdn.net/v/oceans.mp4" : movie.streamUrl} 
              title={movie.title}
              onProgress={handleProgress}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center" 
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.9)), url(${movie.backdropUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            >
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                <Lock className="w-7 h-7 text-[#f84464]" />
              </div>
              
              {!movie.isStreamable ? (
                <>
                  <h2 className="font-display font-bold text-2xl text-white mb-2">Not Available for Streaming</h2>
                  <p className="text-gray-400 text-sm max-w-md mb-6">
                    "{movie.title}" is currently only available for theater booking. Check out the showtimes in movie details.
                  </p>
                  <Link href={`/movies/${movie.id}`} className="btn-hs-primary text-sm py-2.5 px-6">
                    Book Tickets Now
                  </Link>
                </>
              ) : (
                <>
                  <motion.div 
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center gap-1 bg-[#f84464]/20 border border-[#f84464]/30 px-3 py-1 rounded-full text-xs font-bold text-[#f84464] mb-3"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-[#f84464]" /> Premium Subscription Required
                  </motion.div>
                  <h2 className="font-display font-bold text-2xl text-white mb-2">Subscribe to watch "{movie.title}"</h2>
                  <p className="text-gray-400 text-sm max-w-md mb-6">
                    This movie is part of our Premium streaming selection. Unlock it and hundreds of others instantly.
                  </p>
                  <div className="flex gap-4">
                    <Link href="/subscribe" className="btn-hs-primary text-sm py-2.5 px-6">
                      View Plans
                    </Link>
                    <Link href={`/movies/${movie.id}`} className="px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-sm font-semibold transition-all">
                      Details
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Movie Info */}
        <div className="w-full max-w-4xl mt-8 mb-16">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <h1 className="font-display font-bold text-2xl text-white mb-2">{movie.title}</h1>
              <p className="text-gray-400 text-sm max-w-2xl">{movie.synopsis}</p>
            </div>
            <div className="flex flex-wrap gap-2 flex-shrink-0">
              {movie.genre.map((g: string) => (
                <span key={g} className="text-xs bg-white/5 border border-white/5 px-2.5 py-1 rounded-md text-gray-300">
                  {g}
                </span>
              ))}
              <span className="text-xs bg-[#f84464]/10 border border-[#f84464]/20 px-2.5 py-1 rounded-md text-[#f84464] font-bold">
                {movie.rating}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
