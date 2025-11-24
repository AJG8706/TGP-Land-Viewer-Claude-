import type { AppState } from '../types';

export interface SaveData {
  version: string;
  timestamp: number;
  name: string;
  data: {
    terrainData: AppState['terrainData'];
    placedObjects: AppState['placedObjects'];
    propertyPhotos: AppState['propertyPhotos'];
  };
}

export function saveProject(state: AppState, name: string): void {
  const saveData: SaveData = {
    version: '1.0.0',
    timestamp: Date.now(),
    name,
    data: {
      terrainData: state.terrainData,
      placedObjects: state.placedObjects,
      propertyPhotos: state.propertyPhotos,
    },
  };

  const json = JSON.stringify(saveData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${name.replace(/\s+/g, '_')}_${Date.now()}.tgp`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function loadProject(file: File): Promise<SaveData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const data = JSON.parse(json) as SaveData;

        // Basic validation
        if (!data.version || !data.data) {
          throw new Error('Invalid save file format');
        }

        resolve(data);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

export function exportAsImage(canvas: HTMLCanvasElement, name: string): void {
  canvas.toBlob((blob) => {
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name.replace(/\s+/g, '_')}_screenshot.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
}
