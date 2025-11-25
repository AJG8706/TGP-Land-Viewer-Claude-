export type ViewMode = 'aerial' | 'firstPerson';

export interface PlacedObject {
  id: string;
  type: ObjectType;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export type ObjectType =
  | 'singleWideMobileHome'
  | 'doubleWideMobileHome'
  | 'singleFamilyHouse1'
  | 'singleFamilyHouse2'
  | 'singleFamilyHouse3'
  | 'rv'
  | 'deerBlind'
  | 'bridge';

export interface ObjectCategory {
  name: string;
  items: ObjectType[];
}

export interface LotBoundary {
  coordinates: Array<[number, number]>;
  center: [number, number];
}

export interface LotInfo {
  lotNumber: number;
  boundary: LotBoundary;
  clearing?: LotBoundary;
}

export interface TerrainData {
  image: string | null;
  heightMap: number[][] | null;
  width: number;
  height: number;
  lots: LotInfo[];
  selectedLotIndex: number | null;
  kmzData: {
    centerPoint: [number, number];
    bounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
  } | null;
}

export interface PropertyPhoto {
  id: string;
  url: string;
  thumbnail: string;
}

export interface AppState {
  viewMode: ViewMode;
  terrainData: TerrainData;
  placedObjects: PlacedObject[];
  selectedObjectId: string | null;
  propertyPhotos: PropertyPhoto[];
}
