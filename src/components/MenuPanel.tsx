import { useState } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import type { ObjectType } from '../types';
import { Upload, Home, Truck, Eye, Trees, Save, FolderOpen } from 'lucide-react';
import { saveProject, loadProject } from '../utils/saveLoad';

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

export function MenuPanel() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Residential');
  const [projectName, setProjectName] = useState('My Property');
  const store = useAppStore();
  const { viewMode, setViewMode, setTerrainData } = store;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'aerial' | 'photo') => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === 'aerial') {
        setTerrainData({
          image: result,
          heightMap: null,
          width: 100,
          height: 100,
          lots: [],
          selectedLotIndex: null,
          kmzData: null,
        });
      }
    };

    reader.readAsDataURL(file);
  };

  const handleDragStart = (event: React.DragEvent, objectType: ObjectType) => {
    event.dataTransfer.setData('objectType', objectType);
  };

  const handleSave = () => {
    saveProject(store, projectName);
  };

  const handleLoad = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const saveData = await loadProject(file);
      setTerrainData(saveData.data.terrainData);
      // Load placed objects and photos
      saveData.data.placedObjects.forEach((obj) => {
        store.addPlacedObject(obj);
      });
      setProjectName(saveData.name);
    } catch (error) {
      console.error('Failed to load project:', error);
      alert('Failed to load project file');
    }
  };

  return (
    <div className="h-full bg-gray-800 text-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold mb-2">TGP Land Viewer</h1>
        <p className="text-sm text-gray-400">Design your property in 3D</p>
      </div>

      {/* Save/Load Section */}
      <div className="p-4 border-b border-gray-700 space-y-3">
        <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Save size={16} />
          Project
        </h2>

        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Project name"
          className="w-full px-3 py-2 bg-gray-700 text-white rounded text-sm border border-gray-600 focus:outline-none focus:border-blue-500"
        />

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 py-2 px-3 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Save size={14} />
            Save Project
          </button>

          <label className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer">
            <FolderOpen size={14} />
            Load Project
            <input
              type="file"
              accept=".tgp"
              onChange={handleLoad}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Upload Section */}
      <div className="p-4 border-b border-gray-700 space-y-3">
        <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Upload size={16} />
          Upload Files
        </h2>

        <label className="block">
          <span className="text-xs text-gray-400 mb-1 block">Aerial Map / Survey</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, 'aerial')}
            className="block w-full text-sm text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-600 file:text-white
              hover:file:bg-blue-700
              file:cursor-pointer cursor-pointer"
          />
        </label>

        <label className="block">
          <span className="text-xs text-gray-400 mb-1 block">Property Photos</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileUpload(e, 'photo')}
            className="block w-full text-sm text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-green-600 file:text-white
              hover:file:bg-green-700
              file:cursor-pointer cursor-pointer"
          />
        </label>
      </div>

      {/* View Toggle */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Eye size={16} />
          View Mode
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('aerial')}
            className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
              viewMode === 'aerial'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Aerial View
          </button>
          <button
            onClick={() => setViewMode('firstPerson')}
            className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
              viewMode === 'firstPerson'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            First Person
          </button>
        </div>
      </div>

      {/* Object Categories */}
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-sm font-semibold mb-3">Placeable Objects</h2>
        <div className="space-y-2">
          {objectCategories.map((category) => {
            const Icon = category.icon;
            const isExpanded = expandedCategory === category.name;

            return (
              <div key={category.name} className="border border-gray-700 rounded">
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : category.name)}
                  className="w-full p-3 flex items-center justify-between hover:bg-gray-700 transition-colors"
                >
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Icon size={16} />
                    {category.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {isExpanded ? '−' : '+'}
                  </span>
                </button>

                {isExpanded && (
                  <div className="p-2 space-y-1 bg-gray-900">
                    {category.items.map((item) => (
                      <div
                        key={item.type}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item.type)}
                        className="p-2 bg-gray-800 rounded text-xs cursor-move hover:bg-gray-700 transition-colors border border-gray-600"
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
      </div>

      {/* Instructions */}
      <div className="p-4 bg-gray-900 border-t border-gray-700">
        <p className="text-xs text-gray-400">
          Drag objects from the menu and drop them onto the terrain to place them.
        </p>
      </div>
    </div>
  );
}
