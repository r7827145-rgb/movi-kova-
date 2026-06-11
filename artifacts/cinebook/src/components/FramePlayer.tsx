import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home } from "lucide-react";
import { Link } from "wouter";

// 100 frames → 10 second playthrough (sped up to 1.3x speed)
const TOTAL_FRAMES = 100;
const SPEED = 1.3;
const LOOP_DURATION_MS = 10000 / SPEED;                   // ~7692 ms total
const FRAME_DURATION_MS = LOOP_DURATION_MS / TOTAL_FRAMES; // ~76.9 ms per frame

// Pre-build all image URLs
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const FRAME_URLS = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
  const n = String(i + 1).padStart(3, "0");
  return `${BASE}/mp-frames/mp___online-video-cutter_com__${n}.jpg`;
});

interface FramePlayerProps {
  width?: number;
  height?: number;
  label?: string;
  className?: string;
  /** If false, plays once and stops on the last frame. Default: true */
  loop?: boolean;
  /** Show a "Go to Home" button when the animation finishes (only when loop=false) */
  showHomeOnEnd?: boolean;
}

export default function FramePlayer({
  width = 480,
  height = 270,
  label = "",
  className = "",
  loop = true,
  showHomeOnEnd = false,
}: FramePlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const [loadedCount, setLoadedCount] = useState(0);
  const [ready, setReady] = useState(false);
  const [finished, setFinished] = useState(false);

  // ── Preload all frames ──────────────────────────────────────────
  useEffect(() => {
    let loaded = 0;
    const images: HTMLImageElement[] = [];

    FRAME_URLS.forEach((url, i) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        loaded++;
        setLoadedCount(loaded);
        if (loaded === TOTAL_FRAMES) setReady(true);
      };
      img.onerror = () => {
        loaded++;
        setLoadedCount(loaded);
        if (loaded === TOTAL_FRAMES) setReady(true);
      };
      images[i] = img;
    });

    imagesRef.current = images;
    return () => { images.forEach(img => { img.onload = null; img.onerror = null; }); };
  }, []);

  // ── Animation loop ──────────────────────────────────────────────
  useEffect(() => {
    if (!ready) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    function draw(timestamp: number) {
      if (startTimeRef.current === null) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;

      if (!loop && elapsed >= LOOP_DURATION_MS) {
        // ── Stopped: freeze on the very last frame ──
        const lastImg = imagesRef.current[TOTAL_FRAMES - 1];
        if (lastImg?.complete && lastImg.naturalWidth > 0) {
          ctx!.drawImage(lastImg, 0, 0, width, height);
        }
        setFinished(true);
        return; // stop scheduling more frames
      }

      const elapsed2 = loop ? elapsed % LOOP_DURATION_MS : Math.min(elapsed, LOOP_DURATION_MS - 1);
      const frameIndex = Math.floor(elapsed2 / FRAME_DURATION_MS);
      const clampedIndex = Math.max(0, Math.min(TOTAL_FRAMES - 1, frameIndex));

      const img = imagesRef.current[clampedIndex];
      if (img?.complete && img.naturalWidth > 0) {
        ctx!.drawImage(img, 0, 0, width, height);
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      startTimeRef.current = null;
    };
  }, [ready, width, height, loop]);

  const loadPercent = Math.round((loadedCount / TOTAL_FRAMES) * 100);

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      <div
        className="relative overflow-hidden"
        style={{ width, maxWidth: "100%", aspectRatio: `${width}/${height}`, background: "#000" }}
      >
        {/* Loading placeholder */}
        {!ready && (
          <div className="absolute inset-0 bg-black" />
        )}

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          style={{
            width, height, maxWidth: "100%", display: "block",
            opacity: ready ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        />

        {/* Home button overlay — fades in after last frame */}
        <AnimatePresence>
          {finished && showHomeOnEnd && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute inset-0 flex items-end justify-center pb-14"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 55%)" }}
            >
              <motion.div
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.5, ease: "easeOut" }}
              >
                <Link href="/">
                  <button
                    className="flex items-center gap-2.5 px-7 py-3.5 rounded-full text-white font-bold text-base tracking-wide shadow-2xl hover:scale-105 active:scale-95 transition-transform"
                    style={{ background: "linear-gradient(135deg, #c62828, #f84464)" }}
                  >
                    <Home className="w-5 h-5" />
                    Go to Home
                  </button>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {label && (
        <p className="text-gray-500 text-sm font-medium tracking-wide text-center mt-4">{label}</p>
      )}
    </div>
  );
}
