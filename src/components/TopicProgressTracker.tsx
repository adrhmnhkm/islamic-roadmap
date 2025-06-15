import React, { useState, useEffect } from 'react';
import { useUserProgressStore } from '../store/userProgressStore';
import { useAuthStore } from '../stores/authStore';
import { ResourceChecklistItem } from './ResourceChecklistItem';

interface Resource {
  title: string;
  type: 'video' | 'article' | 'book';
  description: string;
  url: string;
  subResources?: Resource[];
}

interface NodeData {
  id: string;
  label: string;
  description: string;
  level: 'basic' | 'intermediate' | 'advanced';
  resources: Resource[];
}

interface TopicStats {
  topicId: string;
  totalResources: number;
  completedResources: number;
  inProgressResources: number;
  progressPercentage: number;
  basicCompleted: number;
  basicTotal: number;
  intermediateCompleted: number;
  intermediateTotal: number;
  advancedCompleted: number;
  advancedTotal: number;
  lastActivity?: number;
}

interface TopicProgressTrackerProps {
  topicId: string;
  topicTitle: string;
  topicDescription: string;
  nodes: NodeData[];
}

export const TopicProgressTracker: React.FC<TopicProgressTrackerProps> = ({
  topicId,
  topicTitle,
  topicDescription,
  nodes
}) => {
  const authStore = useAuthStore();
  const userProgressStore = useUserProgressStore();
  const [activeLevel, setActiveLevel] = useState<'all' | 'basic' | 'intermediate' | 'advanced'>('all');
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Create a demo user if not authenticated for demo purposes
  const demoUser = { id: 'demo-user', email: 'demo@example.com', name: 'Demo User' };
  const currentUser = authStore.isAuthenticated && authStore.user ? authStore.user : demoUser;
  const isDemo = !authStore.isAuthenticated || !authStore.user;

  // Calculate total resources by level
  const totalResourcesByLevel = {
    basic: 0,
    intermediate: 0,
    advanced: 0
  };

  const allResources: Array<{
    nodeId: string;
    resource: Resource;
    level: 'basic' | 'intermediate' | 'advanced';
  }> = [];

  nodes.forEach(node => {
    node.resources.forEach(resource => {
      totalResourcesByLevel[node.level]++;
      allResources.push({
        nodeId: node.id,
        resource,
        level: node.level
      });

      // Count sub-resources
      if (resource.subResources) {
        resource.subResources.forEach(subResource => {
          totalResourcesByLevel[node.level]++;
          allResources.push({
            nodeId: `${node.id}-sub`,
            resource: subResource,
            level: node.level
          });
        });
      }
    });
  });

  const stats: TopicStats = userProgressStore.getTopicStats(currentUser.id, topicId, totalResourcesByLevel);

  const filteredResources = activeLevel === 'all' 
    ? allResources 
    : allResources.filter(item => item.level === activeLevel);

  const getLevelStats = (level: 'basic' | 'intermediate' | 'advanced') => {
    switch (level) {
      case 'basic':
        return { completed: stats.basicCompleted, total: stats.basicTotal };
      case 'intermediate':
        return { completed: stats.intermediateCompleted, total: stats.intermediateTotal };
      case 'advanced':
        return { completed: stats.advancedCompleted, total: stats.advancedTotal };
    }
  };

  const generateResourceId = (nodeId: string, resourceTitle: string) => {
    return `${nodeId}-${resourceTitle.toLowerCase().replace(/\s+/g, '-')}`;
  };

  return (
    <div className="space-y-6">
      {/* Demo/Auth Status Info */}
      {isDemo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-blue-600 mr-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-800">Mode Demo</h3>
              <p className="text-sm text-blue-700">
                Anda sedang menggunakan mode demo. Progress akan tersimpan sementara. 
                <a href="/login" className="underline ml-1">Login</a> untuk menyimpan progress permanen.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">{topicTitle} - Progress Tracker</h1>
        <p className="text-blue-100">{topicDescription}</p>
      </div>

      {/* Overall Progress */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Progress Keseluruhan</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.progressPercentage}%</div>
            <div className="text-sm text-gray-600">Total Progress</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{stats.completedResources}</div>
            <div className="text-sm text-gray-600">Selesai</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">{stats.inProgressResources}</div>
            <div className="text-sm text-gray-600">Sedang Dipelajari</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-600">{stats.totalResources}</div>
            <div className="text-sm text-gray-600">Total Resources</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${stats.progressPercentage}%` }}
          />
        </div>

        {/* Level Progress */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['basic', 'intermediate', 'advanced'] as const).map((level) => {
            const levelStats = getLevelStats(level);
            const percentage = levelStats.total > 0 ? Math.round((levelStats.completed / levelStats.total) * 100) : 0;
            
            return (
              <div key={level} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    level === 'basic' ? 'bg-emerald-100 text-emerald-700' :
                    level === 'intermediate' ? 'bg-blue-100 text-blue-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {level === 'basic' ? 'Dasar' : level === 'intermediate' ? 'Menengah' : 'Lanjutan'}
                  </span>
                  <span className="text-sm font-medium">{percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      level === 'basic' ? 'bg-emerald-500' :
                      level === 'intermediate' ? 'bg-blue-500' :
                      'bg-purple-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-600">
                  {levelStats.completed}/{levelStats.total} resources
                </div>
              </div>
            );
          })}
        </div>

        {/* Last Activity */}
        {stats.lastActivity && (
          <div className="mt-4 text-sm text-gray-600">
            Aktivitas terakhir: {new Date(stats.lastActivity).toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        )}
      </div>

      {/* Level Filter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">📚 Daftar Resources</h2>
          <div className="flex gap-2">
            {(['all', 'basic', 'intermediate', 'advanced'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setActiveLevel(level)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeLevel === level
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {level === 'all' ? 'Semua' :
                 level === 'basic' ? 'Dasar' :
                 level === 'intermediate' ? 'Menengah' : 'Lanjutan'}
              </button>
            ))}
          </div>
        </div>

        {/* Resource List */}
        <div className="space-y-4">
          {filteredResources.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Tidak ada resources untuk level ini
            </div>
          ) : (
            filteredResources.map((item, index) => (
              <ResourceChecklistItem
                key={`${item.nodeId}-${index}`}
                topicId={topicId}
                resourceId={generateResourceId(item.nodeId, item.resource.title)}
                resourceTitle={item.resource.title}
                resourceType={item.resource.type}
                resourceDescription={item.resource.description}
                resourceUrl={item.resource.url}
                level={item.level}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}; 