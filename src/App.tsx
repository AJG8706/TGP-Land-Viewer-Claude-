import { useState } from 'react';
import { MenuPanel } from './components/MenuPanel';
import { ViewerPanel } from './components/ViewerPanel';
import { CesiumViewer } from './components/CesiumViewer';

function App() {
  const [viewerType, setViewerType] = useState<'r3f' | 'cesium'>('cesium');

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-900 overflow-hidden">
      {/* Top Toggle Bar */}
      <div className="flex items-center justify-center gap-4 p-4 bg-gray-800 border-b-2 border-gray-600">
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
            <CesiumViewer onSwitchToR3F={() => setViewerType('r3f')} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
