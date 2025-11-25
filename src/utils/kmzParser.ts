import JSZip from 'jszip';
import { kml } from '@tmcw/togeojson';

export interface LotData {
  lotNumber: number;
  boundary: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  clearing?: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  features: any[];
}

export interface KMZData {
  lots: LotData[];
  centerPoint: [number, number];
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export async function parseKMZ(file: File): Promise<KMZData> {
  // Unzip KMZ file
  const zip = await JSZip.loadAsync(file);

  // Find the KML file (usually doc.kml)
  const kmlFile = zip.file(/\.kml$/i)[0];
  if (!kmlFile) {
    throw new Error('No KML file found in KMZ');
  }

  // Read KML content
  const kmlText = await kmlFile.async('string');

  // Parse KML to GeoJSON
  const parser = new DOMParser();
  const kmlDoc = parser.parseFromString(kmlText, 'text/xml');
  const geoJson = kml(kmlDoc);

  // Extract lot data
  const lots: Map<number, LotData> = new Map();
  let allCoordinates: number[][] = [];

  geoJson.features.forEach((feature: any) => {
    const name = feature.properties?.name || '';

    // Match "Lot X Boundary" or "Lot X Clearing"
    const lotBoundaryMatch = name.match(/Lot\s+(\d+)\s+Boundary/i);
    const lotClearingMatch = name.match(/Lot\s+(\d+)\s+Clearing/i);

    if (lotBoundaryMatch) {
      const lotNumber = parseInt(lotBoundaryMatch[1]);
      if (!lots.has(lotNumber)) {
        lots.set(lotNumber, {
          lotNumber,
          boundary: {
            type: 'Polygon',
            coordinates: [],
          },
          features: [],
        });
      }

      const lot = lots.get(lotNumber)!;
      lot.boundary = feature.geometry;
      lot.features.push(feature);

      // Collect coordinates for bounds calculation
      if (feature.geometry.coordinates) {
        feature.geometry.coordinates[0]?.forEach((coord: number[]) => {
          allCoordinates.push(coord);
        });
      }
    }

    if (lotClearingMatch) {
      const lotNumber = parseInt(lotClearingMatch[1]);
      if (!lots.has(lotNumber)) {
        lots.set(lotNumber, {
          lotNumber,
          boundary: {
            type: 'Polygon',
            coordinates: [],
          },
          features: [],
        });
      }

      const lot = lots.get(lotNumber)!;
      lot.clearing = feature.geometry;
      lot.features.push(feature);

      // Collect coordinates
      if (feature.geometry.coordinates) {
        feature.geometry.coordinates[0]?.forEach((coord: number[]) => {
          allCoordinates.push(coord);
        });
      }
    }
  });

  // Calculate bounds and center
  const lons = allCoordinates.map(c => c[0]);
  const lats = allCoordinates.map(c => c[1]);

  const bounds = {
    north: Math.max(...lats),
    south: Math.min(...lats),
    east: Math.max(...lons),
    west: Math.min(...lons),
  };

  const centerPoint: [number, number] = [
    (bounds.east + bounds.west) / 2,
    (bounds.north + bounds.south) / 2,
  ];

  return {
    lots: Array.from(lots.values()).sort((a, b) => a.lotNumber - b.lotNumber),
    centerPoint,
    bounds,
  };
}

// Convert lat/lon coordinates to local 3D coordinates
export function latLonToLocal(
  lon: number,
  lat: number,
  centerLon: number,
  centerLat: number,
  scale: number = 100000 // meters to units
): [number, number] {
  // Simple equirectangular projection
  const x = (lon - centerLon) * Math.cos(centerLat * Math.PI / 180) * scale;
  const z = -(lat - centerLat) * scale; // Negative Z for Three.js coordinate system

  return [x, z];
}

// Convert polygon coordinates to 3D terrain
export function polygonTo3D(
  coordinates: number[][][],
  centerLon: number,
  centerLat: number,
  scale: number = 100000
): Array<[number, number]> {
  if (!coordinates || !coordinates[0]) return [];

  return coordinates[0].map(coord =>
    latLonToLocal(coord[0], coord[1], centerLon, centerLat, scale)
  );
}
