import { OrbitControls, Grid, Sky } from '@react-three/drei';
import { useAppStore } from '../hooks/useAppStore';
import { Terrain } from './Terrain';
import { PlacedObjects } from './PlacedObjects';
import { FirstPersonControls } from './FirstPersonControls';

export function Scene() {
  const viewMode = useAppStore((state) => state.viewMode);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[50, 50, 25]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      <hemisphereLight intensity={0.3} />

      {/* Sky */}
      <Sky sunPosition={[100, 20, 100]} />

      {/* Ground Grid (for reference) */}
      <Grid
        args={[100, 100]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#6f6f6f"
        sectionSize={10}
        sectionThickness={1}
        sectionColor="#9d4b4b"
        fadeDistance={100}
        fadeStrength={1}
        position={[0, -0.01, 0]}
      />

      {/* Terrain */}
      <Terrain />

      {/* Placed Objects */}
      <PlacedObjects />

      {/* Camera Controls */}
      {viewMode === 'aerial' ? (
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={10}
          maxDistance={200}
          maxPolarAngle={Math.PI / 2.1}
        />
      ) : (
        <FirstPersonControls />
      )}
    </>
  );
}
