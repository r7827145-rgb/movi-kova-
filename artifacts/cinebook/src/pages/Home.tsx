import { movies } from "../data/movies";
import Navbar from "../components/Navbar";
import MovieCard from "../components/MovieCard";
import AILauncher from "../components/AILauncher";
import Footer from "../components/Footer";
import FramePlayer from "../components/FramePlayer";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { clsx } from "clsx";

export default function Home() {
  const featured = movies[0];
  const nowShowing = movies.filter(m => m.isNowShowing);
  const comingSoon = movies.filter(m => m.isComingSoon);
  const trending = movies.slice(0, 4);
  const topRated = [...movies].sort((a, b) => b.score - a.score);
  
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const categories = ["ALL", "ACTION", "SCI-FI", "DRAMA", "THRILLER", "ROMANCE"];

  const filteredMovies = activeCategory === "ALL"
    ? nowShowing
    : nowShowing.filter(m => m.genre.some(g => g.toUpperCase().includes(activeCategory)));

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#0f0f0f]">
      <Navbar />

      <main className="flex-1 pb-16 pt-16">
        {/* Featured Banner */}
        <div className="relative w-full h-[260px] md:h-[400px] overflow-hidden bg-[#0f0f0f]">
          <motion.img
            src={featured.backdropUrl}
            className="w-full h-full object-cover object-top"
            alt={featured.title}
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.72 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, #0f0f0f 38%, transparent 100%), linear-gradient(to top, #0f0f0f 0%, transparent 65%)" }} />

          {/* Animated content */}
          <motion.div
            className="absolute bottom-0 left-0 p-6 md:p-10 z-10"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.13, delayChildren: 0.35 } } }}
          >
            {/* Badges */}
            <motion.div
              className="flex items-center gap-2 mb-3 flex-wrap"
              variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}
            >
              <span className="bms-rating">★ {(featured.score/10).toFixed(1)}</span>
              <span className="bms-chip">{featured.rating}</span>
              {featured.genre.map(g => <span key={g} className="bms-chip">{g}</span>)}
            </motion.div>

            {/* Title — each word animates in */}
            <div className="flex flex-wrap gap-x-3 mb-5">
              {featured.title.split(" ").map((word, i) => (
                <motion.span
                  key={i}
                  className="text-white font-display font-bold text-3xl md:text-5xl tracking-tight leading-tight"
                  variants={{ hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { duration: 0.42, delay: i * 0.07 } } }}
                >
                  {word}
                </motion.span>
              ))}
            </div>

            {/* CTA button */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
            >
              <Link
                href={`/movies/${featured.id}`}
                className="btn-hs-primary px-7 py-2.5 text-sm"
                data-testid="link-hero-book"
              >
                Book Now
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Category filter tabs */}
        <div className="sticky top-16 z-40 bg-[#0f0f0f]/95 backdrop-blur border-b border-white/8 mb-8">
          <div className="max-w-7xl mx-auto px-4 flex gap-6 overflow-x-auto carousel-scroll py-3">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={clsx("text-sm whitespace-nowrap pb-1", activeCategory === cat ? "bms-tab-active" : "bms-tab")}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto space-y-12 relative z-10 px-4">
          
          {/* Now Showing */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title-hs m-0">NOW SHOWING</h2>
              <button className="text-[#f84464] text-sm font-semibold hover:text-white transition-colors">See All →</button>
            </div>
            <div className="carousel-scroll flex gap-4 pb-4">
              {filteredMovies.map(movie => (
                <div key={movie.id} className="w-[140px] md:w-[160px] flex-shrink-0 scroll-snap-align-start">
                  <MovieCard movie={movie} showPrice={true} />
                </div>
              ))}
              {filteredMovies.length === 0 && (
                <AnimatePresence>
                  <motion.div
                    key="no-results"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="w-full flex flex-col items-center py-6"
                  >
                    <FramePlayer
                      width={400}
                      height={225}
                      label={`No "${activeCategory}" movies showing right now`}
                    />
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </section>

          {/* Trending This Week */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title-hs m-0">TRENDING THIS WEEK</h2>
            </div>
            <div className="carousel-scroll flex gap-4 pb-4">
              {trending.map(movie => (
                <div key={movie.id} className="w-[240px] md:w-[280px] flex-shrink-0 scroll-snap-align-start">
                  <MovieCard movie={movie} variant="landscape" />
                </div>
              ))}
            </div>
          </section>

          {/* Top Rated */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title-hs m-0">TOP RATED</h2>
              <button className="text-[#f84464] text-sm font-semibold hover:text-white transition-colors">See All →</button>
            </div>
            <div className="carousel-scroll flex gap-4 pb-4">
              {topRated.map(movie => (
                <div key={movie.id} className="w-[140px] md:w-[160px] flex-shrink-0 scroll-snap-align-start">
                  <MovieCard movie={movie} showPrice={true} />
                </div>
              ))}
            </div>
          </section>

          {/* Coming Soon */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title-hs m-0">COMING SOON</h2>
              <button className="text-[#f84464] text-sm font-semibold hover:text-white transition-colors">See All →</button>
            </div>
            <div className="carousel-scroll flex gap-4 pb-4">
              {comingSoon.map(movie => (
                <div key={movie.id} className="w-[140px] md:w-[160px] flex-shrink-0 scroll-snap-align-start">
                  <MovieCard movie={movie} showPrice={false} />
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>

      <AILauncher />
      <Footer />
    </div>
  );
}
