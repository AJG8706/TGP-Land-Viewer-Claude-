// Property and Lot Management Types

export interface LotPreset {
  id: string;
  name: string;
  description: string;
  terrain: 'cleared' | 'wooded' | 'partially-cleared';
  driveway: 'left' | 'center' | 'right' | 'none';
  // R3F scene configuration
  terrainImageUrl?: string;
  heightMapUrl?: string;
  width: number;
  height: number;
  // Add any other preset properties for R3F
}

export interface Lot {
  id: string;
  number: number;
  name: string;
  // KML feature reference
  kmlFeatureId?: string;
  // Available presets for this lot
  presets: LotPreset[];
  // Default preset to load
  defaultPresetId?: string;
}

export interface Property {
  id: string;
  name: string;
  description: string;
  // KML file data
  kmlData: string; // base64 or data URL
  kmlFileName: string;
  // Lots in this property
  lots: Lot[];
  createdAt: string;
  updatedAt: string;
}

export interface PropertyStore {
  properties: Record<string, Property>; // keyed by property ID
  currentPropertyId: string | null;
  selectedLotId: string | null;
}
