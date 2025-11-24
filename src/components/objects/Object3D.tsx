import { useRef } from 'react';
import { useAppStore } from '../../hooks/useAppStore';
import type { PlacedObject } from '../../types';
import { TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { SingleWideMobileHome } from './SingleWideMobileHome';
import { DoubleWideMobileHome } from './DoubleWideMobileHome';
import { SingleFamilyHouse } from './SingleFamilyHouse';
import { RV } from './RV';
import { DeerBlind } from './DeerBlind';
import { Bridge } from './Bridge';

interface Object3DProps {
  object: PlacedObject;
}

export function Object3D({ object }: Object3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { selectedObjectId, setSelectedObjectId, updatePlacedObject } = useAppStore();
  const isSelected = selectedObjectId === object.id;

  const handleClick = (event: any) => {
    event.stopPropagation();
    setSelectedObjectId(object.id);
  };

  const handleTransform = () => {
    if (!groupRef.current) return;

    updatePlacedObject(object.id, {
      position: groupRef.current.position.toArray(),
      rotation: groupRef.current.rotation.toArray() as [number, number, number],
      scale: groupRef.current.scale.toArray(),
    });
  };

  // Render the appropriate model based on object type
  const renderModel = () => {
    switch (object.type) {
      case 'singleWideMobileHome':
        return <SingleWideMobileHome />;
      case 'doubleWideMobileHome':
        return <DoubleWideMobileHome />;
      case 'singleFamilyHouse1':
      case 'singleFamilyHouse2':
      case 'singleFamilyHouse3':
        return <SingleFamilyHouse variant={object.type} />;
      case 'rv':
        return <RV />;
      case 'deerBlind':
        return <DeerBlind />;
      case 'bridge':
        return <Bridge />;
      default:
        return null;
    }
  };

  return (
    <>
      <group
        ref={groupRef}
        position={object.position}
        rotation={object.rotation}
        scale={object.scale}
        onClick={handleClick}
      >
        {renderModel()}
      </group>

      {isSelected && groupRef.current && (
        <TransformControls
          object={groupRef.current}
          mode="translate"
          onChange={handleTransform}
        />
      )}
    </>
  );
}
