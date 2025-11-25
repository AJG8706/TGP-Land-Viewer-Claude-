import { create } from 'zustand';
import type { AppState, PlacedObject, ViewMode, TerrainData, PropertyPhoto } from '../types';

interface AppStore extends AppState {
  setViewMode: (mode: ViewMode) => void;
  setTerrainData: (data: TerrainData) => void;
  setSelectedLot: (index: number | null) => void;
  addPlacedObject: (object: Omit<PlacedObject, 'id'>) => void;
  updatePlacedObject: (id: string, updates: Partial<PlacedObject>) => void;
  removePlacedObject: (id: string) => void;
  setSelectedObjectId: (id: string | null) => void;
  addPropertyPhoto: (photo: PropertyPhoto) => void;
  removePropertyPhoto: (id: string) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  viewMode: 'aerial',
  terrainData: {
    image: null,
    heightMap: null,
    width: 100,
    height: 100,
    lots: [],
    selectedLotIndex: null,
    kmzData: null,
  },
  placedObjects: [],
  selectedObjectId: null,
  propertyPhotos: [],

  setViewMode: (mode) => set({ viewMode: mode }),

  setTerrainData: (data) => set({ terrainData: data }),

  setSelectedLot: (index) =>
    set((state) => ({
      terrainData: {
        ...state.terrainData,
        selectedLotIndex: index,
      },
    })),

  addPlacedObject: (object) =>
    set((state) => ({
      placedObjects: [
        ...state.placedObjects,
        {
          ...object,
          id: `object-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        },
      ],
    })),

  updatePlacedObject: (id, updates) =>
    set((state) => ({
      placedObjects: state.placedObjects.map((obj) =>
        obj.id === id ? { ...obj, ...updates } : obj
      ),
    })),

  removePlacedObject: (id) =>
    set((state) => ({
      placedObjects: state.placedObjects.filter((obj) => obj.id !== id),
      selectedObjectId: state.selectedObjectId === id ? null : state.selectedObjectId,
    })),

  setSelectedObjectId: (id) => set({ selectedObjectId: id }),

  addPropertyPhoto: (photo) =>
    set((state) => ({
      propertyPhotos: [...state.propertyPhotos, photo],
    })),

  removePropertyPhoto: (id) =>
    set((state) => ({
      propertyPhotos: state.propertyPhotos.filter((photo) => photo.id !== id),
    })),
}));
