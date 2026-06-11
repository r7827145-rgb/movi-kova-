import { motion } from "framer-motion";
import { useEffect } from "react";

interface SplashScreenProps {
  onDone: () => void;
}

export default function SplashScreen({ onDone }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDone();
    }, 5400);
    return () => clearTimeout(timer);
  }, [onDone]);

  const textVariants = {
    hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5 } }
  };

  const moviText = "MOVI".split("");
  const kovaText = "KOVA".split("");

  return (
    <motion.div 
      className="fixed inset-0 z-[100] bg-[#0f0f0f] flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.6, delay: 4.8 }}
    >
      {/* film strip line */}
      <motion.div 
        className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/20"
        initial={{ scaleX: 0, transformOrigin: "left" }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.4, ease: "easeInOut" }}
      />
      
      {/* projector beam */}
      <motion.div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[100vh] bg-white pointer-events-none"
        style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.06, 0] }}
        transition={{ duration: 1, delay: 1.0, times: [0, 0.5, 1], ease: "easeInOut" }}
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* MOVI */}
        <motion.div 
          className="flex font-display font-bold text-7xl md:text-9xl text-white tracking-[-0.05em]"
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.08, delayChildren: 1.5 }}
        >
          {moviText.map((letter, i) => (
            <motion.span key={i} variants={textVariants}>{letter}</motion.span>
          ))}
        </motion.div>

        {/* Blue rule */}
        <motion.div 
          className="h-[2px] bg-[#1e88e5] mt-2 mb-2"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "100%", opacity: 1 }}
          transition={{ duration: 1.3, delay: 2.2, ease: "easeInOut" }}
        />

        {/* KOVA */}
        <motion.div 
          className="flex font-display font-bold text-7xl md:text-9xl text-white tracking-[-0.05em]"
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.08, delayChildren: 2.8 }}
        >
          {kovaText.map((letter, i) => (
            <motion.span 
              key={i} 
              variants={textVariants}
            >
              <motion.span
                animate={{ 
                  color: ["#42a5f5", "#ffffff"],
                  textShadow: ["0 0 20px #42a5f5", "0 0 0px #ffffff"] 
                }}
                transition={{ duration: 0.8, delay: 2.8 + i * 0.08 }}
              >
                {letter}
              </motion.span>
            </motion.span>
          ))}
        </motion.div>

        {/* Tagline */}
        <motion.div 
          className="mt-6 font-sans font-light text-[#9e9e9e] text-sm uppercase tracking-[0.3em]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 3.8 }}
        >
          Cinema reimagined
        </motion.div>
      </div>
    </motion.div>
  );
}