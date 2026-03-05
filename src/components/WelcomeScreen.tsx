import React from 'react';
import { motion } from 'motion/react';

interface WelcomeScreenProps {
  onStart: () => void;
  onChauffeurStart: () => void;
}

export default function WelcomeScreen({ onStart, onChauffeurStart }: WelcomeScreenProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="relative h-full w-full flex flex-col p-8 overflow-hidden bg-black"
    >
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-60"
        >
          <source src="https://res.cloudinary.com/dgzysyl8g/video/upload/v1/banner_xzwanc.mp4" type="video/mp4" />
          <div className="w-full h-full bg-[#001F3F]" />
        </video>
        {/* Softer, more elegant gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Top Logo */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="relative z-10 flex justify-center mt-12"
      >
        <img 
          src="https://lh3.googleusercontent.com/d/1eQeW4NAEtlRUwxyDpObf5acpd1ZNCB1_" 
          alt="URBONT" 
          className="h-20 object-contain brightness-0 invert"
          referrerPolicy="no-referrer"
        />
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-end pb-20">
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="font-sans text-5xl font-light text-white mb-8 leading-tight"
        >
          Time<br />
          <span className="font-bold">Redefined</span>
        </motion.h1>
        
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          onClick={onStart}
          className="w-full py-4 bg-white text-[#001F3F] font-bold rounded-xl shadow-lg hover:bg-gray-100 transition-all"
        >
          GET STARTED
        </motion.button>
        
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          onClick={onChauffeurStart}
          className="w-full py-4 mt-4 text-white font-medium text-sm uppercase tracking-widest hover:text-gray-300 transition-colors"
        >
          Chauffeur Login
        </motion.button>
      </div>
    </motion.div>
  );
}
