import { motion } from "framer-motion";
import { clsx } from "clsx";

interface SeatMapProps {
  selectedSeats: string[];
  onToggle: (id: string) => void;
  rows?: number;
  cols?: number;
  bookedSeats: string[];
}

export default function SeatMap({ selectedSeats, onToggle, rows = 8, cols = 12, bookedSeats }: SeatMapProps) {
  const rowLabels = "ABCDEFGH".split("");

  return (
    <div className="w-full flex flex-col items-center">
      {/* Screen Indicator */}
      <div className="w-full max-w-[80%] mx-auto mb-16 relative perspective-[800px]">
        <div className="h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent w-full rounded-[50%] mb-4 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transform -rotate-x-12"></div>
        <div className="text-xs tracking-[0.3em] text-center text-gray-500 font-bold">SCREEN</div>
      </div>

      <div className="overflow-x-auto w-full pb-4 carousel-scroll">
        <div className="min-w-max mx-auto flex flex-col gap-3 md:gap-4 px-4">
          {rowLabels.slice(0, rows).map((row) => (
            <div key={row} className="flex items-center gap-4 md:gap-6">
              <div className="w-4 text-xs font-bold text-gray-500">{row}</div>
              <div className="flex gap-2 md:gap-3">
                {Array.from({ length: cols }).map((_, i) => {
                  const id = `${row}${i + 1}`;
                  const isBooked = bookedSeats.includes(id);
                  const isSelected = selectedSeats.includes(id);

                  // Create aisles
                  if (i === 2 || i === 9) {
                    return (
                      <div key={id} className="flex gap-2 md:gap-3 ml-6 md:ml-8">
                        <Seat 
                          id={id} 
                          isBooked={isBooked} 
                          isSelected={isSelected} 
                          onToggle={() => onToggle(id)} 
                        />
                      </div>
                    );
                  }

                  return (
                    <Seat 
                      key={id} 
                      id={id} 
                      isBooked={isBooked} 
                      isSelected={isSelected} 
                      onToggle={() => onToggle(id)} 
                    />
                  );
                })}
              </div>
              <div className="w-4 text-xs font-bold text-gray-500 text-right">{row}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-8 mt-12 text-xs font-medium text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border border-gray-600 bg-[#252542]"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#c62828] shadow-[0_0_10px_rgba(248,68,100,0.6)]"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#1a1a1a] border border-[#2a2a2a]"></div>
          <span>Booked</span>
        </div>
      </div>
    </div>
  );
}

function Seat({ id, isBooked, isSelected, onToggle }: { id: string, isBooked: boolean, isSelected: boolean, onToggle: () => void }) {
  return (
    <motion.button
      whileTap={!isBooked ? { scale: 0.85 } : undefined}
      onClick={!isBooked ? onToggle : undefined}
      disabled={isBooked}
      className={clsx(
        "w-8 h-8 md:w-10 md:h-10 rounded-t-lg rounded-b-sm flex items-center justify-center transition-colors relative overflow-hidden",
        isBooked && "bg-[#1a1a1a] border border-[#2a2a2a] cursor-not-allowed",
        isSelected && "bg-[#c62828] border border-[#f84464] shadow-[0_0_15px_rgba(248,68,100,0.5)]",
        !isBooked && !isSelected && "bg-[#252542] border border-gray-600 hover:border-[#f84464] hover:bg-[#2a2a4a]"
      )}
      data-testid={`button-seat-${id}`}
    >
      <svg className="w-full h-full opacity-80" viewBox="0 0 24 24">
        <path 
          d="M4 18v3h16v-3H4zM6 4v11h12V4H6z" 
          className={clsx(
            isBooked && "seat-booked",
            isSelected && "seat-selected",
            !isBooked && !isSelected && "seat-available"
          )}
        />
      </svg>
    </motion.button>
  );
}
