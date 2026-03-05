import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Send } from 'lucide-react';

interface SuggestionsScreenProps {
  onBack: () => void;
}

export default function SuggestionsScreen({ onBack }: SuggestionsScreenProps) {
  const [suggestion, setSuggestion] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the suggestion to your backend
    console.log('Suggestion submitted:', suggestion);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSuggestion('');
    }, 3000);
  };

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="h-full w-full bg-white text-[#001F3F] flex flex-col"
    >
      <div className="flex items-center px-6 py-4 border-b border-gray-100 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 text-[#001F3F] hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="ml-4 text-lg font-semibold">Suggestions & Recommendations</h2>
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto">
        {submitted ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full flex flex-col items-center justify-center text-center p-6"
          >
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <Send size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Thank you!</h3>
            <p className="text-gray-500">Your feedback helps us improve Urbont.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-gray-600">We'd love to hear your thoughts on how we can improve your Urbont experience.</p>
            <textarea
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder="Tell us what you think..."
              className="w-full h-40 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#001F3F] focus:border-transparent outline-none transition-all"
              required
            />
            <button 
              type="submit"
              className="w-full py-4 bg-[#001F3F] text-white font-bold rounded-xl shadow-lg hover:bg-[#001F3F]/90 transition-all"
            >
              Submit Feedback
            </button>
          </form>
        )}
      </div>
    </motion.div>
  );
}
