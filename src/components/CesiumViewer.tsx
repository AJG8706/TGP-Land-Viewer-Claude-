import { useRef, useState, useEffect } from 'react';
import {
  Viewer,
  Entity,
} from 'resium';
import {
  Cartesian3,
  Cartographic,
  Color,
  Ion,
  Math as CesiumMath,
} from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import type { Viewer as CesiumViewerType } from 'cesium';

// Cesium Ion access token for imagery and terrain
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyMTJhYTk4MC03NWY3LTRkOWQtYjE3NS04NDEyYWM4NTE0MDgiLCJpZCI6MzY3NzgxLCJpYXQiOjE3NjUyMjUzODF9.2iaopscVk321BPc3HkHexuZdXj0X2jWifY7do4bzJ_I';

export function CesiumViewer() {
  const viewerRef = useRef<CesiumViewerType | null>(null);
  const [terrainEnabled, setTerrainEnabled] = useState(false);
  const [cameraMode, setCameraMode] = useState<'aerial' | 'firstPerson'>('aerial');
  const [kmlDataSource, setKmlDataSource] = useState<any>(null);

  // Set initial camera view when viewer loads
  useEffect(() => {
    if (viewerRef.current) {
      // Set camera to Texas view - Earth should be visible by default
      viewerRef.current.camera.setView({
        destination: Cartesian3.fromDegrees(-99.9018, 31.9686, 10000000),
        orientation: {
          heading: 0.0,
          pitch: CesiumMath.toRadians(-90),
          roll: 0.0,
        },
      });
    }
  }, []);

  // Sample 3D entities (replace with your actual structures)
  const [entities, setEntities] = useState<Array<{
    id: string;
    position: Cartesian3;
    name: string;
  }>>([]);

  useEffect(() => {
    if (viewerRef.current && terrainEnabled) {
      // Terrain requires Cesium Ion, so we'll skip this for now
      // You can enable this later with your own Cesium Ion token
      console.log('World terrain disabled - requires Cesium Ion token');
    }
  }, [terrainEnabled]);

  useEffect(() => {
    if (!viewerRef.current) return;

    const viewer = viewerRef.current;
    const scene = viewer.scene;
    const camera = viewer.camera;

    if (cameraMode === 'firstPerson') {
      // First-person controls
      scene.screenSpaceCameraController.enableRotate = true;
      scene.screenSpaceCameraController.enableTranslate = true;
      scene.screenSpaceCameraController.enableZoom = true;
      scene.screenSpaceCameraController.enableTilt = true;
      scene.screenSpaceCameraController.enableLook = true;

      // Set camera to ground level
      const currentPos = camera.positionCartographic;
      camera.position = Cartesian3.fromRadians(
        currentPos.longitude,
        currentPos.latitude,
        currentPos.height < 100 ? 100 : currentPos.height
      );

      // Look straight ahead
      camera.setView({
        orientation: {
          heading: camera.heading,
          pitch: CesiumMath.toRadians(-10),
          roll: 0.0,
        },
      });
    } else {
      // Aerial view controls
      scene.screenSpaceCameraController.enableRotate = true;
      scene.screenSpaceCameraController.enableTranslate = true;
      scene.screenSpaceCameraController.enableZoom = true;
      scene.screenSpaceCameraController.enableTilt = true;
      scene.screenSpaceCameraController.enableLook = false;
    }
  }, [cameraMode]);

  const handleKMLUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !viewerRef.current) return;

    try {
      // Load KML/KMZ file using Cesium's native loader
      const { KmlDataSource } = await import('cesium');
      const dataSource = await KmlDataSource.load(file, {
        camera: viewerRef.current.camera,
        canvas: viewerRef.current.canvas,
        clampToGround: true,
      });

      // Remove previous data source if exists
      if (kmlDataSource) {
        viewerRef.current.dataSources.remove(kmlDataSource);
      }

      // Add new data source
      await viewerRef.current.dataSources.add(dataSource);
      setKmlDataSource(dataSource);

      // Fly to the loaded data
      await viewerRef.current.flyTo(dataSource);

      console.log('KML/KMZ loaded successfully');
    } catch (error) {
      console.error('KML load error:', error);
      alert(`Failed to load KML/KMZ file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleAddStructure = () => {
    if (!viewerRef.current) return;

    const camera = viewerRef.current.camera;
    const cartographic = Cartographic.fromCartesian(camera.position);

    // Place structure 100m in front of camera
    const newPos = Cartesian3.fromRadians(
      cartographic.longitude,
      cartographic.latitude - 0.001, // ~100m south
      0
    );

    setEntities([
      ...entities,
      {
        id: `structure-${entities.length}`,
        position: newPos,
        name: `Structure ${entities.length + 1}`,
      },
    ]);
  };

  return (
    <div className="relative w-full h-full">
      {/* Cesium Viewer */}
      <Viewer
        ref={(e) => {
          if (e && e.cesiumElement) {
            viewerRef.current = e.cesiumElement;
          }
        }}
        full
        timeline={false}
        animation={false}
        baseLayerPicker={false}
        geocoder={false}
        homeButton={true}
        infoBox={true}
        sceneModePicker={true}
        selectionIndicator={true}
        navigationHelpButton={true}
        navigationInstructionsInitiallyVisible={false}
      >
        {/* Sample 3D entities (structures) */}
        {entities.map((entity) => (
          <Entity
            key={entity.id}
            name={entity.name}
            position={entity.position}
            box={{
              dimensions: new Cartesian3(20, 20, 10),
              material: Color.BLUE.withAlpha(0.7),
              outline: true,
              outlineColor: Color.BLACK,
            }}
          />
        ))}
      </Viewer>

      {/* Control Panel Overlay */}
      <div className="absolute top-4 left-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg space-y-4 max-w-xs z-10">
        <h2 className="text-lg font-bold">Cesium POC Controls</h2>

        {/* Camera Mode Toggle */}
        <div>
          <label className="block text-sm font-semibold mb-2">Camera Mode</label>
          <div className="flex gap-2">
            <button
              onClick={() => setCameraMode('aerial')}
              className={`flex-1 py-2 px-3 rounded text-sm ${
                cameraMode === 'aerial'
                  ? 'bg-blue-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Aerial
            </button>
            <button
              onClick={() => setCameraMode('firstPerson')}
              className={`flex-1 py-2 px-3 rounded text-sm ${
                cameraMode === 'firstPerson'
                  ? 'bg-blue-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              First Person
            </button>
          </div>
        </div>

        {/* Terrain Toggle */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={terrainEnabled}
              onChange={(e) => setTerrainEnabled(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">Enable World Terrain</span>
          </label>
        </div>

        {/* KML/KMZ Upload */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Load KML/KMZ File
          </label>
          <input
            type="file"
            accept=".kml,.kmz"
            onChange={handleKMLUpload}
            className="block w-full text-xs text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-green-600 file:text-white
              hover:file:bg-green-700
              file:cursor-pointer cursor-pointer"
          />
          <p className="text-xs text-gray-400 mt-1">
            From Google Maps: Menu → Share → Export to KML → Download file
          </p>
        </div>

        {/* Add Structure */}
        <div>
          <button
            onClick={handleAddStructure}
            className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded text-sm font-medium"
          >
            Add Sample Structure
          </button>
          <p className="text-xs text-gray-400 mt-1">
            Places structure near camera
          </p>
        </div>

        {/* Info */}
        <div className="text-xs text-gray-400 pt-2 border-t border-gray-700">
          <p className="font-semibold mb-1">Controls:</p>
          <ul className="space-y-1">
            <li>• Left Click + Drag: Rotate</li>
            <li>• Right Click + Drag: Pan</li>
            <li>• Scroll: Zoom</li>
            <li>• Middle Click + Drag: Look</li>
          </ul>
        </div>
      </div>

      {/* Instructions Overlay */}
      {!kmlDataSource && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded shadow-lg text-sm">
          Upload a KML/KMZ file from Google Maps to see your property boundaries
        </div>
      )}
    </div>
  );
}
