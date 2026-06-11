import { Sparkles, ScanLine, Brain } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AIChatPanel from "./AIChatPanel";
import PosterScanner from "./PosterScanner";
import MoodAnalyser from "./MoodAnalyser";

export default function AILauncher() {
  const [chatOpen, setChatOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [moodOpen, setMoodOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleOpenChat = () => { setMenuOpen(false); setChatOpen(true); };
  const handleOpenScanner = () => { setMenuOpen(false); setScannerOpen(true); };
  const handleOpenMood = () => { setMenuOpen(false); setMoodOpen(true); };

  const menuItems = [
    { key: "scanner", label: "Poster Scanner", icon: ScanLine, onClick: handleOpenScanner, delay: 0.06 },
    { key: "mood",    label: "Mood Match 🎭",  icon: Brain,    onClick: handleOpenMood,    delay: 0.03 },
    { key: "chat",    label: "AI Concierge",   icon: Sparkles, onClick: handleOpenChat,    delay: 0 },
  ];

  return (
    <>
      <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-40 flex flex-col items-end gap-3">
        <AnimatePresence>
          {menuOpen && (
            <motion.div 
              initial="exit"
              animate="enter"
              exit="exit"
              className="flex flex-col items-end gap-3"
            >
              {menuItems.map(item => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.key}
                    onClick={item.onClick}
                    initial={{ opacity: 0, y: 12, scale: 0.85 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.85 }}
                    transition={{ duration: 0.18, delay: item.delay }}
                    className="flex items-center gap-2.5 bg-[#16213e] border border-[#1e88e5]/40 text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg hover:bg-[#1a2a4a] transition-colors"
                  >
                    <Icon className="w-4 h-4 text-[#1e88e5]" />
                    {item.label}
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setMenuOpen(prev => !prev)}
          className="w-14 h-14 rounded-full flex items-center justify-center relative overflow-hidden hover:scale-105 transition-transform shadow-xl"
          style={{ background: "linear-gradient(135deg, #1565c0, #1e88e5)" }}
          data-testid="button-ai-launcher"
          aria-label="AI features"
        >
          <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-white" />
          <motion.div
            animate={{ rotate: menuOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
            className="relative z-10"
          >
            <Sparkles className="w-6 h-6 text-white" />
          </motion.div>
        </button>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
      )}

      <AIChatPanel open={chatOpen} onOpenChange={setChatOpen} onOpenScanner={handleOpenScanner} />
      <PosterScanner open={scannerOpen} onOpenChange={setScannerOpen} />
      <MoodAnalyser open={moodOpen} onOpenChange={setMoodOpen} />
    </>
  );
}
