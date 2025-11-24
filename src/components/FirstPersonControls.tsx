import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function FirstPersonControls() {
  const { camera, gl } = useThree();
  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    run: false,
  });

  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const isLocked = useRef(false);

  useEffect(() => {
    const canvas = gl.domElement;

    // Request pointer lock on click
    const handleClick = () => {
      canvas.requestPointerLock();
    };

    // Track pointer lock state
    const handlePointerLockChange = () => {
      isLocked.current = document.pointerLockElement === canvas;
    };

    // Mouse movement for looking around
    const handleMouseMove = (event: MouseEvent) => {
      if (!isLocked.current) return;

      const movementX = event.movementX || 0;
      const movementY = event.movementY || 0;

      euler.current.setFromQuaternion(camera.quaternion);
      euler.current.y -= movementX * 0.002;
      euler.current.x -= movementY * 0.002;
      euler.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.current.x));
      camera.quaternion.setFromEuler(euler.current);
    };

    // Keyboard controls
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveState.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          moveState.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          moveState.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          moveState.current.right = true;
          break;
        case 'Space':
          moveState.current.jump = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          moveState.current.run = true;
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveState.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          moveState.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          moveState.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          moveState.current.right = false;
          break;
        case 'Space':
          moveState.current.jump = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          moveState.current.run = false;
          break;
      }
    };

    canvas.addEventListener('click', handleClick);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Set initial camera position for first-person view
    camera.position.set(0, 1.7, 10);

    return () => {
      canvas.removeEventListener('click', handleClick);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [camera, gl]);

  useFrame((_state, delta) => {
    if (!isLocked.current) return;

    const speed = moveState.current.run ? 15 : 7;

    velocity.current.x -= velocity.current.x * 10.0 * delta;
    velocity.current.z -= velocity.current.z * 10.0 * delta;

    direction.current.z = Number(moveState.current.forward) - Number(moveState.current.backward);
    direction.current.x = Number(moveState.current.right) - Number(moveState.current.left);
    direction.current.normalize();

    if (moveState.current.forward || moveState.current.backward) {
      velocity.current.z -= direction.current.z * speed * delta;
    }
    if (moveState.current.left || moveState.current.right) {
      velocity.current.x -= direction.current.x * speed * delta;
    }

    // Apply movement
    const moveVector = new THREE.Vector3();
    moveVector.setFromMatrixColumn(camera.matrix, 0);
    moveVector.crossVectors(camera.up, moveVector);
    camera.position.addScaledVector(moveVector, velocity.current.z);

    const strafeVector = new THREE.Vector3();
    strafeVector.setFromMatrixColumn(camera.matrix, 0);
    camera.position.addScaledVector(strafeVector, velocity.current.x);

    // Keep camera above ground
    if (camera.position.y < 1.7) {
      camera.position.y = 1.7;
    }
  });

  return null;
}
