import type { Property, PropertyStore } from '../types/property';

const STORAGE_KEY = 'tgp-properties';

export const propertyStorage = {
  // Load all properties
  loadProperties(): PropertyStore {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load properties:', error);
    }

    return {
      properties: {},
      currentPropertyId: null,
      selectedLotId: null,
    };
  },

  // Save all properties
  saveProperties(store: PropertyStore): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (error) {
      console.error('Failed to save properties:', error);
    }
  },

  // Get a single property
  getProperty(propertyId: string): Property | null {
    const store = this.loadProperties();
    return store.properties[propertyId] || null;
  },

  // Save a single property
  saveProperty(property: Property): void {
    const store = this.loadProperties();
    store.properties[property.id] = {
      ...property,
      updatedAt: new Date().toISOString(),
    };
    this.saveProperties(store);
  },

  // Delete a property
  deleteProperty(propertyId: string): void {
    const store = this.loadProperties();
    delete store.properties[propertyId];
    if (store.currentPropertyId === propertyId) {
      store.currentPropertyId = null;
    }
    this.saveProperties(store);
  },

  // Set current property
  setCurrentProperty(propertyId: string): void {
    const store = this.loadProperties();
    store.currentPropertyId = propertyId;
    this.saveProperties(store);
  },

  // Set selected lot
  setSelectedLot(lotId: string | null): void {
    const store = this.loadProperties();
    store.selectedLotId = lotId;
    this.saveProperties(store);
  },

  // Get selected lot
  getSelectedLot(): string | null {
    const store = this.loadProperties();
    return store.selectedLotId;
  },

  // Get all properties as array
  getAllProperties(): Property[] {
    const store = this.loadProperties();
    return Object.values(store.properties);
  },
};
