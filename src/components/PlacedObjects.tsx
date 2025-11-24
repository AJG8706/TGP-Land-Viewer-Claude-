import { useAppStore } from '../hooks/useAppStore';
import { Object3D } from './objects/Object3D';

export function PlacedObjects() {
  const placedObjects = useAppStore((state) => state.placedObjects);

  return (
    <>
      {placedObjects.map((obj) => (
        <Object3D key={obj.id} object={obj} />
      ))}
    </>
  );
}
