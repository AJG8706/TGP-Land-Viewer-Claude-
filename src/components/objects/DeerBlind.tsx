export function DeerBlind() {
  return (
    <group>
      {/* Support legs */}
      {[
        [-1.2, -1.2],
        [1.2, -1.2],
        [-1.2, 1.2],
        [1.2, 1.2],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 2, z]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 4, 8]} />
          <meshStandardMaterial color="#654321" roughness={0.9} />
        </mesh>
      ))}

      {/* Cross braces */}
      <mesh position={[0, 2, -1.2]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[3.5, 0.08, 0.08]} />
        <meshStandardMaterial color="#654321" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2, 1.2]} rotation={[0, 0, -Math.PI / 4]} castShadow>
        <boxGeometry args={[3.5, 0.08, 0.08]} />
        <meshStandardMaterial color="#654321" roughness={0.9} />
      </mesh>

      {/* Platform */}
      <mesh position={[0, 4, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 0.2, 3]} />
        <meshStandardMaterial color="#8b7355" roughness={0.9} />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 5, -1.5]} castShadow>
        <boxGeometry args={[3, 2, 0.1]} />
        <meshStandardMaterial color="#8b7355" roughness={0.9} />
      </mesh>
      <mesh position={[-1.5, 5, 0]} castShadow>
        <boxGeometry args={[0.1, 2, 3]} />
        <meshStandardMaterial color="#8b7355" roughness={0.9} />
      </mesh>
      <mesh position={[1.5, 5, 0]} castShadow>
        <boxGeometry args={[0.1, 2, 3]} />
        <meshStandardMaterial color="#8b7355" roughness={0.9} />
      </mesh>

      {/* Front wall with window */}
      <mesh position={[0, 5.5, 1.5]} castShadow>
        <boxGeometry args={[3, 1, 0.1]} />
        <meshStandardMaterial color="#8b7355" roughness={0.9} />
      </mesh>
      <mesh position={[0, 4.5, 1.5]} castShadow>
        <boxGeometry args={[1, 1, 0.1]} />
        <meshStandardMaterial color="#8b7355" roughness={0.9} />
      </mesh>
      <mesh position={[-1, 4.5, 1.5]} castShadow>
        <boxGeometry args={[1, 1, 0.1]} />
        <meshStandardMaterial color="#8b7355" roughness={0.9} />
      </mesh>
      <mesh position={[1, 4.5, 1.5]} castShadow>
        <boxGeometry args={[1, 1, 0.1]} />
        <meshStandardMaterial color="#8b7355" roughness={0.9} />
      </mesh>

      {/* Window opening */}
      <mesh position={[0, 4.5, 1.52]} castShadow>
        <boxGeometry args={[1.5, 0.8, 0.05]} />
        <meshStandardMaterial color="#4d9de0" metalness={0.5} roughness={0.1} transparent opacity={0.5} />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 6.3, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[2.2, 0.8, 4]} />
        <meshStandardMaterial color="#654321" roughness={0.9} />
      </mesh>

      {/* Ladder */}
      {[0, 0.8, 1.6, 2.4, 3.2].map((y, i) => (
        <mesh key={i} position={[0, y, -1.6]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
          <meshStandardMaterial color="#654321" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[-0.4, 2, -1.6]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 4, 8]} />
        <meshStandardMaterial color="#654321" roughness={0.9} />
      </mesh>
      <mesh position={[0.4, 2, -1.6]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 4, 8]} />
        <meshStandardMaterial color="#654321" roughness={0.9} />
      </mesh>
    </group>
  );
}
