import React, { useState, useEffect, useRef } from 'react';
import { useProgressStore } from '../store/progressStore';

interface StudySessionTrackerProps {
  topicId: string;
  topicTitle: string;
  autoStart?: boolean;
  showTimer?: boolean;
  onSessionEnd?: (duration: number) => void;
}

export const StudySessionTracker: React.FC<StudySessionTrackerProps> = ({
  topicId,
  topicTitle,
  autoStart = false,
  showTimer = true,
  onSessionEnd
}) => {
  const progressStore = useProgressStore();
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Auto-start session if enabled (only run once)
  useEffect(() => {
    if (autoStart && !sessionId) {
      const id = progressStore.startStudySession(topicId);
      setSessionId(id);
      setIsActive(true);
      setTime(0);
      startTimeRef.current = Date.now();
    }
  }, []); // Empty dependency array to run only once

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (sessionId && isActive) {
        // End session on unmount
        progressStore.endStudySession(sessionId, 0);
      }
    };
  }, []); // Empty dependency array

  // Timer effect
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  // Handle page visibility change (pause when tab is not active)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isActive) {
        // Pause timer when tab is hidden
        setIsActive(false);
      } else if (!document.hidden && sessionId && !isActive) {
        // Resume timer when tab becomes visible again
        setIsActive(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive, sessionId]);

  const startSession = () => {
    if (!sessionId) {
      const id = progressStore.startStudySession(topicId);
      setSessionId(id);
      setIsActive(true);
      setTime(0);
      startTimeRef.current = Date.now();
    } else {
      setIsActive(true);
    }
  };

  const pauseSession = () => {
    setIsActive(false);
  };

  const endSession = () => {
    if (sessionId) {
      const duration = Math.floor(time / 60); // Convert to minutes
      progressStore.endStudySession(sessionId, 0); // Progress will be updated elsewhere
      setSessionId(null);
      setIsActive(false);
      setTime(0);
      
      if (onSessionEnd) {
        onSessionEnd(duration);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!showTimer && autoStart) {
    // Silent tracking mode
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          <div>
            <h4 className="font-medium text-gray-900">{topicTitle}</h4>
            <p className="text-sm text-gray-500">
              {isActive ? 'Sesi belajar aktif' : sessionId ? 'Sesi dijeda' : 'Belum memulai'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-2xl font-mono font-bold text-gray-900">
              {formatTime(time)}
            </div>
            <div className="text-xs text-gray-500">
              {time > 0 ? `${Math.floor(time / 60)} menit` : 'Waktu belajar'}
            </div>
          </div>
          
          <div className="flex space-x-2">
            {!sessionId ? (
              <button
                onClick={startSession}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
              >
                ▶️ Mulai
              </button>
            ) : (
              <>
                {isActive ? (
                  <button
                    onClick={pauseSession}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors text-sm font-medium"
                  >
                    ⏸️ Jeda
                  </button>
                ) : (
                  <button
                    onClick={startSession}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
                  >
                    ▶️ Lanjut
                  </button>
                )}
                <button
                  onClick={endSession}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-medium"
                >
                  ⏹️ Selesai
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Study tips */}
      {isActive && time > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>💡 Tip: Istirahat setiap 25-30 menit untuk hasil optimal</span>
            {time >= 1500 && ( // 25 minutes
              <span className="text-orange-500 font-medium animate-pulse">
                ⏰ Waktunya istirahat!
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 