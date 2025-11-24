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

export interface TerrainData {
  image: string | null;
  heightMap: number[][] | null;
  width: number;
  height: number;
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
