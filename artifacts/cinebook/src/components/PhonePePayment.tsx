import { useState, useEffect } from "react";
import { X, Check, AlertCircle, CreditCard, Smartphone, Wallet, Building } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";

interface PhonePePaymentProps {
  amount: number;
  description: string;
  onSuccess: (transactionId: string, method: string) => void;
  onClose: () => void;
}

type PaymentMethod = "upi" | "card" | "wallet" | "netbanking";
type PaymentStep = "select" | "processing" | "success" | "failed";

export default function PhonePePayment({ amount, description, onSuccess, onClose }: PhonePePaymentProps) {
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [step, setStep] = useState<PaymentStep>("select");
  const [upiId, setUpiId] = useState("");
  const [upiError, setUpiError] = useState("");
  const [timer, setTimer] = useState(30);
  const [txnId, setTxnId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardError, setCardError] = useState("");

  // Timer countdown during processing
  useEffect(() => {
    if (step !== "processing") return;
    if (timer <= 0) {
      setStep("failed");
      return;
    }
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [step, timer]);

  // Auto-succeed after 3 seconds of processing
  useEffect(() => {
    if (step !== "processing") return;
    const timeout = setTimeout(() => {
      const id = `TXN${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      setTxnId(id);
      setStep("success");
    }, 3000);
    return () => clearTimeout(timeout);
  }, [step]);

  const validateUpi = (id: string) => /^[\w.-]+@[\w]+$/.test(id);

  const handlePay = () => {
    if (method === "upi" && !validateUpi(upiId)) {
      setUpiError("Enter a valid UPI ID (e.g. name@upi)");
      return;
    }
    if (method === "card") {
      if (cardNumber.length < 16) {
        setCardError("Card number must be 16 digits");
        return;
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        setCardError("Enter a valid expiry date (MM/YY)");
        return;
      }
      if (cardCvv.length < 3) {
        setCardError("CVV must be 3 or 4 digits");
        return;
      }
      if (!cardHolder.trim() || cardHolder.trim().length < 3) {
        setCardError("Cardholder name must be at least 3 characters");
        return;
      }
      setCardError("");
    }
    setUpiError("");
    setTimer(30);
    setStep("processing");
  };

  const methods = [
    { id: "upi" as const, label: "UPI", icon: Smartphone, color: "#6739B7" },
    { id: "card" as const, label: "Card", icon: CreditCard, color: "#1565c0" },
    { id: "wallet" as const, label: "Wallet", icon: Wallet, color: "#e65100" },
    { id: "netbanking" as const, label: "Net Banking", icon: Building, color: "#2e7d32" },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-[#0f0f1a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div
          className="p-4 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #6739B7 0%, #4A148C 100%)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#6739B7">
                <path d="M7.5 3h9a1.5 1.5 0 011.5 1.5v15a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 016 19.5v-15A1.5 1.5 0 017.5 3zm4.5 15a1 1 0 100-2 1 1 0 000 2z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">PhonePe</h2>
              <p className="text-white/60 text-xs">{description}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount */}
        <div className="px-5 py-4 border-b border-white/8 text-center">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Amount to Pay</p>
          <p className="text-3xl font-display font-bold text-white">₹{amount.toLocaleString("en-IN")}</p>
        </div>

        <AnimatePresence mode="wait">
          {/* SELECT METHOD */}
          {step === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-5"
            >
              {/* Method Tabs */}
              <div className="flex gap-2 mb-5">
                {methods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium border transition-all ${
                      method === m.id
                        ? "bg-white/10 border-[#6739B7] text-white shadow-[0_0_15px_rgba(103,57,183,0.2)]"
                        : "bg-white/[0.02] border-white/8 text-gray-500 hover:border-white/20"
                    }`}
                  >
                    <m.icon className="w-5 h-5" />
                    {m.label}
                  </button>
                ))}
              </div>

              {/* UPI Method */}
              {method === "upi" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">UPI ID</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => { setUpiId(e.target.value); setUpiError(""); }}
                      placeholder="yourname@upi"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#6739B7] transition-colors"
                    />
                    {upiError && <p className="text-red-400 text-xs mt-1.5">{upiError}</p>}
                  </div>

                  <div className="text-center">
                    <p className="text-gray-500 text-xs mb-3">Or scan QR to pay</p>
                    <div className="inline-block bg-white p-3 rounded-xl">
                      <QRCodeSVG
                        value={`upi://pay?pa=movikova@phonepe&pn=MoviKova&am=${amount}&cu=INR&tn=${description}`}
                        size={140}
                        level="M"
                      />
                    </div>
                    <p className="text-gray-600 text-[11px] mt-2">movikova@phonepe</p>
                  </div>
                </div>
              )}

              {/* Card Method */}
              {method === "card" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => { setCardHolder(e.target.value); setCardError(""); }}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#6739B7]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => { setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16)); setCardError(""); }}
                      placeholder="1234 5678 9012 3456"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#6739B7] font-mono tracking-wider"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Expiry</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, "");
                          if (val.length > 2) {
                            val = val.slice(0, 2) + "/" + val.slice(2, 4);
                          } else {
                            val = val.slice(0, 2);
                          }
                          setCardExpiry(val);
                          setCardError("");
                        }}
                        placeholder="MM/YY"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#6739B7] font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">CVV</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => { setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4)); setCardError(""); }}
                        placeholder="•••"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#6739B7] font-mono"
                      />
                    </div>
                  </div>
                  {cardError && <p className="text-red-400 text-xs mt-1.5">{cardError}</p>}
                </div>
              )}

              {/* Wallet */}
              {method === "wallet" && (
                <div className="space-y-2">
                  {["PhonePe Wallet", "Paytm", "Amazon Pay", "Freecharge"].map((w) => (
                    <button key={w} className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/8 hover:border-white/20 transition-colors text-left">
                      <div className="w-8 h-8 rounded-lg bg-[#6739B7]/20 flex items-center justify-center">
                        <Wallet className="w-4 h-4 text-[#6739B7]" />
                      </div>
                      <span className="text-sm text-white font-medium">{w}</span>
                      <span className="ml-auto text-xs text-gray-500">→</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Net Banking */}
              {method === "netbanking" && (
                <div className="space-y-2">
                  {["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Bank"].map((b) => (
                    <button key={b} className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/8 hover:border-white/20 transition-colors text-left">
                      <div className="w-8 h-8 rounded-lg bg-[#2e7d32]/20 flex items-center justify-center">
                        <Building className="w-4 h-4 text-[#4caf50]" />
                      </div>
                      <span className="text-sm text-white font-medium">{b}</span>
                      <span className="ml-auto text-xs text-gray-500">→</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Pay Button */}
              <button
                onClick={handlePay}
                className="w-full mt-5 py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:brightness-110 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #6739B7 0%, #4A148C 100%)" }}
              >
                Pay ₹{amount.toLocaleString("en-IN")}
              </button>

              <p className="text-center text-gray-600 text-[10px] mt-3 flex items-center justify-center gap-1">
                <svg viewBox="0 0 16 16" className="w-3 h-3" fill="currentColor">
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 1a6 6 0 110 12A6 6 0 018 2zm0 3a1 1 0 00-1 1v3a1 1 0 001 1h2a1 1 0 100-2H9V6a1 1 0 00-1-1z" />
                </svg>
                Secured by PhonePe · Demo Mode
              </p>
            </motion.div>
          )}

          {/* PROCESSING */}
          {step === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-10 text-center"
            >
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
                <div className="absolute inset-0 border-4 border-[#6739B7] border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-[#6739B7]" />
                </div>
              </div>
              <h3 className="text-white font-display font-bold text-lg mb-2">Processing Payment</h3>
              <p className="text-gray-400 text-sm mb-4">
                {method === "upi" ? `Approve the request on your UPI app` : "Verifying payment details..."}
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/8">
                <div className="w-2 h-2 bg-[#ffc107] rounded-full animate-pulse" />
                <span className="text-xs text-gray-400">Waiting... {timer}s</span>
              </div>
            </motion.div>
          )}

          {/* SUCCESS */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="p-10 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
                className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #2e7d32, #4caf50)" }}
              >
                <Check className="w-10 h-10 text-white" strokeWidth={3} />
              </motion.div>
              <h3 className="text-white font-display font-bold text-xl mb-2">Payment Successful!</h3>
              <p className="text-gray-400 text-sm mb-5">₹{amount.toLocaleString("en-IN")} paid via {method.toUpperCase()}</p>

              <div className="bg-white/[0.03] border border-white/8 rounded-xl p-4 text-left space-y-2 mb-6">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Transaction ID</span>
                  <span className="text-white font-mono text-[11px]">{txnId}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Date</span>
                  <span className="text-white">{new Date().toLocaleDateString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Method</span>
                  <span className="text-white capitalize">{method}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Status</span>
                  <span className="text-green-400 font-bold">SUCCESS</span>
                </div>
              </div>

              <button
                onClick={() => onSuccess(txnId, method)}
                className="w-full py-3 rounded-xl font-bold text-white text-sm"
                style={{ background: "linear-gradient(135deg, #2e7d32, #4caf50)" }}
              >
                Continue
              </button>
            </motion.div>
          )}

          {/* FAILED */}
          {step === "failed" && (
            <motion.div
              key="failed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-10 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-red-500/20 mx-auto mb-5 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-400" />
              </div>
              <h3 className="text-white font-display font-bold text-xl mb-2">Payment Failed</h3>
              <p className="text-gray-400 text-sm mb-6">Transaction timed out or was declined. Please try again.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setStep("select"); setTimer(30); }}
                  className="flex-1 py-3 rounded-xl font-bold text-white text-sm"
                  style={{ background: "linear-gradient(135deg, #6739B7, #4A148C)" }}
                >
                  Retry
                </button>
                <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/15 text-gray-400 text-sm font-medium hover:text-white transition-colors">
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
