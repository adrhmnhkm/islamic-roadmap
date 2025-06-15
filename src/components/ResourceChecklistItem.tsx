import React, { useState, useEffect } from 'react';
import { useUserProgressStore } from '../store/userProgressStore';
import { useAuthStore } from '../stores/authStore';

interface ResourceChecklistItemProps {
  topicId: string;
  resourceId: string;
  resourceTitle: string;
  resourceType: 'video' | 'article' | 'book';
  resourceDescription: string;
  resourceUrl: string;
  level: 'basic' | 'intermediate' | 'advanced';
}

export const ResourceChecklistItem: React.FC<ResourceChecklistItemProps> = ({
  topicId,
  resourceId,
  resourceTitle,
  resourceType,
  resourceDescription,
  resourceUrl,
  level
}) => {
  // ALL HOOKS MUST BE AT THE TOP - NO CONDITIONAL LOGIC BEFORE HOOKS
  const authStore = useAuthStore();
  const userProgressStore = useUserProgressStore();
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState<number | undefined>();
  const [isHydrated, setIsHydrated] = useState(false);

  // Create a demo user if not authenticated for demo purposes
  const demoUser = { id: 'demo-user', email: 'demo@example.com', name: 'Demo User' };
  const currentUser = authStore.isAuthenticated && authStore.user ? authStore.user : demoUser;

  const progress = userProgressStore.getUserResourceProgress(currentUser.id, topicId, resourceId);
  const currentStatus = progress?.status || 'not_started';
  const currentNotes = progress?.notes || '';
  const currentRating = progress?.rating;

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Initialize local state with current values
  useEffect(() => {
    setNotes(currentNotes);
    setRating(currentRating);
  }, [currentNotes, currentRating]);

  // NOW WE CAN HAVE CONDITIONAL RENDERING AFTER ALL HOOKS
  if (!isHydrated) {
    return (
      <div className="border-2 rounded-lg p-4 bg-gray-50 border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const handleStatusChange = (newStatus: 'not_started' | 'in_progress' | 'completed') => {
    userProgressStore.markResourceProgress(
      currentUser.id,
      topicId,
      resourceId,
      resourceTitle,
      resourceType,
      level,
      newStatus,
      notes || undefined,
      rating
    );
  };

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);
    userProgressStore.markResourceProgress(
      currentUser.id,
      topicId,
      resourceId,
      resourceTitle,
      resourceType,
      level,
      currentStatus,
      newNotes || undefined,
      rating
    );
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    userProgressStore.markResourceProgress(
      currentUser.id,
      topicId,
      resourceId,
      resourceTitle,
      resourceType,
      level,
      currentStatus,
      notes || undefined,
      newRating
    );
  };

  const getStatusIcon = () => {
    switch (currentStatus) {
      case 'completed':
        return '✅';
      case 'in_progress':
        return '⏳';
      default:
        return '⬜';
    }
  };

  const getStatusColor = () => {
    switch (currentStatus) {
      case 'completed':
        return 'border-green-500 bg-green-50';
      case 'in_progress':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const getLevelColor = () => {
    switch (level) {
      case 'basic':
        return 'bg-emerald-100 text-emerald-700';
      case 'intermediate':
        return 'bg-blue-100 text-blue-700';
      case 'advanced':
        return 'bg-purple-100 text-purple-700';
    }
  };

  const getResourceTypeIcon = () => {
    switch (resourceType) {
      case 'video':
        return '🎥';
      case 'article':
        return '📄';
      case 'book':
        return '📚';
    }
  };

  return (
    <div className={`border-2 rounded-lg p-4 transition-all duration-200 ${getStatusColor()}`}>
      <div className="flex items-start gap-4">
        {/* Status Checkbox */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={() => handleStatusChange(currentStatus === 'completed' ? 'not_started' : 'completed')}
            className="text-2xl hover:scale-110 transition-transform"
            title={currentStatus === 'completed' ? 'Mark as not started' : 'Mark as completed'}
          >
            {getStatusIcon()}
          </button>
          {currentStatus !== 'completed' && (
            <button
              onClick={() => handleStatusChange('in_progress')}
              className="text-sm text-yellow-600 hover:text-yellow-700"
              title="Mark as in progress"
            >
              ⏳
            </button>
          )}
        </div>

        {/* Resource Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getResourceTypeIcon()}</span>
              <h4 className="font-semibold text-gray-900">{resourceTitle}</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor()}`}>
                {level}
              </span>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <a
                href={resourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
              >
                Buka
              </a>
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
              >
                {showNotes ? 'Tutup' : 'Catatan'}
              </button>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-3">{resourceDescription}</p>

          {/* Completion Info */}
          {progress?.completedAt && (
            <p className="text-xs text-green-600 mb-2">
              ✅ Selesai pada {new Date(progress.completedAt).toLocaleDateString('id-ID')}
            </p>
          )}

          {/* Rating */}
          {currentStatus === 'completed' && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-600">Rating:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRatingChange(star)}
                    className={`text-lg ${
                      (rating || 0) >= star ? 'text-yellow-500' : 'text-gray-300'
                    } hover:text-yellow-400 transition-colors`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes Section */}
          {showNotes && (
            <div className="mt-3 p-3 bg-gray-50 rounded border">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan Personal:
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={(e) => handleNotesChange(e.target.value)}
                placeholder="Tambahkan catatan tentang resource ini..."
                className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
                rows={3}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 