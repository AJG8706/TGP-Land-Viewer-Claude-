import { useRef, useState, useEffect } from 'react';
import {
  Viewer,
  Entity,
} from 'resium';
import {
  Cartesian3,
  Color,
  Ion,
  Math as CesiumMath,
  SceneMode,
  createWorldTerrainAsync,
  Transforms,
  HeadingPitchRoll,
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

export function CesiumViewer({ onSwitchToR3F }: { onSwitchToR3F?: () => void }) {
  const viewerRef = useRef<CesiumViewerType | null>(null);
  const [terrainEnabled, setTerrainEnabled] = useState(true); // Enable terrain by default
  const [kmlDataSource, setKmlDataSource] = useState<any>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Residential');
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [isDraggingEntity, setIsDraggingEntity] = useState(false);

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
    rotation: number; // rotation in degrees
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

  // Handle entity selection and keyboard rotation
  useEffect(() => {
    if (!viewerRef.current) return;

    const viewer = viewerRef.current;

    // Click handler for entity selection
    const handler = new (window as any).Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction((click: any) => {
      const pickedObject = viewer.scene.pick(click.position);
      if (pickedObject && pickedObject.id && pickedObject.id.id) {
        // Check if it's one of our entities
        const entityId = pickedObject.id.id;
        if (entities.find(e => e.id === entityId)) {
          setSelectedEntityId(entityId);
        }
      } else {
        setSelectedEntityId(null);
      }
    }, (window as any).Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // Keyboard handler for rotation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedEntityId) return;

      if (e.key === 'r' || e.key === 'R') {
        // Rotate clockwise
        setEntities(prev => prev.map(entity =>
          entity.id === selectedEntityId
            ? { ...entity, rotation: (entity.rotation + 15) % 360 }
            : entity
        ));
      } else if (e.key === 'e' || e.key === 'E') {
        // Rotate counter-clockwise
        setEntities(prev => prev.map(entity =>
          entity.id === selectedEntityId
            ? { ...entity, rotation: (entity.rotation - 15 + 360) % 360 }
            : entity
        ));
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        // Delete selected entity
        setEntities(prev => prev.filter(entity => entity.id !== selectedEntityId));
        setSelectedEntityId(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      handler.destroy();
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedEntityId, entities]);

  // Handle entity dragging
  useEffect(() => {
    if (!viewerRef.current || !selectedEntityId) return;

    const viewer = viewerRef.current;
    const handler = new (window as any).Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    // Start dragging
    handler.setInputAction((click: any) => {
      const pickedObject = viewer.scene.pick(click.position);
      if (pickedObject && pickedObject.id && pickedObject.id.id === selectedEntityId) {
        setIsDraggingEntity(true);
        viewer.scene.screenSpaceCameraController.enableRotate = false;
      }
    }, (window as any).Cesium.ScreenSpaceEventType.LEFT_DOWN);

    // Drag entity
    handler.setInputAction((movement: any) => {
      if (isDraggingEntity && selectedEntityId) {
        const cartesian = viewer.scene.camera.pickEllipsoid(
          movement.endPosition,
          viewer.scene.globe.ellipsoid
        );

        if (cartesian) {
          setEntities(prev => prev.map(entity =>
            entity.id === selectedEntityId
              ? { ...entity, position: cartesian }
              : entity
          ));
        }
      }
    }, (window as any).Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    // Stop dragging
    handler.setInputAction(() => {
      setIsDraggingEntity(false);
      viewer.scene.screenSpaceCameraController.enableRotate = true;
    }, (window as any).Cesium.ScreenSpaceEventType.LEFT_UP);

    return () => {
      handler.destroy();
    };
  }, [selectedEntityId, isDraggingEntity, entities]);

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

      // Fly to the loaded data - zoom to fit all features comfortably
      await viewerRef.current.flyTo(dataSource, {
        duration: 2.0,
        offset: new HeadingPitchRange(0, CesiumMath.toRadians(-90), 3500), // Aerial view, 3500m altitude
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

    event.preventDefault();

    // Get the drop position on the globe
    const viewer = viewerRef.current;
    const canvas = viewer.scene.canvas;

    // Get canvas-relative coordinates
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convert to Cesium Cartesian2
    const position2D = new (window as any).Cesium.Cartesian2(x, y);

    // Pick the position on the globe/ellipsoid
    let cartesian = viewer.scene.camera.pickEllipsoid(position2D, viewer.scene.globe.ellipsoid);

    if (!cartesian) {
      console.warn('Could not pick position on globe, trying scene pick');
      // Try alternative picking method
      const pickRay = viewer.camera.getPickRay(position2D);
      if (pickRay) {
        cartesian = viewer.scene.globe.pick(pickRay, viewer.scene);
      }
    }

    if (!cartesian) {
      console.error('Could not determine drop position');
      alert('Could not place item at this location. Try dropping on the map area.');
      return;
    }

    // Place entity slightly above ground (5 meters) to ensure visibility
    const cartographic = (window as any).Cesium.Cartographic.fromCartesian(cartesian);
    const positionAboveGround = (window as any).Cesium.Cartesian3.fromRadians(
      cartographic.longitude,
      cartographic.latitude,
      5 // 5 meters above ground
    );

    const newEntity = {
      id: `${objectType}-${Date.now()}-${entities.length}`,
      position: positionAboveGround,
      name: objectType,
      type: objectType,
      rotation: 0,
    };

    console.log('Dropping entity:', newEntity);
    setEntities([...entities, newEntity]);
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
        {entities.map((entity) => {
          // Calculate rotation matrix
          const heading = CesiumMath.toRadians(entity.rotation);
          const pitch = 0;
          const roll = 0;
          const hpr = new HeadingPitchRoll(heading, pitch, roll);
          const orientation = Transforms.headingPitchRollQuaternion(entity.position, hpr);

          const isSelected = entity.id === selectedEntityId;

          return (
            <Entity
              key={entity.id}
              id={entity.id}
              name={entity.name}
              position={entity.position}
              orientation={orientation}
              box={{
                dimensions: new Cartesian3(20, 20, 10),
                material: isSelected ? Color.YELLOW.withAlpha(0.8) : Color.BLUE.withAlpha(0.7),
                outline: true,
                outlineColor: isSelected ? Color.YELLOW : Color.BLACK,
              }}
            />
          );
        })}
      </Viewer>

      {/* Compact Control Panel - Upper Left */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-2xl border border-gray-300 z-10 max-w-sm">
        {/* Header with collapse button */}
        <div className="flex items-center justify-between p-3 border-b border-gray-300 bg-gray-200">
          <h2 className="text-sm font-bold text-gray-900">Controls</h2>
          <button
            onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
            className="text-gray-600 hover:text-gray-900 text-xs px-2 py-1 hover:bg-gray-300 rounded"
          >
            {isPanelCollapsed ? 'Show' : 'Hide'}
          </button>
        </div>

        {!isPanelCollapsed && (
          <div className="p-3 space-y-3 max-h-[80vh] overflow-y-auto">
            {/* KML/KMZ Upload */}
            <div className="bg-gray-50 p-2 rounded border border-gray-300">
              <label className="block text-xs font-semibold mb-1 text-gray-900">
                Upload KML/KMZ
              </label>
              <input
                type="file"
                accept=".kml,.kmz"
                onChange={handleKMLUpload}
                className="block w-full text-xs text-gray-700
                  file:mr-2 file:py-1.5 file:px-3
                  file:rounded file:border-0
                  file:text-xs file:font-semibold
                  file:bg-green-600 file:text-white
                  hover:file:bg-green-700
                  file:cursor-pointer cursor-pointer"
              />
            </div>

            {/* View & Terrain Controls */}
            <div className="bg-gray-50 p-2 rounded border border-gray-300 space-y-2">
              <button
                onClick={onSwitchToR3F}
                className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium"
              >
                Switch to First Person View (R3F)
              </button>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={terrainEnabled}
                  onChange={(e) => setTerrainEnabled(e.target.checked)}
                  className="w-3 h-3"
                />
                <span className="text-xs text-gray-900">Enable Topography</span>
              </label>
            </div>

            {/* Placeable Objects */}
            <div className="bg-gray-50 p-2 rounded border border-gray-300">
              <h3 className="text-xs font-semibold mb-2 text-gray-900">Drag & Drop Items</h3>
              <div className="space-y-1">
                {objectCategories.map((category) => {
                  const Icon = category.icon;
                  const isExpanded = expandedCategory === category.name;

                  return (
                    <div key={category.name} className="border border-gray-300 rounded bg-white">
                      <button
                        onClick={() => setExpandedCategory(isExpanded ? null : category.name)}
                        className="w-full p-2 flex items-center justify-between hover:bg-gray-100 transition-colors rounded"
                      >
                        <span className="flex items-center gap-1.5 text-xs font-medium text-gray-900">
                          <Icon size={12} />
                          {category.name}
                        </span>
                        <span className="text-xs text-gray-600">
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
                              className="p-1.5 bg-gray-100 rounded text-xs cursor-move hover:bg-gray-200 transition-colors border border-gray-300 text-gray-900"
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
              <p className="text-xs text-gray-600 mt-2">
                Drag items onto the map to place
              </p>
            </div>

            {/* Controls Help */}
            <div className="bg-blue-50 p-2 rounded border border-blue-300">
              <h3 className="text-xs font-semibold mb-1 text-blue-900">Item Controls</h3>
              <ul className="text-xs text-blue-800 space-y-0.5">
                <li>• Click item to select (turns yellow)</li>
                <li>• Drag selected item to move</li>
                <li>• Press R to rotate clockwise</li>
                <li>• Press E to rotate counter-clockwise</li>
                <li>• Press Delete to remove</li>
              </ul>
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
