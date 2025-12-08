import { useState } from 'react';
import { MenuPanel } from './components/MenuPanel';
import { ViewerPanel } from './components/ViewerPanel';
import { CesiumViewerSimple } from './components/CesiumViewerSimple';
import { AdminPanel } from './components/AdminPanel';
import { Settings } from 'lucide-react';

function App() {
  const [viewerType, setViewerType] = useState<'r3f' | 'cesium'>('cesium');
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-900 overflow-hidden">
      {/* Top Toggle Bar */}
      <div className="flex items-center justify-between gap-4 p-4 bg-gray-800 border-b-2 border-gray-600">
        <div className="flex items-center gap-4">
          <span className="text-white font-bold text-base">View Mode:</span>
          <div className="flex gap-3">
            <button
              onClick={() => setViewerType('r3f')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg ${
                viewerType === 'r3f'
                  ? 'bg-purple-600 text-white scale-105'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              📦 Lot View (R3F)
            </button>
            <button
              onClick={() => setViewerType('cesium')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg ${
                viewerType === 'cesium'
                  ? 'bg-green-600 text-white scale-105'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🌍 Aerial View (Cesium)
            </button>
          </div>
        </div>

        {/* Admin Button */}
        <button
          onClick={() => setShowAdmin(true)}
          className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-bold shadow-lg flex items-center gap-2"
        >
          <Settings size={18} />
          Admin
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {viewerType === 'r3f' ? (
          <>
            {/* Menu Panel - 30% */}
            <div className="w-[30%] h-full border-r border-gray-700">
              <MenuPanel />
            </div>

            {/* Viewer Panel - 70% */}
            <div className="w-[70%] h-full">
              <ViewerPanel />
            </div>
          </>
        ) : (
          /* Cesium Viewer - Full Width */
          <div className="w-full h-full">
            <CesiumViewerSimple
              onSwitchToLotView={() => setViewerType('r3f')}
            />
          </div>
        )}
      </div>

      {/* Admin Panel Modal */}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </div>
  );
}

export default App;
