import { useRef, useState, useEffect } from 'react';
import { Viewer } from 'resium';
import {
  Cartesian3,
  Ion,
  Math as CesiumMath,
  SceneMode,
  createWorldTerrainAsync,
} from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import type { Viewer as CesiumViewerType } from 'cesium';
import { propertyStorage } from '../utils/propertyStorage';
import type { Property } from '../types/property';

// Cesium Ion access token for imagery and terrain
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyMTJhYTk4MC03NWY3LTRkOWQtYjE3NS04NDEyYWM4NTE0MDgiLCJpZCI6MzY3NzgxLCJpYXQiOjE3NjUyMjUzODF9.2iaopscVk321BPc3HkHexuZdXj0X2jWifY7do4bzJ_I';

interface Props {
  onSwitchToLotView?: () => void;
  onLotSelected?: (lotId: string) => void;
  isAdminOpen?: boolean;
}

export function CesiumViewerSimple({ onSwitchToLotView, onLotSelected, isAdminOpen }: Props) {
  const viewerRef = useRef<CesiumViewerType | null>(null);
  const [terrainEnabled, setTerrainEnabled] = useState(true);
  const [kmlDataSource, setKmlDataSource] = useState<any>(null);
  const [currentProperty, setCurrentProperty] = useState<Property | null>(null);
  const [selectedLot, setSelectedLot] = useState<string | null>(null);

  // Set initial camera view
  useEffect(() => {
    if (viewerRef.current) {
      viewerRef.current.camera.setView({
        destination: Cartesian3.fromDegrees(-97.7431, 30.2672, 5000),
        orientation: {
          heading: 0.0,
          pitch: CesiumMath.toRadians(-90),
          roll: 0.0,
        },
      });

      // Set scene mode to 2D by default
      if (viewerRef.current.scene) {
        viewerRef.current.scene.mode = SceneMode.SCENE2D;
      }
    }
  }, []);

  // Load current property and KML
  useEffect(() => {
    const store = propertyStorage.loadProperties();
    if (store.currentPropertyId) {
      const property = propertyStorage.getProperty(store.currentPropertyId);
      if (property) {
        setCurrentProperty(property);
        // Load KML if available
        if (property.kmlData && viewerRef.current) {
          loadKML(property.kmlData);
        }
      }
    }
  }, []);

  // Enable/disable terrain
  useEffect(() => {
    const loadTerrain = async () => {
      if (viewerRef.current) {
        if (terrainEnabled) {
          try {
            const terrainProvider = await createWorldTerrainAsync();
            viewerRef.current.terrainProvider = terrainProvider;
          } catch (error) {
            console.error('Failed to load terrain:', error);
          }
        }
      }
    };
    loadTerrain();
  }, [terrainEnabled]);

  // Handle entity clicks for lot selection
  useEffect(() => {
    if (!viewerRef.current) return;

    const viewer = viewerRef.current;
    const handler = new (window as any).Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    // Click handler
    handler.setInputAction((click: any) => {
      const pickedObject = viewer.scene.pick(click.position);
      if (pickedObject && pickedObject.id && pickedObject.id.name) {
        const lotName = pickedObject.id.name;
        // Find matching lot
        const lot = currentProperty?.lots.find(l => l.name === lotName);
        if (lot) {
          handleLotSelect(lot.id);
        }
      }
    }, (window as any).Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // Hover handler - could add hover highlighting later
    handler.setInputAction((_movement: any) => {
      // TODO: Add hover highlighting for lots
    }, (window as any).Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    return () => {
      handler.destroy();
    };
  }, [currentProperty]);

  const loadKML = async (kmlData: string) => {
    if (!viewerRef.current) return;

    try {
      // Convert data URL to blob
      const response = await fetch(kmlData);
      const blob = await response.blob();

      const { KmlDataSource, HeadingPitchRange } = await import('cesium');
      const dataSource = await KmlDataSource.load(blob, {
        camera: viewerRef.current.camera,
        canvas: viewerRef.current.canvas,
        clampToGround: true,
      });

      if (kmlDataSource) {
        viewerRef.current.dataSources.remove(kmlDataSource);
      }

      await viewerRef.current.dataSources.add(dataSource);
      setKmlDataSource(dataSource);

      // Fly to the loaded data
      await viewerRef.current.flyTo(dataSource, {
        duration: 2.0,
        offset: new HeadingPitchRange(0, CesiumMath.toRadians(-90), 3500),
      });

      console.log('KML loaded successfully');
    } catch (error) {
      console.error('KML load error:', error);
    }
  };

  const handleKMLUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !viewerRef.current) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const kmlData = e.target?.result as string;
      await loadKML(kmlData);
    };
    reader.readAsDataURL(file);
  };

  const handleLotSelect = (lotId: string) => {
    setSelectedLot(lotId);
    propertyStorage.setSelectedLot(lotId);
    if (onLotSelected) {
      onLotSelected(lotId);
    }

    // Show confirmation
    const lot = currentProperty?.lots.find(l => l.id === lotId);
    if (lot) {
      alert(`Selected: ${lot.name}\n\nClick "Lot View" to see the lot presets!`);
    }
  };

  return (
    <div className="relative w-full h-full">
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
      />

      {/* Control Panel - Hidden when admin is open */}
      {!isAdminOpen && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-2xl border border-gray-300 z-10 max-w-sm">
          <div className="flex items-center justify-between p-3 border-b border-gray-300 bg-gray-200">
            <h2 className="text-sm font-bold text-gray-900">Lot Selection</h2>
          </div>

        <div className="p-3 space-y-3">
          {/* Property Info */}
          {currentProperty && (
            <div className="bg-blue-50 p-2 rounded border border-blue-300">
              <div className="text-xs font-semibold text-blue-900">Current Property</div>
              <div className="text-sm font-bold text-blue-700">{currentProperty.name}</div>
              <div className="text-xs text-blue-600 mt-1">
                {currentProperty.lots.length} lots available
              </div>
            </div>
          )}

          {/* KML Upload */}
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

          {/* Terrain Toggle */}
          <div className="bg-gray-50 p-2 rounded border border-gray-300">
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

          {/* Switch to Lot View */}
          <div className="bg-gray-50 p-2 rounded border border-gray-300">
            <button
              onClick={onSwitchToLotView}
              disabled={!selectedLot}
              className={`w-full py-2 px-3 rounded text-xs font-medium ${
                selectedLot
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {selectedLot ? 'View Selected Lot →' : 'Select a Lot First'}
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 p-2 rounded border border-blue-300">
            <h3 className="text-xs font-semibold mb-1 text-blue-900">How to Use</h3>
            <ul className="text-xs text-blue-800 space-y-0.5">
              <li>• Click any lot on the map to select it</li>
              <li>• Selected lot will be highlighted</li>
              <li>• Click "View Selected Lot" to see presets</li>
              <li>• Use Admin to configure lots & presets</li>
            </ul>
          </div>

          {/* Selected Lot Info */}
          {selectedLot && currentProperty && (
            <div className="bg-green-50 p-2 rounded border border-green-300">
              <div className="text-xs font-semibold text-green-900">Selected Lot</div>
              <div className="text-sm font-bold text-green-700">
                {currentProperty.lots.find(l => l.id === selectedLot)?.name}
              </div>
              <div className="text-xs text-green-600 mt-1">
                {currentProperty.lots.find(l => l.id === selectedLot)?.presets.length || 0} preset(s) available
              </div>
            </div>
          )}
        </div>
        </div>
      )}

      {/* Instructions Overlay */}
      {!kmlDataSource && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600/90 backdrop-blur text-white px-3 py-2 rounded-lg shadow-lg text-xs">
          Upload a KML/KMZ file or use Admin to load a property
        </div>
      )}
    </div>
  );
}
