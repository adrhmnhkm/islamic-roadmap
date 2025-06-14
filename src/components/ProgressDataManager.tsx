import React, { useState, useRef } from 'react';
import { useUserProgressStore, type ExportData } from '../store/userProgressStore';
import { useAuthStore } from '../store/authStore';

interface ProgressDataManagerProps {
  topicId?: string;
  topicTitle?: string;
}

export const ProgressDataManager: React.FC<ProgressDataManagerProps> = ({ 
  topicId, 
  topicTitle 
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const userProgressStore = useUserProgressStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importResult, setImportResult] = useState<string>('');
  const [showClearModal, setShowClearModal] = useState(false);

  // Support demo mode - allow functionality even when not authenticated
  const currentUser = user || { id: 'demo-user', email: 'demo@example.com', name: 'Demo User' };
  const isDemo = !isAuthenticated || !user;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exportData = userProgressStore.exportUserData(currentUser.id, { 
        topicId,
        format: 'json' 
      });

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      
      const filename = topicId 
        ? `islamic-roadmap-${topicId}-progress-${new Date().toISOString().split('T')[0]}.json`
        : `islamic-roadmap-all-progress-${new Date().toISOString().split('T')[0]}.json`;
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setImportResult(`✅ Data berhasil diekspor! File: ${filename}`);
    } catch (error) {
      setImportResult(`❌ Error saat ekspor: ${error}`);
    }
    setIsExporting(false);
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        const result = userProgressStore.importUserData(jsonData, { 
          merge: true, 
          userId: currentUser.id 
        });
        
        if (result.success) {
          setImportResult(`✅ ${result.message}. ${result.imported} items berhasil diimpor.`);
        } else {
          setImportResult(`❌ ${result.message}`);
        }
      } catch (error) {
        setImportResult(`❌ Error membaca file: Invalid JSON format`);
      }
      setIsImporting(false);
      setShowImportModal(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    
    reader.readAsText(file);
  };

  const handleClearData = () => {
    userProgressStore.clearUserData(currentUser.id, topicId);
    setImportResult(`✅ Data ${topicId ? `topik ${topicTitle}` : 'semua progress'} berhasil dihapus`);
    setShowClearModal(false);
  };

  const stats = userProgressStore.getUserOverallStats(currentUser.id);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
      {/* Demo Mode Indicator */}
      {isDemo && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-blue-600 text-sm">ℹ️</span>
            </div>
            <div>
              <p className="text-sm text-blue-800">
                <strong>Mode Demo:</strong> Data tersimpan sementara di browser. 
                <a href="/login" className="underline ml-1 hover:text-blue-900">Login</a> untuk penyimpanan permanen.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 flex items-center mb-2">
            <span className="mr-3 text-2xl">💾</span>
            Kelola Data Progress
          </h3>
          <p className="text-sm text-gray-600">
            Export, import, atau reset data pembelajaran Anda
          </p>
        </div>
        <div className="text-right ml-4">
          <div className="text-2xl font-bold text-blue-600">{stats.totalResourcesCompleted}</div>
          <div className="text-xs text-gray-500">Completed</div>
          <div className="text-xs text-gray-500 mt-1">{stats.activeTopics} Active Topics</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 mb-6">
        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          <span className="mr-2 text-lg">📥</span>
          {isExporting ? 'Mengekspor...' : `Export ${topicTitle || 'Semua Data'}`}
        </button>

        <div className="grid grid-cols-2 gap-3">
          {/* Import Button */}
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            <span className="mr-2">📤</span>
            Import
          </button>

          {/* Clear Button */}
          <button
            onClick={() => setShowClearModal(true)}
            className="flex items-center justify-center px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
          >
            <span className="mr-2">🗑️</span>
            Reset
          </button>
        </div>
      </div>

      {/* Result Message */}
      {importResult && (
        <div className={`p-4 rounded-lg mb-6 ${
          importResult.startsWith('✅') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-start">
            <span className="mr-2 mt-0.5">{importResult.startsWith('✅') ? '✅' : '❌'}</span>
            <p className="text-sm">{importResult.replace('✅ ', '').replace('❌ ', '')}</p>
          </div>
        </div>
      )}

      {/* Usage Instructions */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <span className="mr-2">💡</span>
          Cara Penggunaan
        </h4>
        <div className="space-y-2">
          <div className="flex items-start">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <p className="text-sm text-gray-600"><strong>Export:</strong> Download progress sebagai file JSON untuk backup</p>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <p className="text-sm text-gray-600"><strong>Import:</strong> Upload file JSON untuk restore atau migrasi data</p>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <p className="text-sm text-gray-600"><strong>Reset:</strong> Hapus semua progress {topicId ? 'topik ini' : 'Anda'} (tidak dapat dibatalkan)</p>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Data Progress</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih file JSON untuk diimpor:
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                disabled={isImporting}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Perhatian:</strong> Data yang diimpor akan digabung dengan progress yang sudah ada. 
                Jika ada konflik, data yang diimpor akan menimpa data lama.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Batal
              </button>
            </div>

            {isImporting && (
              <div className="mt-4 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <p className="text-sm text-gray-600 mt-2">Mengimpor data...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-red-900 mb-4">⚠️ Konfirmasi Reset Data</h3>
            
            <p className="text-gray-700 mb-4">
              Apakah Anda yakin ingin menghapus semua progress {topicId ? `untuk topik "${topicTitle}"` : 'pembelajaran Anda'}?
            </p>

            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <p className="text-sm text-red-800">
                <strong>Peringatan:</strong> Tindakan ini tidak dapat dibatalkan. 
                Pastikan Anda sudah melakukan export jika ingin menyimpan data.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleClearData}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 