import { create } from 'zustand';
import { Movie, Showtime, FBOCombo } from '../data/movies';

interface BookingState {
  selectedMovie: Movie | null;
  selectedShowtime: Showtime | null;
  selectedSeats: string[];
  fboCombos: FBOCombo[];
  
  setMovie: (m: Movie) => void;
  setShowtime: (s: Showtime | null) => void;
  toggleSeat: (seatId: string) => void;
  addCombo: (c: FBOCombo) => void;
  removeCombo: (id: string) => void;
  clearBooking: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  selectedMovie: null,
  selectedShowtime: null,
  selectedSeats: [],
  fboCombos: [],
  
  setMovie: (m) => set({ selectedMovie: m, selectedShowtime: null, selectedSeats: [], fboCombos: [] }),
  setShowtime: (s) => set({ selectedShowtime: s, selectedSeats: [], fboCombos: [] }),
  toggleSeat: (seatId) => set((state) => {
    const isSelected = state.selectedSeats.includes(seatId);
    if (isSelected) {
      return { selectedSeats: state.selectedSeats.filter(id => id !== seatId) };
    } else {
      return { selectedSeats: [...state.selectedSeats, seatId] };
    }
  }),
  addCombo: (c) => set((state) => {
    const exists = state.fboCombos.find(item => item.id === c.id);
    if (exists) {
      return {
        fboCombos: state.fboCombos.map(item => 
          item.id === c.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      };
    }
    return { fboCombos: [...state.fboCombos, { ...c, quantity: 1 }] };
  }),
  removeCombo: (id) => set((state) => {
    const exists = state.fboCombos.find(item => item.id === id);
    if (exists && exists.quantity > 1) {
      return {
        fboCombos: state.fboCombos.map(item => 
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
      };
    }
    return { fboCombos: state.fboCombos.filter(item => item.id !== id) };
  }),
  clearBooking: () => set({ selectedMovie: null, selectedShowtime: null, selectedSeats: [], fboCombos: [] })
}));
