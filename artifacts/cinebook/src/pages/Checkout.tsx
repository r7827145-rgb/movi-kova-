import { useBookingStore } from "../store/booking";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { FBOCombo } from "../data/movies";
import { Minus, Plus, CheckCircle2, Banknote, MapPin, Clock, Ticket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { saveBooking } from "../lib/adminData";

const SNACK_MENU: FBOCombo[] = [
  { id: "c1", name: "CLASSIC", description: "Regular Popcorn + Regular Drink", price: 180, quantity: 0 },
  { id: "c2", name: "NACHOS SET", description: "Cheese Nachos + Regular Drink", price: 220, quantity: 0 },
  { id: "c3", name: "PREMIUM BUCKET", description: "Large Truffle Popcorn + 2 Drinks", price: 350, quantity: 0 },
  { id: "c4", name: "DATE NIGHT", description: "Large Popcorn, 2 Drinks, Hot Dog", price: 520, quantity: 0 },
];

function generateBookingRef() {
  return `CB-${Math.random().toString(36).substring(2, 6).toUpperCase()}${Math.floor(Math.random() * 9000 + 1000)}`;
}

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { selectedMovie, selectedShowtime, selectedSeats, fboCombos, addCombo, removeCombo, clearBooking } = useBookingStore();
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingRef] = useState(generateBookingRef);

  useEffect(() => {
    if (!selectedMovie || !selectedShowtime || selectedSeats.length === 0) {
      if (!isSuccess) setLocation("/");
    }
  }, [selectedMovie, selectedShowtime, selectedSeats, setLocation, isSuccess]);

  if (!selectedMovie || !selectedShowtime) return null;

  const ticketsPrice = selectedSeats.reduce((sum, seat) => {
    const row = seat.charAt(0).toUpperCase();
    if (row === "A" || row === "B") {
      return sum + Math.round(selectedShowtime.price * 0.65);
    } else if (row === "C" || row === "D" || row === "E" || row === "F") {
      return sum + Math.round(selectedShowtime.price * 0.80);
    } else {
      return sum + selectedShowtime.price;
    }
  }, 0);
  const snacksPrice = fboCombos.reduce((acc, c) => acc + (c.price * c.quantity), 0);
  const fee = 30 * selectedSeats.length;
  const total = ticketsPrice + snacksPrice + fee;

  const qrData = JSON.stringify({
    ref: bookingRef,
    movie: selectedMovie.title,
    showtime: `${selectedShowtime.date} ${selectedShowtime.time}`,
    format: selectedShowtime.format,
    hall: selectedShowtime.hallName,
    seats: selectedSeats.join(", "),
    total: `₹${total}`,
  });

  const handleConfirm = () => {
    saveBooking({
      ref: bookingRef,
      movie: selectedMovie!.title,
      movieId: selectedMovie!.id,
      showtime: `${selectedShowtime!.date} ${selectedShowtime!.time}`,
      format: selectedShowtime!.format,
      hall: selectedShowtime!.hallName,
      seats: selectedSeats,
      total,
      theaterId: selectedMovie.theaterId || "default",
      timestamp: new Date().toISOString(),
      status: "CONFIRMED",
    });
    setIsSuccess(true);
  };

  const handleDone = () => {
    clearBooking();
    setLocation("/profile");
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#0f0f0f] text-white">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start pt-24">

        <div className="lg:col-span-2 space-y-6">

          {/* Movie Summary Card */}
          <div className="glass-card rounded-xl overflow-hidden bg-[#1a1a2e]">
            <div className="flex flex-col sm:flex-row gap-6 p-6">
              <img src={selectedMovie.posterUrl} alt="Poster" className="w-28 h-40 object-cover rounded-lg shadow-lg flex-shrink-0" />
              <div className="flex flex-col justify-center gap-3">
                <h2 className="font-display font-bold text-2xl tracking-tighter">{selectedMovie.title}</h2>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-[#f84464]/20 text-[#ff6b8a] px-2 py-0.5 rounded text-xs font-bold uppercase">{selectedShowtime.format}</span>
                  <span className="bg-white/5 text-gray-300 px-2 py-0.5 rounded text-xs">{selectedShowtime.date} • {selectedShowtime.time}</span>
                  <span className="bg-white/5 text-gray-300 px-2 py-0.5 rounded text-xs">{selectedShowtime.hallName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-[#f84464]" />
                  <span className="text-sm text-gray-300">
                    <span className="text-gray-500 mr-1">Seats:</span>
                    <span className="text-white font-semibold">{selectedSeats.join(", ")}</span>
                  </span>
                </div>
                <div className="text-[#ffc107] font-bold text-lg">₹{ticketsPrice.toFixed(0)}</div>
              </div>
            </div>
          </div>

          {/* F&B Section */}
          <div className="glass-card rounded-xl p-6 bg-[#1a1a2e]">
            <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
              <div className="w-1 h-5 bg-gradient-to-b from-[#f84464] to-[#c62828] rounded-full"></div>
              Add Snacks
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SNACK_MENU.map(snack => {
                const inCart = fboCombos.find(c => c.id === snack.id);
                const qty = inCart ? inCart.quantity : 0;
                return (
                  <div key={snack.id} data-testid={`card-snack-${snack.id}`}
                    className="glass-card-dark rounded-lg p-4 flex flex-col justify-between">
                    <div className="mb-4">
                      <div className="font-bold text-sm tracking-wide text-white">{snack.name}</div>
                      <div className="text-xs text-gray-400 mt-1">{snack.description}</div>
                      <div className="text-[#ffc107] font-bold text-sm mt-2">₹{snack.price}</div>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-auto">
                      <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Qty</span>
                      <div className="flex items-center gap-3">
                        <button
                          data-testid={`button-snack-minus-${snack.id}`}
                          disabled={qty === 0}
                          onClick={() => removeCombo(snack.id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 transition-colors">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-display font-bold w-4 text-center">{qty}</span>
                        <button
                          data-testid={`button-snack-plus-${snack.id}`}
                          onClick={() => addCombo(snack)}
                          className="w-8 h-8 rounded-full flex items-center justify-center bg-[#c62828] hover:bg-[#f84464] text-white transition-colors shadow-[0_0_10px_rgba(248,68,100,0.4)]">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Summary + Cash Payment */}
        <div className="space-y-5 lg:sticky lg:top-24">
          <div className="glass-card rounded-xl p-6 bg-[#1a1a2e]">
            <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
              <div className="w-1 h-5 bg-gradient-to-b from-[#f84464] to-[#c62828] rounded-full"></div>
              Order Summary
            </h3>

            <div className="flex flex-col gap-3 text-sm text-gray-300 mb-5">
              <div className="flex justify-between">
                <span>Tickets × {selectedSeats.length}</span>
                <span className="text-white font-medium">₹{ticketsPrice.toFixed(0)}</span>
              </div>
              {snacksPrice > 0 && (
                <div className="flex justify-between">
                  <span>Food & Beverage</span>
                  <span className="text-white font-medium">₹{snacksPrice.toFixed(0)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Convenience Fee</span>
                <span className="text-white font-medium">₹{fee.toFixed(0)}</span>
              </div>
            </div>

            <div className="flex justify-between items-end border-t border-white/10 pt-4 mb-6">
              <span className="text-gray-400 font-medium">Total</span>
              <span className="text-3xl font-display font-bold text-[#f84464]">₹{total.toFixed(0)}</span>
            </div>

            {/* Cash Only Payment */}
            <div className="glass-card-dark rounded-xl p-4 mb-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#f84464]/20 flex items-center justify-center">
                  <Banknote className="w-5 h-5 text-[#ff6b8a]" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Pay with Cash</div>
                  <div className="text-xs text-gray-400">At cinema counter before showtime</div>
                </div>
              </div>
              <div className="flex flex-col gap-2 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#f84464] flex-shrink-0" />
                  <span>Show your booking QR at the ticket counter</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#f84464] flex-shrink-0" />
                  <span>Arrive 30 minutes before the show</span>
                </div>
                <div className="flex items-center gap-2">
                  <Banknote className="w-3.5 h-3.5 text-[#f84464] flex-shrink-0" />
                  <span>Pay ₹{total.toFixed(0)} in cash at counter</span>
                </div>
              </div>
            </div>

            <button
              data-testid="button-confirm-booking"
              onClick={handleConfirm}
              className="w-full btn-hs-primary justify-center py-4 text-base tracking-wider">
              CONFIRM BOOKING
            </button>
          </div>
        </div>
      </main>

      {/* Success Modal with QR Code */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 overflow-y-auto"
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="glass-modal rounded-2xl p-6 md:p-8 w-full max-w-sm flex flex-col items-center text-center relative overflow-hidden my-4 bg-[#1a1a2e]">

              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#c62828] to-[#f84464]" />

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", damping: 15 }}>
                <div className="w-16 h-16 rounded-full bg-[#f84464]/20 flex items-center justify-center mb-4 relative">
                  <div className="absolute inset-0 rounded-full border-2 border-[#f84464] animate-ping opacity-20"></div>
                  <CheckCircle2 className="w-8 h-8 text-[#f84464]" />
                </div>
              </motion.div>

              <h2 className="font-display font-bold text-xl tracking-tighter mb-1 text-white">Booking Confirmed!</h2>
              <p className="text-xs font-bold text-[#ff6b8a] mb-4 uppercase tracking-widest bg-[#c62828]/10 px-3 py-1 rounded-full">
                Ref: #{bookingRef}
              </p>

              {/* Booking Details */}
              <div className="w-full glass-card rounded-xl p-4 text-left mb-5 space-y-2 bg-[#0f0f0f]/50">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Movie</span>
                  <span className="text-white font-semibold text-right ml-4 leading-tight">{selectedMovie.title}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Showtime</span>
                  <span className="text-white font-medium">{selectedShowtime.date} • {selectedShowtime.time}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Format</span>
                  <span className="text-[#ff6b8a] font-bold uppercase">{selectedShowtime.format}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Seats</span>
                  <span className="text-white font-semibold">{selectedSeats.join(", ")}</span>
                </div>
                <div className="flex justify-between text-xs border-t border-white/10 pt-2 mt-1">
                  <span className="text-gray-400">Amount Due</span>
                  <span className="text-[#f84464] font-bold text-base">₹{total.toFixed(0)}</span>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center mb-5">
                <div className="text-xs text-gray-400 uppercase tracking-widest mb-3">Show at counter</div>
                <div className="bg-white p-3 rounded-xl shadow-[0_0_40px_rgba(248,68,100,0.2)]">
                  <QRCodeSVG
                    value={qrData}
                    size={160}
                    level="M"
                    includeMargin={false}
                    data-testid="qr-booking"
                  />
                </div>
                <div className="text-xs text-gray-500 mt-2">Scan to verify · Pay ₹{total.toFixed(0)} in cash</div>
              </div>

              {/* Cash reminder */}
              <div className="w-full bg-[#f84464]/10 border border-[#f84464]/20 rounded-lg p-3 mb-5 flex items-center gap-2">
                <Banknote className="w-4 h-4 text-[#f84464] flex-shrink-0" />
                <span className="text-xs text-[#ff6b8a] font-medium text-left">
                  Please carry ₹{total.toFixed(0)} cash. Pay at the ticket counter before your show.
                </span>
              </div>

              <div className="w-full space-y-3">
                <button data-testid="button-view-tickets" onClick={handleDone} className="w-full btn-hs-primary justify-center py-3.5">
                  VIEW MY TICKETS
                </button>
                <button data-testid="button-go-home" onClick={() => { clearBooking(); setLocation("/"); }} className="w-full py-3.5 rounded-md border border-white/15 text-white font-semibold hover:bg-white/5 transition-colors text-sm">
                  GO HOME
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
