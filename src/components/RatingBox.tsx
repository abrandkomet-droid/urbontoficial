import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Heart } from 'lucide-react';

interface RatingBoxProps {
  driverName: string;
  driverImage: string;
  vehicleInfo: string;
  fare: string;
  onSubmit: (rating: number, comment: string, isFavorite: boolean) => void;
  onCancel?: () => void;
}

export default function RatingBox({
  driverName,
  driverImage,
  vehicleInfo,
  fare,
  onSubmit,
  onCancel
}: RatingBoxProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedQuickFeedback, setSelectedQuickFeedback] = useState<string[]>([]);

  const quickFeedbackOptions = [
    'Great Driver',
    'Clean Car',
    'Good Music',
    'Professional',
    'Punctual',
    'Friendly'
  ];

  const toggleQuickFeedback = (option: string) => {
    setSelectedQuickFeedback(prev =>
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    );
  };

  const handleSubmit = () => {
    const fullComment = [
      ...selectedQuickFeedback,
      comment.trim()
    ].filter(Boolean).join(' • ');
    
    onSubmit(rating, fullComment, isFavorite);
  };

  const isComplete = rating > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="w-full bg-white rounded-3xl p-6 shadow-lg border border-gray-100"
    >
      {/* Driver Info Header */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
          <img
            src={driverImage}
            alt={driverName}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-[#001F3F] text-lg">{driverName}</h4>
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Heart
                size={20}
                className={`transition-colors ${
                  isFavorite
                    ? 'fill-red-500 text-red-500'
                    : 'text-gray-300'
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">{vehicleInfo}</p>
        </div>
      </div>

      {/* Rating Section */}
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
          Rate your experience
        </p>
        <div className="flex justify-center gap-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="p-1 transition-transform active:scale-90"
            >
              <Star
                size={40}
                className={`transition-colors ${
                  rating >= star
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-200'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Quick Feedback Buttons */}
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
          Quick feedback
        </p>
        <div className="flex flex-wrap gap-2">
          {quickFeedbackOptions.map((option) => (
            <button
              key={option}
              onClick={() => toggleQuickFeedback(option)}
              className={`px-3 py-2 rounded-full text-xs font-medium transition-all border ${
                selectedQuickFeedback.includes(option)
                  ? 'bg-[#001F3F] text-white border-[#001F3F]'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Comment Textarea */}
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
          Additional comments (optional)
        </p>
        <textarea
          placeholder="Share your thoughts about this ride..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-[#001F3F] transition-colors resize-none h-20"
        />
      </div>

      {/* Fare Summary */}
      <div className="mb-6 pb-6 border-t border-gray-100 pt-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Total Fare</span>
          <span className="text-xl font-bold text-[#001F3F]">{fare}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-gray-100 text-[#001F3F] text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!isComplete}
          className={`flex-1 py-3 text-white text-sm font-bold uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-[0.98] ${
            isComplete
              ? 'bg-[#001F3F] hover:bg-[#001F3F]/90'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          Submit Rating
        </button>
      </div>
    </motion.div>
  );
}
