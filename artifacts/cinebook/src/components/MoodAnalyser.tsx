import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Loader2, Mic, MicOff, Camera, Type, Layers, Ticket, Play,
  AlertCircle, ShieldCheck, RotateCcw, Brain,
} from "lucide-react";
import { useLocation } from "wouter";
import { getAllMovies } from "../lib/adminData";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SuggestedMovie {
  title: string;
  id: string;
  reason: string;
  score: number;
}

interface MoodResult {
  mood: string;
  confidence: number;
  emotion_tags: string[];
  suggested_genres: string[];
  suggested_movies: SuggestedMovie[];
  transcript?: string;
  contributing_signals?: { text: number; image: number };
}

interface MoodAnalyserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const MOOD_META: Record<string, { emoji: string; color: string; bg: string; label: string }> = {
  happy:       { emoji: "😄", color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  label: "Happy" },
  sad:         { emoji: "😢", color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  label: "Sad" },
  stressed:    { emoji: "😤", color: "#f87171", bg: "rgba(248,113,113,0.12)", label: "Stressed" },
  bored:       { emoji: "😴", color: "#94a3b8", bg: "rgba(148,163,184,0.12)", label: "Bored" },
  romantic:    { emoji: "🥰", color: "#f472b6", bg: "rgba(244,114,182,0.12)", label: "Romantic" },
  adventurous: { emoji: "🧗", color: "#34d399", bg: "rgba(52,211,153,0.12)",  label: "Adventurous" },
  nostalgic:   { emoji: "🌅", color: "#a78bfa", bg: "rgba(167,139,250,0.12)", label: "Nostalgic" },
  scared:      { emoji: "😱", color: "#ef4444", bg: "rgba(239,68,68,0.12)",   label: "Scared" },
  excited:     { emoji: "🤩", color: "#fb923c", bg: "rgba(251,146,60,0.12)",  label: "Excited" },
  relaxed:     { emoji: "😌", color: "#2dd4bf", bg: "rgba(45,212,191,0.12)",  label: "Relaxed" },
};

const TABS = [
  { id: "text",   label: "Text",   icon: Type   },
  { id: "camera", label: "Selfie", icon: Camera },
  { id: "voice",  label: "Voice",  icon: Mic    },
  { id: "hybrid", label: "Hybrid", icon: Layers },
] as const;

type TabId = typeof TABS[number]["id"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve({ base64: result.split(",")[1], mimeType: file.type });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function callMoodAPI(payload: Record<string, unknown>): Promise<MoodResult> {
  const res = await fetch(`${BASE}/api/ai/mood`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error ?? "Mood analysis failed");
  }
  return res.json();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MoodBadge({ mood, confidence }: { mood: string; confidence: number }) {
  const meta = MOOD_META[mood] ?? { emoji: "🎭", color: "#1e88e5", bg: "rgba(30,136,229,0.12)", label: mood };
  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", damping: 14, stiffness: 200 }}
      className="flex flex-col items-center gap-3 py-5"
    >
      <motion.div
        className="w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-lg"
        style={{ background: meta.bg, border: `2px solid ${meta.color}40` }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {meta.emoji}
      </motion.div>
      <div className="text-center">
        <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 mb-0.5">Detected Mood</p>
        <p className="text-2xl font-bold" style={{ color: meta.color }}>{meta.label}</p>
      </div>
      <div className="w-full max-w-[160px]">
        <div className="flex justify-between text-[10px] text-gray-500 mb-1">
          <span>Confidence</span>
          <span>{Math.round(confidence * 100)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: meta.color }}
            initial={{ width: 0 }}
            animate={{ width: `${confidence * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

function MovieSuggestions({ movies }: { movies: SuggestedMovie[] }) {
  const [, setLocation] = useLocation();
  const allMovies = getAllMovies();

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-xs uppercase tracking-widest font-semibold text-gray-400">Suggested for You</p>
      {movies.map((movie, i) => {
        const foundMovie = allMovies.find(m => m.id === movie.id || m.title.toLowerCase() === movie.title.toLowerCase());
        const isStream = foundMovie?.isStreamable;
        const isPrem = foundMovie?.isPremium;

        return (
          <motion.div
            key={movie.title}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-start gap-3 p-3 rounded-xl bg-[#16213e] border border-white/[0.07] hover:border-[#1e88e5]/30 transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1565c0]/30 to-[#1e88e5]/30 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-[#42a5f5] text-xs border border-[#1e88e5]/20">
              {movie.score}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-white font-semibold text-sm leading-snug">{movie.title}</p>
                {isStream && (
                  <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm ${
                    isPrem ? "bg-amber-500 text-black" : "bg-purple-600 text-white"
                  }`}>
                    {isPrem ? "VIP STREAM" : "STREAM FREE"}
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-[11px] leading-relaxed mt-0.5">{movie.reason}</p>
            </div>
            <div className="flex gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              {isStream && foundMovie && (
                <button
                  onClick={() => setLocation(`/watch/${foundMovie.id}`)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-white transition-all bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
                >
                  <Play className="w-3 h-3 fill-current" />
                  Watch
                </button>
              )}
              {movie.id && foundMovie?.isNowShowing && (
                <button
                  onClick={() => setLocation(`/movies/${foundMovie.id}`)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-white transition-all bg-gradient-to-r from-[#1565c0] to-[#1e88e5]"
                >
                  <Ticket className="w-3 h-3" />
                  Book
                </button>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function MoodResults({ result, onReset }: { result: MoodResult; onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4"
    >
      <MoodBadge mood={result.mood} confidence={result.confidence} />

      {result.emotion_tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {result.emotion_tags.map(tag => (
            <span key={tag} className="px-2.5 py-1 rounded-full bg-white/[0.06] text-gray-300 text-[11px] font-medium border border-white/10">
              {tag}
            </span>
          ))}
        </div>
      )}

      {result.suggested_genres?.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">Perfect Genres</p>
          <div className="flex flex-wrap gap-1.5">
            {result.suggested_genres.map(g => (
              <span key={g} className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-[#42a5f5] bg-[#1565c0]/15 border border-[#1e88e5]/20">
                {g}
              </span>
            ))}
          </div>
        </div>
      )}

      {result.transcript && (
        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Transcribed</p>
          <p className="text-gray-300 text-xs leading-relaxed italic">"{result.transcript}"</p>
        </div>
      )}

      {result.suggested_movies?.length > 0 && (
        <MovieSuggestions movies={result.suggested_movies} />
      )}

      <button
        onClick={onReset}
        className="w-full py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Analyse Again
      </button>
    </motion.div>
  );
}

// ─── Tab Panels ───────────────────────────────────────────────────────────────

function TextTab({ onResult }: { onResult: (r: MoodResult) => void }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const result = await callMoodAPI({ type: "text", text: text.trim() });
      onResult(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-gray-400 text-xs leading-relaxed">
        Describe how you're feeling right now in 1–3 sentences. The AI will detect your mood and suggest the perfect movie.
      </p>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="e.g. I've had a long stressful day and just want something cosy to unwind with..."
        rows={4}
        disabled={loading}
        className="w-full bg-[#0f0f1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1e88e5]/60 resize-none transition-colors disabled:opacity-50"
      />
      {error && (
        <div className="flex items-start gap-2 text-red-400 text-xs bg-red-500/5 border border-red-500/20 rounded-lg p-2.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}
      <button
        onClick={handleSubmit}
        disabled={!text.trim() || loading}
        className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40"
        style={{ background: "linear-gradient(135deg, #1565c0, #1e88e5)" }}
      >
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analysing...</> : <><Brain className="w-4 h-4" /> Analyse My Mood</>}
      </button>
    </div>
  );
}

function CameraTab({ onResult }: { onResult: (r: MoodResult) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [liveMode, setLiveMode] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      setLiveMode(true);
    } catch {
      setError("Camera access denied. Try uploading a selfie instead.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setLiveMode(false);
  };

  const captureFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setPreview(dataUrl);
    stopCamera();
  };

  useEffect(() => {
    if (liveMode && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [liveMode]);

  useEffect(() => () => stopCamera(), []);

  const analyseImage = async (base64: string, mime: string) => {
    setLoading(true);
    setError("");
    try {
      const result = await callMoodAPI({ type: "image", imageBase64: base64, mimeType: mime });
      onResult(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
      setLoading(false);
    }
  };

  const handleCapture = async () => {
    if (!preview) return;
    const base64 = preview.split(",")[1];
    await analyseImage(base64, "image/jpeg");
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { base64, mimeType } = await fileToBase64(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
    await analyseImage(base64, mimeType);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-2 bg-[#1565c0]/10 border border-[#1e88e5]/20 rounded-xl p-3">
        <ShieldCheck className="w-4 h-4 text-[#42a5f5] flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-gray-300 leading-relaxed">
          <span className="font-semibold text-[#42a5f5]">Privacy:</span> Image processed ephemerally — not stored or retained after analysis.
        </p>
      </div>

      {!liveMode && !preview && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={startCamera}
            className="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-[#16213e] border border-white/10 hover:border-[#1e88e5]/50 hover:bg-[#1a2a4a] transition-all text-white group"
          >
            <Camera className="w-6 h-6 text-[#1e88e5] group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Take Selfie</span>
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-[#16213e] border border-white/10 hover:border-[#1e88e5]/50 hover:bg-[#1a2a4a] transition-all text-white group"
          >
            <Type className="w-6 h-6 text-[#1e88e5] group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Upload Photo</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
      )}

      {liveMode && (
        <div className="flex flex-col gap-3">
          <div className="rounded-xl overflow-hidden bg-black border border-white/10 relative">
            <video ref={videoRef} autoPlay playsInline muted className="w-full max-h-52 object-cover" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={stopCamera} className="py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm hover:text-white transition-all">Cancel</button>
            <button
              onClick={captureFrame}
              className="py-2.5 rounded-xl font-bold text-sm text-white transition-all"
              style={{ background: "linear-gradient(135deg, #1565c0, #1e88e5)" }}
            >📸 Capture</button>
          </div>
        </div>
      )}

      {preview && !liveMode && (
        <div className="flex flex-col gap-3">
          <div className="rounded-xl overflow-hidden border border-white/10 bg-black relative">
            <img src={preview} alt="Selfie preview" className="w-full max-h-52 object-cover" />
            {loading && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-8 h-8 text-[#1e88e5] animate-spin" />
                <p className="text-white text-sm font-medium">Reading expression...</p>
              </div>
            )}
          </div>
          {!loading && (
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setPreview(null)} className="py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm hover:text-white transition-all">Retake</button>
              <button onClick={handleCapture} className="py-2.5 rounded-xl font-bold text-sm text-white" style={{ background: "linear-gradient(135deg, #1565c0, #1e88e5)" }}>
                <Brain className="w-4 h-4 inline mr-1.5" />Analyse
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 text-red-400 text-xs bg-red-500/5 border border-red-500/20 rounded-lg p-2.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />{error}
        </div>
      )}
    </div>
  );
}

function VoiceTab({ onResult }: { onResult: (r: MoodResult) => void }) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setLoading(true);
        setError("");
        try {
          const base64 = await blobToBase64(blob);
          const result = await callMoodAPI({ type: "voice", audioBase64: base64, audioMimeType: "audio/webm" });
          onResult(result);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Failed");
          setLoading(false);
        }
      };
      recorder.start(200);
      recorderRef.current = recorder;
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => {
        setSeconds(s => {
          if (s >= 14) { stopRecording(); return 15; }
          return s + 1;
        });
      }, 1000);
    } catch {
      setError("Microphone access denied.");
    }
  };

  const stopRecording = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    recorderRef.current?.stop();
    recorderRef.current = null;
    setRecording(false);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-2 bg-[#1565c0]/10 border border-[#1e88e5]/20 rounded-xl p-3">
        <ShieldCheck className="w-4 h-4 text-[#42a5f5] flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-gray-300 leading-relaxed">
          <span className="font-semibold text-[#42a5f5]">Privacy:</span> Voice is transcribed ephemerally — not stored. Max 15 seconds.
        </p>
      </div>

      <p className="text-gray-400 text-xs text-center leading-relaxed">
        Speak naturally about how you're feeling. The AI will pick up on your tone and words.
      </p>

      <div className="flex flex-col items-center gap-4 py-4">
        {recording && (
          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1.5 rounded-full bg-[#1e88e5]"
                animate={{ height: ["8px", `${16 + Math.random() * 20}px`, "8px"] }}
                transition={{ duration: 0.5 + i * 0.1, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}
          </div>
        )}

        <button
          onClick={recording ? stopRecording : startRecording}
          disabled={loading}
          className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all ${recording ? "bg-red-500 hover:bg-red-600 scale-110" : "hover:scale-105"} disabled:opacity-40`}
          style={!recording ? { background: "linear-gradient(135deg, #1565c0, #1e88e5)" } : {}}
        >
          {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : recording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
        </button>

        <p className="text-sm font-medium text-gray-300">
          {loading ? "Analysing voice..." : recording ? `Recording — ${15 - seconds}s left` : "Tap to start recording"}
        </p>

        {recording && (
          <div className="w-40 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-red-400"
              initial={{ width: 0 }}
              animate={{ width: `${(seconds / 15) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 text-red-400 text-xs bg-red-500/5 border border-red-500/20 rounded-lg p-2.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />{error}
        </div>
      )}
    </div>
  );
}

function HybridTab({ onResult }: { onResult: (r: MoodResult) => void }) {
  const [text, setText] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState("image/jpeg");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { base64, mimeType } = await fileToBase64(file);
    setImageBase64(base64);
    setImageMime(mimeType);
    setImagePreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleSubmit = async () => {
    if (!text.trim() && !imageBase64) return;
    setLoading(true);
    setError("");
    try {
      const payload: Record<string, unknown> = { type: "hybrid" };
      if (text.trim()) payload.text = text.trim();
      if (imageBase64) { payload.imageBase64 = imageBase64; payload.mimeType = imageMime; }
      const result = await callMoodAPI(payload);
      onResult(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-gray-400 text-xs leading-relaxed">
        Combine text + selfie for the most accurate mood detection.
      </p>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="How are you feeling? (optional)"
        rows={3}
        disabled={loading}
        className="w-full bg-[#0f0f1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1e88e5]/60 resize-none transition-colors disabled:opacity-50"
      />

      <div className="flex items-center gap-2">
        {imagePreview ? (
          <div className="relative">
            <img src={imagePreview} alt="Selfie" className="w-14 h-14 rounded-xl object-cover border border-white/10" />
            <button
              onClick={() => { setImagePreview(null); setImageBase64(null); }}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#16213e] border border-white/10 hover:border-[#1e88e5]/40 transition-all text-gray-300 text-xs font-medium"
          >
            <Camera className="w-4 h-4 text-[#1e88e5]" />
            Add Selfie (optional)
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>

      {error && (
        <div className="flex items-start gap-2 text-red-400 text-xs bg-red-500/5 border border-red-500/20 rounded-lg p-2.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />{error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={(!text.trim() && !imageBase64) || loading}
        className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40"
        style={{ background: "linear-gradient(135deg, #1565c0, #1e88e5)" }}
      >
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Fusing signals...</> : <><Layers className="w-4 h-4" />Analyse Hybrid Mood</>}
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MoodAnalyser({ open, onOpenChange }: MoodAnalyserProps) {
  const [activeTab, setActiveTab] = useState<TabId>("text");
  const [result, setResult] = useState<MoodResult | null>(null);

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => { setResult(null); setActiveTab("text"); }, 300);
  };

  const handleResult = (r: MoodResult) => setResult(r);
  const handleReset = () => setResult(null);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

        <motion.div
          className="relative w-full sm:max-w-md bg-[#0d1117] border border-white/10 rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: "92dvh" }}
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", damping: 24, stiffness: 280 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#16213e] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-display font-bold text-white text-sm tracking-wider uppercase">Mood Match</p>
                <p className="text-[10px] text-gray-400">AI-powered movie recommendations</p>
              </div>
            </div>
            <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab bar — only show if no result */}
          {!result && (
            <div className="flex border-b border-white/10 flex-shrink-0 bg-[#0d1117]">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold uppercase tracking-wider transition-all ${active ? "text-[#42a5f5] border-b-2 border-[#1e88e5]" : "text-gray-500 hover:text-gray-300"}`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {result ? (
              <MoodResults result={result} onReset={handleReset} />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.18 }}
                >
                  {activeTab === "text"   && <TextTab   onResult={handleResult} />}
                  {activeTab === "camera" && <CameraTab onResult={handleResult} />}
                  {activeTab === "voice"  && <VoiceTab  onResult={handleResult} />}
                  {activeTab === "hybrid" && <HybridTab onResult={handleResult} />}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
