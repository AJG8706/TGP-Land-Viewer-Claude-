import { useRef, useMemo, useState, useEffect } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import type { ObjectType } from '../types';

export function Terrain() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { terrainData, addPlacedObject } = useAppStore();
  const { raycaster, camera } = useThree();
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Generate terrain geometry based on terrain data
  const geometry = useMemo(() => {
    const width = terrainData.width;
    const height = terrainData.height;
    const geometry = new THREE.PlaneGeometry(width, height, 64, 64);
    geometry.rotateX(-Math.PI / 2);

    // If we have a height map, apply it
    if (terrainData.heightMap) {
      const positions = geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const x = Math.floor((i % 65) / 65 * terrainData.heightMap.length);
        const z = Math.floor(Math.floor(i / 65) / 65 * terrainData.heightMap[0].length);
        positions.setY(i, terrainData.heightMap[x]?.[z] || 0);
      }
      positions.needsUpdate = true;
      geometry.computeVertexNormals();
    }

    return geometry;
  }, [terrainData]);

  // Handle drop event
  useEffect(() => {
    const handleDrop = (event: DragEvent) => {
      event.preventDefault();
      setIsDraggingOver(false);

      const objectType = event.dataTransfer?.getData('objectType') as ObjectType;
      if (!objectType || !meshRef.current) return;

      // Calculate drop position in 3D space
      const rect = (event.target as HTMLCanvasElement).getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const intersects = raycaster.intersectObject(meshRef.current);

      if (intersects.length > 0) {
        const point = intersects[0].point;
        addPlacedObject({
          type: objectType,
          position: [point.x, point.y, point.z],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
        });
      }
    };

    const handleDragOver = (event: DragEvent) => {
      event.preventDefault();
      setIsDraggingOver(true);
    };

    const handleDragLeave = () => {
      setIsDraggingOver(false);
    };

    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('drop', handleDrop);
      canvas.addEventListener('dragover', handleDragOver);
      canvas.addEventListener('dragleave', handleDragLeave);

      return () => {
        canvas.removeEventListener('drop', handleDrop);
        canvas.removeEventListener('dragover', handleDragOver);
        canvas.removeEventListener('dragleave', handleDragLeave);
      };
    }
  }, [raycaster, camera, addPlacedObject]);

  // Create texture from uploaded image
  const texture = useMemo(() => {
    if (terrainData.image) {
      const loader = new THREE.TextureLoader();
      return loader.load(terrainData.image);
    }
    return null;
  }, [terrainData.image]);

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      receiveShadow
      position={[0, 0, 0]}
    >
      <meshStandardMaterial
        map={texture}
        color={texture ? '#ffffff' : '#4a7c4e'}
        roughness={0.8}
        metalness={0.2}
        opacity={isDraggingOver ? 0.8 : 1}
        transparent={isDraggingOver}
      />
    </mesh>
  );
}
