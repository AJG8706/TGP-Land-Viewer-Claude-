import { Canvas } from '@react-three/fiber';
import { useAppStore } from '../hooks/useAppStore';
import { Scene } from './Scene';
import { Stats } from '@react-three/drei';

export function ViewerPanel() {
  const viewMode = useAppStore((state) => state.viewMode);

  return (
    <div className="relative w-full h-full bg-gray-950">
      {/* View Mode Indicator */}
      <div className="absolute top-4 left-4 z-10 bg-black/70 text-white px-4 py-2 rounded-lg text-sm font-medium">
        {viewMode === 'aerial' ? 'Aerial View' : 'First Person View'}
      </div>

      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 50, 50], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
      >
        <Scene />
        <Stats />
      </Canvas>

      {/* Controls Info */}
      <div className="absolute bottom-4 left-4 z-10 bg-black/70 text-white p-3 rounded-lg text-xs space-y-1">
        {viewMode === 'aerial' ? (
          <>
            <div>
              <strong>Mouse:</strong> Orbit camera
            </div>
            <div>
              <strong>Scroll:</strong> Zoom in/out
            </div>
            <div>
              <strong>Drag & Drop:</strong> Place objects
            </div>
            <div>
              <strong>Click Object:</strong> Select/Transform
            </div>
          </>
        ) : (
          <>
            <div>
              <strong>W/A/S/D:</strong> Move
            </div>
            <div>
              <strong>Mouse:</strong> Look around
            </div>
            <div>
              <strong>Space:</strong> Jump
            </div>
            <div>
              <strong>Shift:</strong> Run
            </div>
          </>
        )}
      </div>
    </div>
  );
}
