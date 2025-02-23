import React, { useState, useEffect } from 'react';
import ShareProgress from './ShareProgress';

interface Topic {
  id: string;
  title: string;
  totalLessons: number;
}

const ProgressTracker: React.FC<{ topic: Topic }> = ({ topic }) => {
  const [completedLessons, setCompletedLessons] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(`progress-${topic.id}`);
    if (saved) {
      setCompletedLessons(parseInt(saved));
    }
  }, [topic.id]);

  const updateProgress = (completed: number) => {
    setCompletedLessons(completed);
    localStorage.setItem(`progress-${topic.id}`, completed.toString());
  };

  const progress = Math.round((completedLessons / topic.totalLessons) * 100);

  return (
    <div className="mt-4">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Progress</span>
        <span className="text-sm font-medium text-gray-700">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-accent h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="number"
          min="0"
          max={topic.totalLessons}
          value={completedLessons}
          onChange={(e) => updateProgress(parseInt(e.target.value))}
          className="w-16 px-2 py-1 border rounded"
        />
        <span className="text-sm text-gray-600">
          of {topic.totalLessons} lessons completed
        </span>
      </div>

      {/* Add ShareProgress component */}
      <ShareProgress 
        topicId={topic.id}
        topicTitle={topic.title}
        progress={progress}
      />
    </div>
  );
};

export default ProgressTracker;