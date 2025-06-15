import React, { useState, useEffect } from 'react';
import { useUserProgressStore } from '../store/userProgressStore';
import { useAuthStore } from '../stores/authStore';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (stats: any) => boolean;
  unlocked?: boolean;
}

interface AchievementTrackerProps {
  topicId?: string;
  topicTitle?: string;
}

export const AchievementTracker: React.FC<AchievementTrackerProps> = ({
  topicId,
  topicTitle
}) => {
  const { user } = useAuthStore();
  const userProgressStore = useUserProgressStore();
  
  const currentUser = user || { id: 'demo-user', email: 'demo@example.com', name: 'Demo User' };
  const overallStats = userProgressStore.getUserOverallStats(currentUser.id);

  // Define achievements
  const achievements: Achievement[] = [
    {
      id: 'first-resource',
      title: 'Langkah Pertama',
      description: 'Selesaikan resource pertama Anda',
      icon: '🎯',
      condition: (stats) => stats.totalResourcesCompleted >= 1
    },
    {
      id: 'consistent-learner',
      title: 'Pembelajar Konsisten',
      description: 'Selesaikan 5 resource',
      icon: '📚',
      condition: (stats) => stats.totalResourcesCompleted >= 5
    },
    {
      id: 'dedicated-student',
      title: 'Siswa Berdedikasi',
      description: 'Selesaikan 15 resource',
      icon: '🌟',
      condition: (stats) => stats.totalResourcesCompleted >= 15
    },
    {
      id: 'knowledge-seeker',
      title: 'Pencari Ilmu',
      description: 'Selesaikan 30 resource',
      icon: '🎓',
      condition: (stats) => stats.totalResourcesCompleted >= 30
    },
    {
      id: 'topic-explorer',
      title: 'Penjelajah Topik',
      description: 'Aktif dalam 3 topik berbeda',
      icon: '🗺️',
      condition: (stats) => stats.activeTopics >= 3
    },
    {
      id: 'streak-starter',
      title: 'Pemula Konsisten',
      description: 'Belajar 2 hari berturut-turut',
      icon: '🔥',
      condition: (stats) => stats.currentStreak >= 2
    }
  ];

  // Check which achievements are unlocked
  const unlockedAchievements = achievements.filter(achievement => 
    achievement.condition(overallStats)
  );

  const lockedAchievements = achievements.filter(achievement => 
    !achievement.condition(overallStats)
  );

  if (achievements.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 flex items-center mb-2">
            <span className="mr-3 text-2xl">🏆</span>
            Pencapaian
          </h3>
          <p className="text-sm text-gray-600">
            {unlockedAchievements.length} dari {achievements.length} pencapaian terbuka
          </p>
        </div>
        <div className="text-right ml-4">
          <div className="text-2xl font-bold text-yellow-600">
            {unlockedAchievements.length}
          </div>
          <div className="text-xs text-gray-500">Trophy</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-700">Progress Pencapaian</span>
          <span className="text-sm font-bold text-blue-600">
            {Math.round((unlockedAchievements.length / achievements.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(unlockedAchievements.length / achievements.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">✨ Pencapaian Terbuka</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {unlockedAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{achievement.icon}</span>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{achievement.title}</h5>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                  </div>
                  <span className="text-yellow-500 text-lg">🏆</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">🔒 Pencapaian Terkunci</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {lockedAchievements.slice(0, 4).map((achievement) => (
              <div
                key={achievement.id}
                className="bg-gray-50 border border-gray-200 rounded-lg p-3 opacity-75"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3 grayscale">{achievement.icon}</span>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-700">{achievement.title}</h5>
                    <p className="text-sm text-gray-500">{achievement.description}</p>
                  </div>
                  <span className="text-gray-400 text-lg">🔒</span>
                </div>
              </div>
            ))}
          </div>
          {lockedAchievements.length > 4 && (
            <p className="text-sm text-gray-500 text-center mt-3">
              +{lockedAchievements.length - 4} pencapaian lainnya
            </p>
          )}
        </div>
      )}

      {/* Motivational Message */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Tips:</strong> Konsistensi adalah kunci! Selesaikan resource secara rutin 
          untuk membuka lebih banyak pencapaian dan membangun kebiasaan belajar yang baik.
        </p>
      </div>
    </div>
  );
}; 