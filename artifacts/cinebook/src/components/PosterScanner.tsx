import { useState, useRef, useCallback } from "react";
import { Camera, Upload, X, Loader2, Ticket, AlertCircle, ScanLine, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

interface ScanResult {
  matched: boolean;
  movieId?: string;
  movieTitle?: string;
  confidence?: "high" | "medium" | "low";
  reason?: string;
  detectedTitle?: string | null;
}

interface PosterScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function scanPoster(imageBase64: string, mimeType: string): Promise<ScanResult> {
  const res = await fetch(`${BASE}/api/ai/scan-poster`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64, mimeType }),
  });
  if (!res.ok) throw new Error("Scan failed");
  return res.json();
}

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve({ base64, mimeType: file.type });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PosterScanner({ open, onOpenChange }: PosterScannerProps) {
  const [, setLocation] = useLocation();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setResult(null);
    setPreview(null);
    setError(null);
    setScanning(false);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onOpenChange(false);
  }, [reset, onOpenChange]);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setScanning(true);
    setResult(null);
    setError(null);

    try {
      const { base64, mimeType } = await fileToBase64(file);
      const scanResult = await scanPoster(base64, mimeType);
      setResult(scanResult);
    } catch {
      setError("Failed to scan poster. Please try again.");
    } finally {
      setScanning(false);
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  }, [processFile]);

  const handleBookNow = useCallback(() => {
    if (result?.movieId) {
      handleClose();
      setLocation(`/movies/${result.movieId}`);
    }
  }, [result, handleClose, setLocation]);

  const confidenceColor = result?.confidence === "high"
    ? "text-green-400" : result?.confidence === "medium"
    ? "text-yellow-400" : "text-orange-400";

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

        <motion.div
          className="relative w-full sm:max-w-md bg-[#0d1117] border border-white/10 rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: "90dvh" }}
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: "spring", damping: 24, stiffness: 300 }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#16213e]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1565c0] to-[#1e88e5] flex items-center justify-center">
                <ScanLine className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-display font-bold text-white text-sm tracking-wider uppercase">Poster Scanner</p>
                <p className="text-[10px] text-gray-400">AI-powered movie detection</p>
              </div>
            </div>
            <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
            {!preview && !scanning && (
              <>
                <div className="rounded-xl border border-dashed border-white/20 bg-white/[0.03] p-6 flex flex-col items-center gap-3 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1565c0]/20 to-[#1e88e5]/20 flex items-center justify-center border border-[#1e88e5]/20">
                    <Sparkles className="w-7 h-7 text-[#1e88e5]" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm mb-1">Scan any movie poster</p>
                    <p className="text-gray-400 text-xs leading-relaxed">Our AI will recognise the movie and take you straight to the booking page.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-[#16213e] border border-white/10 hover:border-[#1e88e5]/50 hover:bg-[#1a2a4a] transition-all text-white group"
                  >
                    <Camera className="w-6 h-6 text-[#1e88e5] group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Take Photo</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-[#16213e] border border-white/10 hover:border-[#1e88e5]/50 hover:bg-[#1a2a4a] transition-all text-white group"
                  >
                    <Upload className="w-6 h-6 text-[#1e88e5] group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Upload Image</span>
                  </button>
                </div>

                <p className="text-center text-[11px] text-gray-500">Works with posters, banners, billboards & screenshots</p>
              </>
            )}

            {(preview || scanning) && (
              <div className="flex flex-col gap-4">
                <div className="relative rounded-xl overflow-hidden bg-[#16213e] border border-white/10">
                  {preview && (
                    <img src={preview} alt="Scanned poster" className="w-full max-h-64 object-contain" />
                  )}
                  {scanning && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 gap-3">
                      <div className="relative">
                        <ScanLine className="w-10 h-10 text-[#1e88e5] animate-pulse" />
                        <motion.div
                          className="absolute inset-x-0 h-0.5 bg-[#1e88e5] shadow-[0_0_8px_#1e88e5]"
                          animate={{ top: ["0%", "100%", "0%"] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                      </div>
                      <p className="text-white text-sm font-medium">Analysing poster...</p>
                      <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                    </div>
                  )}
                </div>

                {result && !scanning && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl p-4 border ${result.matched ? "border-green-500/30 bg-green-500/5" : "border-white/10 bg-[#16213e]"}`}
                  >
                    {result.matched ? (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Ticket className="w-4 h-4 text-green-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-green-400 text-xs font-semibold uppercase tracking-wider mb-1">Movie Recognised!</p>
                            <p className="text-white font-bold text-base leading-snug">{result.movieTitle}</p>
                            <p className={`text-xs mt-1 ${confidenceColor}`}>
                              {result.confidence === "high" ? "✓ High confidence match" : result.confidence === "medium" ? "~ Medium confidence" : "! Low confidence"}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleBookNow}
                          className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all"
                          style={{ background: "linear-gradient(135deg, #1565c0, #1e88e5)" }}
                        >
                          Book Tickets →
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-white font-semibold text-sm">
                            {result.detectedTitle ? `"${result.detectedTitle}" not in our catalogue` : "No movie detected"}
                          </p>
                          <p className="text-gray-400 text-xs mt-1">{result.reason}</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {error && !scanning && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl p-4 border border-red-500/30 bg-red-500/5 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-300 text-sm">{error}</p>
                  </motion.div>
                )}

                {!scanning && (
                  <button
                    onClick={reset}
                    className="w-full py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm hover:text-white hover:border-white/20 transition-all"
                  >
                    Scan another poster
                  </button>
                )}
              </div>
            )}
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
