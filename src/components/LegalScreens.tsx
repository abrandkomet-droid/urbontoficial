import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';

export function CodeOfEthicsScreen({ onBack }: { onBack: () => void }) {
  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="h-full w-full bg-[#09090B] text-white flex flex-col"
    >
      <div className="flex items-center px-6 py-6 border-b border-white/10 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 text-white/70 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="ml-4 text-lg font-light uppercase tracking-[0.2em] text-white/90">Code of Ethics</h2>
      </div>
      <div className="flex-1 p-8 overflow-y-auto space-y-8">
        <div>
          <h3 className="text-xl font-medium mb-4 text-white">Our Commitment</h3>
          <p className="text-sm text-white/60 leading-relaxed">
            At URBONT, we hold ourselves to the highest standards of professionalism, integrity, and discretion. Our chauffeurs are the face of our brand and are expected to embody these values in every interaction.
          </p>
        </div>
        
        <div className="space-y-6">
          {[
            { title: "Discretion", desc: "We respect the privacy of our passengers above all else." },
            { title: "Punctuality", desc: "Being on time is not an option; it is a requirement." },
            { title: "Professionalism", desc: "We maintain a polished appearance and a courteous demeanor at all times." },
            { title: "Safety", desc: "Your safety is our primary concern. We adhere to all traffic laws and safety protocols." }
          ].map((item, i) => (
            <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5">
              <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
              <p className="text-xs text-white/50">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function TermsOfServiceScreen({ onBack }: { onBack: () => void }) {
  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="h-full w-full bg-[#09090B] text-white flex flex-col"
    >
      <div className="flex items-center px-6 py-6 border-b border-white/10 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 text-white/70 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="ml-4 text-lg font-light uppercase tracking-[0.2em] text-white/90">Terms of Service</h2>
      </div>
      <div className="flex-1 p-8 overflow-y-auto">
        <p className="text-sm text-white/60">Placeholder for Terms of Service content.</p>
      </div>
    </motion.div>
  );
}

export function PrivacyPolicyScreen({ onBack }: { onBack: () => void }) {
  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="h-full w-full bg-[#09090B] text-white flex flex-col"
    >
      <div className="flex items-center px-6 py-6 border-b border-white/10 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 text-white/70 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="ml-4 text-lg font-light uppercase tracking-[0.2em] text-white/90">Privacy Policy</h2>
      </div>
      <div className="flex-1 p-8 overflow-y-auto">
        <p className="text-sm text-white/60">Placeholder for Privacy Policy content.</p>
      </div>
    </motion.div>
  );
}
