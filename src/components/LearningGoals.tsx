import React, { useState, useEffect } from 'react';
import { useUserProgressStore } from '../store/userProgressStore';
import { useAuthStore } from '../store/authStore';

interface LearningGoalsProps {
  topicId: string;
  topicTitle: string;
  totalResources: number;
}

export const LearningGoals: React.FC<LearningGoalsProps> = ({
  topicId,
  topicTitle,
  totalResources
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const userProgressStore = useUserProgressStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempGoal, setTempGoal] = useState({
    targetCompletionDate: '',
    weeklyTarget: 3,
    personalNotes: ''
  });

  const currentUser = user || { id: 'demo-user', email: 'demo@example.com', name: 'Demo User' };
  const existingGoal = userProgressStore.getTopicGoal(currentUser.id, topicId);
  
  // Calculate progress stats
  const totalResourcesByLevel = { basic: 0, intermediate: 0, advanced: 0 }; // Will be properly calculated
  const topicStats = userProgressStore.getTopicStats(currentUser.id, topicId, totalResourcesByLevel);

  useEffect(() => {
    if (existingGoal) {
      setTempGoal({
        targetCompletionDate: existingGoal.targetCompletionDate || '',
        weeklyTarget: existingGoal.weeklyTarget || 3,
        personalNotes: existingGoal.personalNotes || ''
      });
    }
  }, [existingGoal]);

  const handleSaveGoal = () => {
    userProgressStore.setTopicGoal(currentUser.id, topicId, {
      targetCompletionDate: tempGoal.targetCompletionDate || undefined,
      weeklyTarget: tempGoal.weeklyTarget,
      personalNotes: tempGoal.personalNotes || undefined
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (existingGoal) {
      setTempGoal({
        targetCompletionDate: existingGoal.targetCompletionDate || '',
        weeklyTarget: existingGoal.weeklyTarget || 3,
        personalNotes: existingGoal.personalNotes || ''
      });
    }
    setIsEditing(false);
  };

  // Calculate estimated completion based on current pace
  const calculateEstimatedCompletion = () => {
    const remainingResources = totalResources - topicStats.completedResources;
    const weeklyTarget = tempGoal.weeklyTarget || 3;
    const weeksNeeded = Math.ceil(remainingResources / weeklyTarget);
    
    const today = new Date();
    const estimatedDate = new Date(today.getTime() + (weeksNeeded * 7 * 24 * 60 * 60 * 1000));
    return estimatedDate.toISOString().split('T')[0];
  };

  // Calculate progress toward weekly target
  const calculateWeeklyProgress = () => {
    if (!existingGoal?.weeklyTarget) return { completed: 0, target: 0, percentage: 0 };
    
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);
    
    const topicProgress = userProgressStore.getTopicProgress(currentUser.id, topicId);
    const thisWeekCompleted = topicProgress.filter(progress => 
      progress.status === 'completed' && 
      progress.completedAt && 
      new Date(progress.completedAt) >= startOfWeek
    ).length;

    const percentage = Math.round((thisWeekCompleted / existingGoal.weeklyTarget) * 100);
    
    return {
      completed: thisWeekCompleted,
      target: existingGoal.weeklyTarget,
      percentage: Math.min(percentage, 100)
    };
  };

  const weeklyProgress = calculateWeeklyProgress();
  const estimatedCompletion = calculateEstimatedCompletion();

  // Check if target deadline is achievable
  const isDeadlineRealistic = () => {
    if (!tempGoal.targetCompletionDate) return true;
    
    const targetDate = new Date(tempGoal.targetCompletionDate);
    const estimatedDate = new Date(estimatedCompletion);
    
    return targetDate >= estimatedDate;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 flex items-center mb-2">
            <span className="mr-3 text-2xl">🎯</span>
            Target Pembelajaran
          </h3>
          <p className="text-sm text-gray-600">
            Atur target dan deadline untuk {topicTitle}
          </p>
        </div>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium ml-4"
          >
            {existingGoal ? 'Edit Target' : 'Set Target'}
          </button>
        ) : (
          <div className="flex gap-2 ml-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Batal
            </button>
            <button
              onClick={handleSaveGoal}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              Simpan
            </button>
          </div>
        )}
      </div>

      {/* Current Goals Display */}
      {!isEditing && existingGoal && (
        <div className="space-y-4">
          {/* Weekly Progress */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">📊 Progress Minggu Ini</h4>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                {weeklyProgress.completed} dari {weeklyProgress.target} resource
              </span>
              <span className="text-sm font-medium text-blue-600">
                {weeklyProgress.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${weeklyProgress.percentage}%` }}
              />
            </div>
            {weeklyProgress.percentage >= 100 && (
              <p className="text-sm text-green-600 mt-2">🎉 Target minggu ini tercapai!</p>
            )}
          </div>

          {/* Target Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {existingGoal.targetCompletionDate && (
              <div className="border rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-1">📅 Target Selesai</h5>
                <p className="text-lg text-gray-800">
                  {new Date(existingGoal.targetCompletionDate).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Estimasi: {new Date(estimatedCompletion).toLocaleDateString('id-ID')}
                  {!isDeadlineRealistic() && (
                    <span className="text-red-500 ml-2">⚠️ Mungkin terlalu ambisius</span>
                  )}
                </p>
              </div>
            )}
            
            <div className="border rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-1">⚡ Target Mingguan</h5>
              <p className="text-lg text-gray-800">{existingGoal.weeklyTarget} resource/minggu</p>
              <p className="text-sm text-gray-500 mt-1">
                Sisa: {totalResources - topicStats.completedResources} resource
              </p>
            </div>
          </div>

          {/* Personal Notes */}
          {existingGoal.personalNotes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">📝 Catatan Personal</h5>
              <p className="text-gray-700">{existingGoal.personalNotes}</p>
            </div>
          )}
        </div>
      )}

      {/* Editing Form */}
      {isEditing && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Target Completion Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 Target Tanggal Selesai (Opsional)
              </label>
              <input
                type="date"
                value={tempGoal.targetCompletionDate}
                onChange={(e) => setTempGoal(prev => ({ ...prev, targetCompletionDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {tempGoal.targetCompletionDate && !isDeadlineRealistic() && (
                <p className="text-sm text-red-500 mt-1">
                  ⚠️ Dengan target mingguan saat ini, estimasi selesai: {new Date(estimatedCompletion).toLocaleDateString('id-ID')}
                </p>
              )}
            </div>

            {/* Weekly Target */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ⚡ Target Mingguan (Resource per minggu)
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={tempGoal.weeklyTarget}
                onChange={(e) => setTempGoal(prev => ({ ...prev, weeklyTarget: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Estimasi selesai: {new Date(estimatedCompletion).toLocaleDateString('id-ID')}
              </p>
            </div>
          </div>

          {/* Personal Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📝 Catatan Personal (Opsional)
            </label>
            <textarea
              value={tempGoal.personalNotes}
              onChange={(e) => setTempGoal(prev => ({ ...prev, personalNotes: e.target.value }))}
              placeholder="Tulis motivasi, alasan, atau catatan khusus untuk topik ini..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Helper Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-blue-900 mb-2">💡 Tips Setting Target:</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Mulai dengan target realistis (2-3 resource per minggu)</li>
              <li>• Sesuaikan dengan jadwal dan komitmen Anda</li>
              <li>• Target dapat diubah kapan saja sesuai perkembangan</li>
              <li>• Konsistensi lebih penting daripada kecepatan</li>
            </ul>
          </div>
        </div>
      )}

      {/* No Goal Set State */}
      {!isEditing && !existingGoal && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎯</span>
          </div>
          <h4 className="text-xl font-bold text-gray-900 mb-3">Belum Ada Target</h4>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            Set target pembelajaran untuk meningkatkan motivasi dan konsistensi belajar
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Set Target Sekarang
          </button>
        </div>
      )}
    </div>
  );
}; 