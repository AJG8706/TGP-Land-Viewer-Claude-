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
  SceneMode,
  createWorldTerrainAsync,
} from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import type { Viewer as CesiumViewerType } from 'cesium';
import { Home, Truck, Trees } from 'lucide-react';
import type { ObjectType } from '../types';

// Cesium Ion access token for imagery and terrain
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyMTJhYTk4MC03NWY3LTRkOWQtYjE3NS04NDEyYWM4NTE0MDgiLCJpZCI6MzY3NzgxLCJpYXQiOjE3NjUyMjUzODF9.2iaopscVk321BPc3HkHexuZdXj0X2jWifY7do4bzJ_I';

// Placeable object categories (from MenuPanel)
const objectCategories = [
  {
    name: 'Residential',
    icon: Home,
    items: [
      { type: 'singleWideMobileHome' as ObjectType, label: 'Single Wide Mobile Home' },
      { type: 'doubleWideMobileHome' as ObjectType, label: 'Double Wide Mobile Home' },
      { type: 'singleFamilyHouse1' as ObjectType, label: 'Single Family House - Style 1' },
      { type: 'singleFamilyHouse2' as ObjectType, label: 'Single Family House - Style 2' },
      { type: 'singleFamilyHouse3' as ObjectType, label: 'Single Family House - Style 3' },
    ],
  },
  {
    name: 'Vehicles',
    icon: Truck,
    items: [{ type: 'rv' as ObjectType, label: 'RV / Camper' }],
  },
  {
    name: 'Outdoor',
    icon: Trees,
    items: [
      { type: 'deerBlind' as ObjectType, label: 'Deer Blind' },
      { type: 'bridge' as ObjectType, label: 'Small Bridge' },
    ],
  },
];

export function CesiumViewer() {
  const viewerRef = useRef<CesiumViewerType | null>(null);
  const [terrainEnabled, setTerrainEnabled] = useState(true); // Enable terrain by default
  const [cameraMode, setCameraMode] = useState<'aerial' | 'firstPerson'>('aerial');
  const [kmlDataSource, setKmlDataSource] = useState<any>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Residential');
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  // Set initial camera view when viewer loads - MUCH closer zoom
  useEffect(() => {
    if (viewerRef.current) {
      // Set camera to Austin, Texas area with closer zoom (5000m altitude instead of 10M)
      viewerRef.current.camera.setView({
        destination: Cartesian3.fromDegrees(-97.7431, 30.2672, 5000), // Austin, TX at 5km altitude
        orientation: {
          heading: 0.0,
          pitch: CesiumMath.toRadians(-90), // Looking straight down
          roll: 0.0,
        },
      });

      // Set scene mode to 2D by default for aerial view
      if (viewerRef.current.scene) {
        viewerRef.current.scene.mode = SceneMode.SCENE2D;
      }
    }
  }, []);

  // Sample 3D entities (replace with your actual structures)
  const [entities, setEntities] = useState<Array<{
    id: string;
    position: Cartesian3;
    name: string;
    type: ObjectType;
  }>>([]);

  // Enable/disable terrain
  useEffect(() => {
    const loadTerrain = async () => {
      if (viewerRef.current) {
        if (terrainEnabled) {
          try {
            // Load Cesium World Terrain for topography
            const terrainProvider = await createWorldTerrainAsync();
            viewerRef.current.terrainProvider = terrainProvider;
            console.log('Terrain enabled - topography loaded');
          } catch (error) {
            console.error('Failed to load terrain:', error);
          }
        } else {
          // Disable terrain (flat Earth)
          viewerRef.current.scene.globe.depthTestAgainstTerrain = false;
        }
      }
    };
    loadTerrain();
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
      const { KmlDataSource, HeadingPitchRange } = await import('cesium');
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

      // Fly to the loaded data with closer zoom - zoom in to fit all features
      await viewerRef.current.flyTo(dataSource, {
        duration: 2.0,
        offset: new HeadingPitchRange(0, CesiumMath.toRadians(-90), 500), // Aerial view, 500m altitude
      });

      console.log('KML/KMZ loaded successfully');
    } catch (error) {
      console.error('KML load error:', error);
      alert(`Failed to load KML/KMZ file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDragStart = (event: React.DragEvent, objectType: ObjectType) => {
    event.dataTransfer.setData('objectType', objectType);
  };

  const handleDrop = (event: React.DragEvent) => {
    if (!viewerRef.current) return;

    const objectType = event.dataTransfer.getData('objectType') as ObjectType;
    if (!objectType) return;

    // Get the clicked position on the globe
    const viewer = viewerRef.current;
    const scene = viewer.scene;
    const cartesian = scene.camera.pickEllipsoid(
      new Cartesian3(event.clientX, event.clientY),
      scene.globe.ellipsoid
    );

    if (!cartesian) return;

    // Add entity at the clicked location
    const cartographic = Cartographic.fromCartesian(cartesian);
    const position = Cartesian3.fromRadians(
      cartographic.longitude,
      cartographic.latitude,
      0
    );

    setEntities([
      ...entities,
      {
        id: `${objectType}-${entities.length}`,
        position,
        name: objectType,
        type: objectType,
      },
    ]);

    event.preventDefault();
  };

  return (
    <div
      className="relative w-full h-full"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
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

      {/* Compact Control Panel - Upper Left */}
      <div className="absolute top-4 left-4 bg-gray-900/95 backdrop-blur text-white rounded-lg shadow-2xl border border-gray-700 z-10 max-w-sm">
        {/* Header with collapse button */}
        <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800/50">
          <h2 className="text-sm font-bold text-white">Controls</h2>
          <button
            onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
            className="text-gray-400 hover:text-white text-xs px-2 py-1 hover:bg-gray-700 rounded"
          >
            {isPanelCollapsed ? 'Show' : 'Hide'}
          </button>
        </div>

        {!isPanelCollapsed && (
          <div className="p-3 space-y-3 max-h-[80vh] overflow-y-auto">
            {/* KML/KMZ Upload */}
            <div className="bg-gray-800/50 p-2 rounded border border-gray-700">
              <label className="block text-xs font-semibold mb-1 text-gray-200">
                Upload KML/KMZ
              </label>
              <input
                type="file"
                accept=".kml,.kmz"
                onChange={handleKMLUpload}
                className="block w-full text-xs text-gray-300
                  file:mr-2 file:py-1.5 file:px-3
                  file:rounded file:border-0
                  file:text-xs file:font-semibold
                  file:bg-green-600 file:text-white
                  hover:file:bg-green-700
                  file:cursor-pointer cursor-pointer"
              />
            </div>

            {/* Camera & Terrain Controls */}
            <div className="bg-gray-800/50 p-2 rounded border border-gray-700 space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setCameraMode('aerial')}
                  className={`flex-1 py-1.5 px-2 rounded text-xs font-medium ${
                    cameraMode === 'aerial'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Aerial
                </button>
                <button
                  onClick={() => setCameraMode('firstPerson')}
                  className={`flex-1 py-1.5 px-2 rounded text-xs font-medium ${
                    cameraMode === 'firstPerson'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  First Person
                </button>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={terrainEnabled}
                  onChange={(e) => setTerrainEnabled(e.target.checked)}
                  className="w-3 h-3"
                />
                <span className="text-xs text-gray-200">Topography</span>
              </label>
            </div>

            {/* Placeable Objects */}
            <div className="bg-gray-800/50 p-2 rounded border border-gray-700">
              <h3 className="text-xs font-semibold mb-2 text-gray-200">Drag & Drop Items</h3>
              <div className="space-y-1">
                {objectCategories.map((category) => {
                  const Icon = category.icon;
                  const isExpanded = expandedCategory === category.name;

                  return (
                    <div key={category.name} className="border border-gray-600 rounded bg-gray-900/50">
                      <button
                        onClick={() => setExpandedCategory(isExpanded ? null : category.name)}
                        className="w-full p-2 flex items-center justify-between hover:bg-gray-700/50 transition-colors rounded"
                      >
                        <span className="flex items-center gap-1.5 text-xs font-medium text-gray-200">
                          <Icon size={12} />
                          {category.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {isExpanded ? '−' : '+'}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="p-1.5 space-y-1">
                          {category.items.map((item) => (
                            <div
                              key={item.type}
                              draggable
                              onDragStart={(e) => handleDragStart(e, item.type)}
                              className="p-1.5 bg-gray-800 rounded text-xs cursor-move hover:bg-gray-700 transition-colors border border-gray-600 text-gray-200"
                            >
                              {item.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Drag items onto the map to place
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Instructions */}
      {!kmlDataSource && !isPanelCollapsed && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600/90 backdrop-blur text-white px-3 py-2 rounded-lg shadow-lg text-xs">
          Upload a KML/KMZ file from Google Maps to visualize your property
        </div>
      )}
    </div>
  );
}
