import { useState, useEffect } from 'react';
import type { Property, Lot, LotPreset } from '../types/property';
import { propertyStorage } from '../utils/propertyStorage';
import { Settings, Plus, Trash2, Home, Map } from 'lucide-react';

export function AdminPanel({ onClose }: { onClose: () => void }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activeTab, setActiveTab] = useState<'properties' | 'lots' | 'presets'>('properties');
  const [saveMessage, setSaveMessage] = useState<string>('');

  // Load properties on mount
  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = () => {
    const allProperties = propertyStorage.getAllProperties();
    setProperties(allProperties);
  };

  const showSaveConfirmation = (message: string) => {
    setSaveMessage(message);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const resetAllData = () => {
    if (confirm('⚠️ WARNING: This will delete ALL properties, lots, and presets.\n\nThis action cannot be undone.\n\nAre you sure?')) {
      if (confirm('Are you REALLY sure? This will permanently delete everything.')) {
        localStorage.clear();
        setProperties([]);
        setSelectedProperty(null);
        showSaveConfirmation('✅ All data has been reset');
      }
    }
  };

  const createNewProperty = () => {
    const newProperty: Property = {
      id: `prop-${Date.now()}`,
      name: 'New Property',
      description: '',
      kmlData: '',
      kmlFileName: '',
      lots: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    propertyStorage.saveProperty(newProperty);
    loadProperties();
    setSelectedProperty(newProperty);
    showSaveConfirmation('✅ New property created');
  };

  const handleKMLUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProperty) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const kmlData = event.target?.result as string;
      const updated = {
        ...selectedProperty,
        kmlData,
        kmlFileName: file.name,
      };
      setSelectedProperty(updated);
      propertyStorage.saveProperty(updated);
      loadProperties();
      showSaveConfirmation('✅ KML file uploaded');
    };
    reader.readAsDataURL(file);
  };

  const addLot = () => {
    if (!selectedProperty) return;

    const newLot: Lot = {
      id: `lot-${Date.now()}`,
      number: selectedProperty.lots.length + 1,
      name: `Lot ${selectedProperty.lots.length + 1}`,
      presets: [],
    };

    const updated = {
      ...selectedProperty,
      lots: [...selectedProperty.lots, newLot],
    };
    setSelectedProperty(updated);
    propertyStorage.saveProperty(updated);
    loadProperties();
  };

  const addPreset = (lotId: string) => {
    if (!selectedProperty) return;

    const newPreset: LotPreset = {
      id: `preset-${Date.now()}`,
      name: 'New Preset',
      description: '',
      terrain: 'cleared',
      driveway: 'center',
      width: 100,
      height: 100,
    };

    const updated = {
      ...selectedProperty,
      lots: selectedProperty.lots.map(lot =>
        lot.id === lotId
          ? { ...lot, presets: [...lot.presets, newPreset] }
          : lot
      ),
    };
    setSelectedProperty(updated);
    propertyStorage.saveProperty(updated);
    loadProperties();
  };

  const updatePreset = (lotId: string, presetId: string, updates: Partial<LotPreset>) => {
    if (!selectedProperty) return;

    const updated = {
      ...selectedProperty,
      lots: selectedProperty.lots.map(lot =>
        lot.id === lotId
          ? {
              ...lot,
              presets: lot.presets.map(preset =>
                preset.id === presetId ? { ...preset, ...updates } : preset
              ),
            }
          : lot
      ),
    };
    setSelectedProperty(updated);
    propertyStorage.saveProperty(updated);
    loadProperties();
  };

  const deletePreset = (lotId: string, presetId: string) => {
    if (!selectedProperty) return;

    const updated = {
      ...selectedProperty,
      lots: selectedProperty.lots.map(lot =>
        lot.id === lotId
          ? { ...lot, presets: lot.presets.filter(p => p.id !== presetId) }
          : lot
      ),
    };
    setSelectedProperty(updated);
    propertyStorage.saveProperty(updated);
    loadProperties();
  };

  const deleteLot = (lotId: string) => {
    if (!selectedProperty) return;

    const updated = {
      ...selectedProperty,
      lots: selectedProperty.lots.filter(l => l.id !== lotId),
    };
    setSelectedProperty(updated);
    propertyStorage.saveProperty(updated);
    loadProperties();
  };

  const deleteProperty = (propertyId: string) => {
    if (confirm('Are you sure you want to delete this property?')) {
      propertyStorage.deleteProperty(propertyId);
      loadProperties();
      if (selectedProperty?.id === propertyId) {
        setSelectedProperty(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-800 text-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <Settings size={24} />
            <h1 className="text-xl font-bold">Property Admin Console</h1>
            {saveMessage && (
              <span className="ml-4 px-3 py-1 bg-green-600 text-white text-sm rounded-full animate-pulse">
                {saveMessage}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetAllData}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-sm font-medium"
            >
              Reset All Data
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium"
            >
              Close Admin
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Property List */}
          <div className="w-64 border-r bg-gray-50 flex flex-col">
            <div className="p-3 border-b">
              <button
                onClick={createNewProperty}
                className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                New Property
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {properties.map(property => (
                <div
                  key={property.id}
                  className={`p-3 mb-2 rounded cursor-pointer transition-colors ${
                    selectedProperty?.id === property.id
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-white border border-gray-300 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedProperty(property)}
                >
                  <div className="font-medium text-sm">{property.name}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {property.lots.length} lots
                  </div>
                  <div className="text-xs text-gray-500">
                    {property.kmlFileName || 'No KML'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {selectedProperty ? (
              <>
                {/* Tabs */}
                <div className="flex border-b bg-gray-100">
                  <button
                    onClick={() => setActiveTab('properties')}
                    className={`px-6 py-3 text-sm font-medium ${
                      activeTab === 'properties'
                        ? 'bg-white border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Settings size={16} className="inline mr-2" />
                    Property Settings
                  </button>
                  <button
                    onClick={() => setActiveTab('lots')}
                    className={`px-6 py-3 text-sm font-medium ${
                      activeTab === 'lots'
                        ? 'bg-white border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Map size={16} className="inline mr-2" />
                    Lots ({selectedProperty.lots.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('presets')}
                    className={`px-6 py-3 text-sm font-medium ${
                      activeTab === 'presets'
                        ? 'bg-white border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Home size={16} className="inline mr-2" />
                    Lot Presets
                  </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {activeTab === 'properties' && (
                    <div className="space-y-4">
                      {/* Auto-save indicator */}
                      <div className="bg-green-50 p-3 rounded border border-green-300">
                        <p className="text-sm text-green-800">
                          💾 <strong>Auto-save enabled:</strong> All changes are automatically saved
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Property Name</label>
                        <input
                          type="text"
                          value={selectedProperty.name}
                          onChange={(e) => {
                            const updated = { ...selectedProperty, name: e.target.value };
                            setSelectedProperty(updated);
                            propertyStorage.saveProperty(updated);
                            loadProperties();
                            showSaveConfirmation('✅ Property name saved');
                          }}
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                          value={selectedProperty.description}
                          onChange={(e) => {
                            const updated = { ...selectedProperty, description: e.target.value };
                            setSelectedProperty(updated);
                            propertyStorage.saveProperty(updated);
                            loadProperties();
                          }}
                          className="w-full px-3 py-2 border rounded h-24"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Upload KML File</label>
                        <input
                          type="file"
                          accept=".kml,.kmz"
                          onChange={handleKMLUpload}
                          className="block w-full text-sm"
                        />
                        {selectedProperty.kmlFileName && (
                          <div className="mt-2 text-sm text-green-600">
                            ✓ {selectedProperty.kmlFileName}
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t">
                        <button
                          onClick={() => deleteProperty(selectedProperty.id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium"
                        >
                          <Trash2 size={16} className="inline mr-2" />
                          Delete Property
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'lots' && (
                    <div className="space-y-4">
                      <button
                        onClick={addLot}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium"
                      >
                        <Plus size={16} className="inline mr-2" />
                        Add Lot
                      </button>

                      <div className="grid gap-4">
                        {selectedProperty.lots.map(lot => (
                          <div key={lot.id} className="border rounded p-4 bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                              <input
                                type="text"
                                value={lot.name}
                                onChange={(e) => {
                                  const updated = {
                                    ...selectedProperty,
                                    lots: selectedProperty.lots.map(l =>
                                      l.id === lot.id ? { ...l, name: e.target.value } : l
                                    ),
                                  };
                                  setSelectedProperty(updated);
                                  propertyStorage.saveProperty(updated);
                                  loadProperties();
                                }}
                                className="font-medium px-2 py-1 border rounded"
                              />
                              <button
                                onClick={() => deleteLot(lot.id)}
                                className="p-2 bg-red-100 hover:bg-red-200 rounded text-red-700"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <div className="text-sm text-gray-600">
                              {lot.presets.length} preset(s) configured
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'presets' && (
                    <div className="space-y-6">
                      {selectedProperty.lots.map(lot => (
                        <div key={lot.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg">{lot.name}</h3>
                            <button
                              onClick={() => addPreset(lot.id)}
                              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
                            >
                              <Plus size={14} className="inline mr-1" />
                              Add Preset
                            </button>
                          </div>

                          <div className="space-y-3">
                            {lot.presets.map(preset => (
                              <div key={preset.id} className="border rounded p-3 bg-white">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium mb-1">Preset Name</label>
                                    <input
                                      type="text"
                                      value={preset.name}
                                      onChange={(e) => updatePreset(lot.id, preset.id, { name: e.target.value })}
                                      className="w-full px-2 py-1 border rounded text-sm"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-xs font-medium mb-1">Description</label>
                                    <input
                                      type="text"
                                      value={preset.description}
                                      onChange={(e) => updatePreset(lot.id, preset.id, { description: e.target.value })}
                                      className="w-full px-2 py-1 border rounded text-sm"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-xs font-medium mb-1">Terrain Type</label>
                                    <select
                                      value={preset.terrain}
                                      onChange={(e) => updatePreset(lot.id, preset.id, { terrain: e.target.value as any })}
                                      className="w-full px-2 py-1 border rounded text-sm"
                                    >
                                      <option value="cleared">Cleared</option>
                                      <option value="wooded">Wooded</option>
                                      <option value="partially-cleared">Partially Cleared</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-xs font-medium mb-1">Driveway</label>
                                    <select
                                      value={preset.driveway}
                                      onChange={(e) => updatePreset(lot.id, preset.id, { driveway: e.target.value as any })}
                                      className="w-full px-2 py-1 border rounded text-sm"
                                    >
                                      <option value="none">None</option>
                                      <option value="left">Left</option>
                                      <option value="center">Center</option>
                                      <option value="right">Right</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="mt-3 flex justify-end">
                                  <button
                                    onClick={() => deletePreset(lot.id, preset.id)}
                                    className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs"
                                  >
                                    <Trash2 size={12} className="inline mr-1" />
                                    Delete
                                  </button>
                                </div>
                              </div>
                            ))}

                            {lot.presets.length === 0 && (
                              <div className="text-sm text-gray-500 italic">
                                No presets configured for this lot yet.
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Map size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Select a property or create a new one to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
