import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { markTicketUsed, getBookings, Booking } from "@/lib/adminData";
import { Camera, CameraOff, CheckCircle2, XCircle, RefreshCw, ScanLine } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function QRScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [active, setActive] = useState(false);
  const [camError, setCamError] = useState("");
  const [result, setResult] = useState<{ success: boolean; message: string; booking?: Booking } | null>(null);

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach(t => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    cancelAnimationFrame(animRef.current);
    setActive(false);
  };

  const scan = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < video.HAVE_ENOUGH_DATA) {
      animRef.current = requestAnimationFrame(scan);
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });
    if (code) {
      handleQR(code.data);
      return;
    }
    animRef.current = requestAnimationFrame(scan);
  };

  const startCamera = async () => {
    setCamError("");
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setActive(true);
        animRef.current = requestAnimationFrame(scan);
      }
    } catch {
      setCamError("Camera access denied or unavailable. Please allow camera permissions.");
    }
  };

  const handleQR = (data: string) => {
    stopCamera();
    try {
      const parsed = JSON.parse(data);
      const ref: string = parsed.ref;
      if (!ref) throw new Error("no ref");
      const bookings = getBookings();
      const found = bookings.find(b => b.ref === ref);
      if (!found) {
        setResult({ success: false, message: `Booking ref "${ref}" not found in the system.` });
        return;
      }
      if (found.status === "USED") {
        setResult({ success: false, message: `This ticket has already been used.`, booking: found });
        return;
      }
      const updated = markTicketUsed(ref);
      setResult({ success: true, message: "Ticket verified and marked as USED.", booking: updated ?? found });
    } catch {
      setResult({ success: false, message: "Invalid QR code — not a Movi Kova ticket." });
    }
  };

  useEffect(() => () => stopCamera(), []);

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="glass-card rounded-xl border border-white/8 overflow-hidden">
        {/* Camera viewport */}
        <div className="relative aspect-video bg-black flex items-center justify-center">
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
          <canvas ref={canvasRef} className="hidden" />

          {!active && !result && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-500">
              <Camera className="w-12 h-12 opacity-30" />
              <span className="text-sm">Camera inactive</span>
            </div>
          )}

          {active && (
            <>
              {/* Scan overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 border-[3px] border-white/0" />
                {/* Corner brackets */}
                {[["top-6 left-6", "border-t border-l"], ["top-6 right-6", "border-t border-r"], ["bottom-6 left-6", "border-b border-l"], ["bottom-6 right-6", "border-b border-r"]].map(([pos, bdr], i) => (
                  <div key={i} className={`absolute ${pos} w-8 h-8 ${bdr} border-[#f84464] border-2`} />
                ))}
                {/* Scanning line */}
                <motion.div
                  className="absolute left-8 right-8 h-0.5 bg-[#f84464]/70"
                  animate={{ top: ["20%", "80%", "20%"] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full">
                <ScanLine className="w-3.5 h-3.5 text-[#f84464]" />
                <span className="text-xs text-gray-300">Point at ticket QR code</span>
              </div>
            </>
          )}
        </div>

        <div className="p-4 flex justify-center gap-3">
          {!active ? (
            <button
              onClick={startCamera}
              className="btn-hs-primary flex items-center gap-2 px-6 py-2.5 text-sm"
              data-testid="button-start-scanner"
            >
              <Camera className="w-4 h-4" /> Start Scanner
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors"
              data-testid="button-stop-scanner"
            >
              <CameraOff className="w-4 h-4" /> Stop
            </button>
          )}
        </div>
      </div>

      {camError && (
        <div className="glass-card rounded-xl border border-[#f84464]/30 p-4 text-sm text-[#f84464]">
          {camError}
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`glass-card rounded-xl border p-5 ${result.success ? "border-green-500/30" : "border-[#f84464]/30"}`}
          >
            <div className="flex items-start gap-3 mb-4">
              {result.success
                ? <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                : <XCircle className="w-6 h-6 text-[#f84464] flex-shrink-0 mt-0.5" />
              }
              <div>
                <div className={`font-bold text-sm mb-0.5 ${result.success ? "text-green-400" : "text-[#f84464]"}`}>
                  {result.success ? "TICKET ACCEPTED" : "TICKET REJECTED"}
                </div>
                <div className="text-xs text-gray-400">{result.message}</div>
              </div>
            </div>

            {result.booking && (
              <div className="bg-white/[0.03] rounded-lg p-4 text-xs space-y-2 border border-white/5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Ref</span>
                  <span className="font-mono text-white font-bold">{result.booking.ref}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Movie</span>
                  <span className="text-white">{result.booking.movie}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Show</span>
                  <span className="text-white">{result.booking.showtime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Seats</span>
                  <span className="text-white">{result.booking.seats.join(", ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span className="text-[#ffc107] font-bold">₹{result.booking.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-bold ${result.booking.status === "USED" ? "text-green-400" : "text-[#ffc107]"}`}>
                    {result.booking.status}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => { setResult(null); startCamera(); }}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/8 hover:bg-white/12 text-sm text-gray-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Scan Another
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
