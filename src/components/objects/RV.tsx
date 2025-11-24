export function RV() {
  return (
    <group>
      {/* Main body */}
      <mesh position={[0, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 3.5, 8]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Cab/Front */}
      <mesh position={[0, 2, 4.5]} castShadow>
        <boxGeometry args={[3, 3, 1]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Windshield */}
      <mesh position={[0, 2.8, 5]} castShadow>
        <boxGeometry args={[2.5, 1.5, 0.05]} />
        <meshStandardMaterial color="#4d9de0" metalness={0.5} roughness={0.1} />
      </mesh>

      {/* Side windows */}
      {[-2, 0, 2].map((z, i) => (
        <group key={i}>
          <mesh position={[1.51, 2.5, z]} castShadow>
            <boxGeometry args={[0.02, 1, 1.5]} />
            <meshStandardMaterial color="#4d9de0" metalness={0.5} roughness={0.1} />
          </mesh>
          <mesh position={[-1.51, 2.5, z]} castShadow>
            <boxGeometry args={[0.02, 1, 1.5]} />
            <meshStandardMaterial color="#4d9de0" metalness={0.5} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* Wheels */}
      {[-2.5, -0.5, 1.5, 3.5].map((z, i) => (
        <group key={i}>
          <mesh position={[1.6, 0.4, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
          </mesh>
          <mesh position={[-1.6, 0.4, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Door */}
      <mesh position={[-1.51, 1.5, -2]} castShadow>
        <boxGeometry args={[0.05, 2, 0.8]} />
        <meshStandardMaterial color="#808080" metalness={0.3} />
      </mesh>

      {/* AC unit on top */}
      <mesh position={[0, 3.9, 0]} castShadow>
        <boxGeometry args={[1.5, 0.3, 1.5]} />
        <meshStandardMaterial color="#a0a0a0" metalness={0.6} />
      </mesh>

      {/* Stripe decal */}
      <mesh position={[1.52, 2, 0]} castShadow>
        <boxGeometry args={[0.01, 0.3, 6]} />
        <meshStandardMaterial color="#ff6b6b" />
      </mesh>
      <mesh position={[-1.52, 2, 0]} castShadow>
        <boxGeometry args={[0.01, 0.3, 6]} />
        <meshStandardMaterial color="#ff6b6b" />
      </mesh>
    </group>
  );
}
