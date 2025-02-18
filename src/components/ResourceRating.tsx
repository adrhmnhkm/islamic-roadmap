import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Rating {
  resourceId: string;
  rating: number;
  feedback?: string;
  timestamp: number;
}

interface ResourceRatingProps {
  resourceId: string;
  resourceTitle: string;
}

const ResourceRating: React.FC<ResourceRatingProps> = ({ resourceId, resourceTitle }) => {
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Load existing rating from localStorage
    const ratings = JSON.parse(localStorage.getItem('resourceRatings') || '{}');
    if (ratings[resourceId]) {
      setRating(ratings[resourceId].rating);
      setFeedback(ratings[resourceId].feedback || '');
      setSubmitted(true);
    }
  }, [resourceId]);

  const handleRatingClick = (value: number) => {
    setRating(value);
    setShowFeedbackForm(true);
  };

  const handleSubmit = () => {
    const ratings = JSON.parse(localStorage.getItem('resourceRatings') || '{}');
    
    // Save the new rating
    ratings[resourceId] = {
      resourceId,
      rating,
      feedback,
      timestamp: Date.now()
    };

    localStorage.setItem('resourceRatings', JSON.stringify(ratings));
    setSubmitted(true);
    setShowFeedbackForm(false);
  };

  const handleEdit = () => {
    setSubmitted(false);
    setShowFeedbackForm(true);
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      {!submitted ? (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-600">Beri rating:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <motion.button
                  key={value}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleRatingClick(value)}
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(null)}
                  className="focus:outline-none"
                >
                  <span className="text-2xl">
                    {value <= (hoveredRating || rating || 0) ? '⭐' : '☆'}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {showFeedbackForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Berikan feedback Anda (opsional)"
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm resize-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  rows={3}
                />
                <button
                  onClick={handleSubmit}
                  className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors"
                >
                  Kirim Rating
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Rating Anda:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <span key={value} className="text-2xl">
                    {value <= (rating || 0) ? '⭐' : '☆'}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={handleEdit}
              className="text-emerald-600 hover:text-emerald-700 text-sm"
            >
              Edit
            </button>
          </div>
          {feedback && (
            <div className="mt-2 p-2 bg-white rounded-lg border border-gray-100">
              <p className="text-sm text-gray-600">{feedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResourceRating;