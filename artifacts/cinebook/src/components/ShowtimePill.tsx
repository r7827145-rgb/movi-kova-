import { Showtime } from "../data/movies";
import { clsx } from "clsx";

interface ShowtimePillProps {
  showtime: Showtime;
  selected: boolean;
  onClick: () => void;
}

export default function ShowtimePill({ showtime, selected, onClick }: ShowtimePillProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex flex-col border p-4 text-left transition-all duration-200 rounded-md relative overflow-hidden",
        selected 
          ? "bg-gradient-to-br from-[#c62828] to-[#f84464] text-white border-transparent shadow-[0_4px_20px_rgba(248,68,100,0.35)]" 
          : "bg-[#1a1a2e] text-white border-white/10 hover:border-white/30 hover:bg-[#252542]"
      )}
      data-testid={`button-showtime-${showtime.id}`}
    >
      <div className="flex justify-between items-center w-full mb-3">
        <span className={clsx("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded", selected ? "bg-white/20 text-white" : "bg-[#f84464]/20 text-[#ff6b8a]")}>
          {showtime.format}
        </span>
        <span className="text-[10px] text-gray-400 font-medium">
          {showtime.hallName}
        </span>
      </div>
      <div className="flex justify-between items-end w-full">
        <span className="text-xl font-display font-bold tracking-tight">{showtime.time}</span>
        <span className={clsx("text-sm font-bold", selected ? "text-white" : "text-[#42a5f5]")}>
          ₹{showtime.price}
        </span>
      </div>
      {selected && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 rounded-full blur-xl -mr-8 -mt-8" />
      )}
    </button>
  );
}
