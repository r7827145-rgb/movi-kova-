import { motion, AnimatePresence } from "framer-motion";

interface StickyCTAProps {
  show: boolean;
  text: string;
  onClick: () => void;
  disabled?: boolean;
}

export default function StickyCTA({ show, text, onClick, disabled = false }: StickyCTAProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-40 pb-safe-area"
        >
          {/* Dark overlay above button */}
          <div className="h-12 bg-gradient-to-t from-[#0f0f0f] to-transparent w-full absolute -top-12 pointer-events-none" />
          
          <button
            onClick={onClick}
            disabled={disabled}
            className="w-full bg-gradient-to-r from-[#c62828] to-[#f84464] text-white font-display font-bold uppercase tracking-widest py-5 flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_-4px_20px_rgba(248,68,100,0.3)]"
            data-testid="button-sticky-cta"
          >
            {text}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
