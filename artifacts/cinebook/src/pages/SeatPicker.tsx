import { useBookingStore } from "../store/booking";
import { useLocation, Link } from "wouter";
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import SeatMap from "../components/SeatMap";
import StickyCTA from "../components/StickyCTA";
import { ArrowLeft } from "lucide-react";

export default function SeatPicker() {
  const [, setLocation] = useLocation();
  const { selectedMovie, selectedShowtime, selectedSeats, toggleSeat } = useBookingStore();

  useEffect(() => {
    if (!selectedMovie || !selectedShowtime) {
      setLocation("/");
    }
  }, [selectedMovie, selectedShowtime, setLocation]);

  if (!selectedMovie || !selectedShowtime) return null;

  // Mock booked seats deterministically based on showtime ID
  const numId = parseInt(selectedShowtime.id.replace('s', ''));
  const rowLabels = "ABCDEFGH".split("");
  const mockBooked = [
    `${rowLabels[(numId) % 8]}4`,
    `${rowLabels[(numId) % 8]}5`,
    `${rowLabels[(numId + 1) % 8]}6`,
    `${rowLabels[(numId + 1) % 8]}7`,
    `G10`, `G11`, `G12`
  ];

  const handleProceed = () => {
    setLocation("/checkout");
  };

  const showtimePrice = selectedShowtime.price;
  const totalPrice = selectedSeats.length * showtimePrice;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#0f0f0f]">
      <Navbar />

      {/* Info Strip */}
      <div className="bg-[#1a1a2e] text-white px-4 py-4 flex items-center justify-between sticky top-16 z-30 border-b border-white/5">
        <div className="flex items-center gap-4 max-w-7xl mx-auto w-full">
          <Link href={`/movies/${selectedMovie.id}`} className="text-gray-400 hover:text-[#f84464] transition-colors w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="font-display font-bold text-lg tracking-tight leading-tight">{selectedMovie.title}</div>
            <div className="text-xs text-[#f84464] font-medium mt-0.5">
              {selectedShowtime.format} • {selectedShowtime.time} • {selectedShowtime.hallName}
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 flex flex-col p-4 md:p-8 overflow-hidden max-w-7xl mx-auto w-full">
        {/* Seat Categories Legend */}
        <div className="flex flex-wrap justify-center gap-6 mb-6 p-4 bg-[#1a1a2e] rounded-lg border border-white/8 w-full max-w-4xl mx-auto">
          {[
            { name: "PLATINUM", price: showtimePrice, color: "#9c6fe0" },
            { name: "GOLD", price: Math.round(showtimePrice * 0.8), color: "#ffc107" },
            { name: "SILVER", price: Math.round(showtimePrice * 0.65), color: "#78909c" },
          ].map(cat => (
            <div key={cat.name} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: cat.color + "33", border: `1.5px solid ${cat.color}` }} />
              <span className="text-xs font-semibold text-gray-300">{cat.name}</span>
              <span className="text-xs text-gray-500">₹{cat.price}</span>
            </div>
          ))}
          <div className="h-6 border-r border-white/10 hidden sm:block mx-2"></div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-[#f84464]/20 border border-[#f84464]" />
            <span className="text-xs text-gray-300">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-[#2a2a2a] border border-[#1a1a1a]" />
            <span className="text-xs text-gray-300">Booked</span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <SeatMap 
            selectedSeats={selectedSeats}
            onToggle={toggleSeat}
            bookedSeats={mockBooked}
          />
        </div>

        {/* Summary Strip */}
        <div className="mt-auto pt-6 pb-24 text-center max-w-md mx-auto w-full">
          <div className="text-sm font-semibold text-gray-400 mb-1">
            {selectedSeats.length} SEATS SELECTED
          </div>
          <div className="font-display font-bold text-4xl text-[#f84464] mb-2">
            ₹{totalPrice.toFixed(2)}
          </div>
          <div className="text-xs text-[#ff6b8a] font-medium min-h-[20px]">
            {selectedSeats.join(", ")}
          </div>
        </div>
      </main>

      <StickyCTA 
        show={true}
        disabled={selectedSeats.length === 0}
        text="CONTINUE" 
        onClick={handleProceed} 
      />
    </div>
  );
}
