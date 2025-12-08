import { useState } from 'react';
import { MenuPanel } from './components/MenuPanel';
import { ViewerPanel } from './components/ViewerPanel';
import { CesiumViewer } from './components/CesiumViewer';

function App() {
  const [viewerType, setViewerType] = useState<'r3f' | 'cesium'>('cesium');

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-900 overflow-hidden">
      {/* Top Toggle Bar */}
      <div className="flex items-center justify-center gap-4 p-3 bg-gray-800 border-b border-gray-700">
        <span className="text-white font-semibold text-sm">Viewer Type:</span>
        <div className="flex gap-2">
          <button
            onClick={() => setViewerType('r3f')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              viewerType === 'r3f'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            React Three Fiber (Current)
          </button>
          <button
            onClick={() => setViewerType('cesium')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              viewerType === 'cesium'
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            CesiumJS (POC)
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
