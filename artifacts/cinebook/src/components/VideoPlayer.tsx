import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  SkipBack, SkipForward, Settings, PictureInPicture2, AlertCircle,
} from "lucide-react";

interface VideoPlayerProps {
  src: string;
  title: string;
  posterUrl?: string;
  onBack?: () => void;
}

export default function VideoPlayer({ src, title, posterUrl, onBack }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showVolume, setShowVolume] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v || error) return;
    if (v.paused) { 
      v.play().then(() => setPlaying(true)).catch(() => {
        setError("Autoplay blocked or playback failed. Click play to try again.");
        setPlaying(false);
      }); 
    }
    else { v.pause(); setPlaying(false); }
  }, [error]);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }, []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const val = parseFloat(e.target.value);
    v.volume = val;
    setVolume(val);
    if (val === 0) { v.muted = true; setMuted(true); }
    else { v.muted = false; setMuted(false); }
  }, []);

  const skip = useCallback((seconds: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + seconds));
  }, []);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    const bar = progressRef.current;
    if (!v || !bar) return;
    const rect = bar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    v.currentTime = pct * v.duration;
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const c = containerRef.current;
    if (!c) return;
    if (!document.fullscreenElement) {
      await c.requestFullscreen();
      setFullscreen(true);
    } else {
      await document.exitFullscreen();
      setFullscreen(false);
    }
  }, []);

  const togglePiP = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else {
      await v.requestPictureInPicture();
    }
  }, []);

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    if (playing) {
      hideTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [playing]);

  // Reset and load player whenever src changes
  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      v.load();
      setPlaying(false);
      setLoading(true);
      setError(null);
    }
  }, [src]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => {
      setCurrentTime(v.currentTime);
      if (v.buffered.length > 0) {
        setBuffered(v.buffered.end(v.buffered.length - 1));
      }
    };
    const onMeta = () => { setDuration(v.duration); setLoading(false); setError(null); };
    const onWaiting = () => setLoading(true);
    const onPlaying = () => { setLoading(false); setError(null); };
    const onEnded = () => setPlaying(false);
    const onError = () => {
      setLoading(false);
      setError("Failed to load video. The resource may be unavailable or blocked by CORS.");
    };
    const onStalled = () => {
      // Don't show critical error on stalled, just let it load or buffer
      console.warn("Video playback stalled...");
    };

    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("waiting", onWaiting);
    v.addEventListener("playing", onPlaying);
    v.addEventListener("ended", onEnded);
    v.addEventListener("error", onError);
    v.addEventListener("stalled", onStalled);

    // If metadata is already loaded by the time we register the listener
    if (v.readyState >= 1) {
      onMeta();
    }
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("waiting", onWaiting);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("ended", onEnded);
      v.removeEventListener("error", onError);
      v.removeEventListener("stalled", onStalled);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case " ": case "k": e.preventDefault(); togglePlay(); break;
        case "m": toggleMute(); break;
        case "f": toggleFullscreen(); break;
        case "ArrowLeft": skip(-10); break;
        case "ArrowRight": skip(10); break;
        case "Escape": if (onBack) onBack(); break;
      }
      resetHideTimer();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [togglePlay, toggleMute, toggleFullscreen, skip, onBack, resetHideTimer]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferProgress = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black aspect-video group cursor-pointer select-none overflow-hidden rounded-xl"
      onMouseMove={resetHideTimer}
      onMouseLeave={() => playing && setShowControls(false)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("[data-control]")) return;
        togglePlay();
      }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={posterUrl}
        className="w-full h-full object-contain"
        preload="metadata"
        playsInline
      />

      {/* Loading Spinner */}
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="w-12 h-12 border-3 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Error Panel */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-6 text-center z-20">
          <AlertCircle className="w-12 h-12 text-[#e50914] mb-3 animate-pulse" />
          <p className="text-white text-sm font-semibold mb-4">{error}</p>
          <button
            onClick={() => {
              if (videoRef.current) {
                setError(null);
                setLoading(true);
                videoRef.current.load();
              }
            }}
            className="px-5 py-2.5 bg-[#e50914] hover:bg-[#e50914]/90 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-600/20"
          >
            Retry Playback
          </button>
        </div>
      )}

      {/* Big Play Button (when paused) */}
      {!playing && !loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-20 h-20 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-white/25 transition-all hover:scale-110">
            <Play className="w-8 h-8 text-white ml-1" fill="white" />
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute inset-0 flex flex-col justify-end z-30 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "linear-gradient(transparent 50%, rgba(0,0,0,0.85) 100%)" }}
        data-control
      >
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between" style={{ background: "linear-gradient(rgba(0,0,0,0.7) 0%, transparent 100%)" }}>
          {onBack && (
            <button onClick={onBack} data-control className="text-white/80 hover:text-white transition-colors text-sm font-medium flex items-center gap-2">
              ← Back
            </button>
          )}
          <h3 className="text-white font-display font-bold text-lg truncate flex-1 text-center px-4">{title}</h3>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] bg-[#e50914] text-white px-2 py-0.5 rounded font-bold">HD</span>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="px-4 pb-4" data-control>
          {/* Progress Bar */}
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="h-1.5 bg-white/20 rounded-full mb-4 cursor-pointer group/progress hover:h-2.5 transition-all relative"
            data-control
          >
            <div className="absolute inset-y-0 left-0 bg-white/15 rounded-full" style={{ width: `${bufferProgress}%` }} />
            <div className="absolute inset-y-0 left-0 bg-[#e50914] rounded-full" style={{ width: `${progress}%` }} />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[#e50914] rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"
              style={{ left: `${progress}%`, transform: `translateX(-50%) translateY(-50%)` }}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={togglePlay} data-control className="text-white hover:text-white/80 transition-colors">
                {playing ? <Pause className="w-6 h-6" fill="white" /> : <Play className="w-6 h-6" fill="white" />}
              </button>
              <button onClick={() => skip(-10)} data-control className="text-white/70 hover:text-white transition-colors">
                <SkipBack className="w-5 h-5" />
              </button>
              <button onClick={() => skip(10)} data-control className="text-white/70 hover:text-white transition-colors">
                <SkipForward className="w-5 h-5" />
              </button>

              {/* Volume */}
              <div className="relative flex items-center" onMouseEnter={() => setShowVolume(true)} onMouseLeave={() => setShowVolume(false)}>
                <button onClick={toggleMute} data-control className="text-white/70 hover:text-white transition-colors">
                  {muted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                {showVolume && (
                  <input
                    type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume}
                    onChange={handleVolumeChange}
                    data-control
                    className="ml-2 w-20 h-1 accent-white appearance-none bg-white/30 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                  />
                )}
              </div>

              <span className="text-xs text-white/60 font-mono ml-2">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button data-control className="text-white/60 hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button onClick={togglePiP} data-control className="text-white/60 hover:text-white transition-colors">
                <PictureInPicture2 className="w-5 h-5" />
              </button>
              <button onClick={toggleFullscreen} data-control className="text-white/70 hover:text-white transition-colors">
                {fullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
