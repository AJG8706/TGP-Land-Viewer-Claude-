export function SingleWideMobileHome() {
  return (
    <group>
      {/* Main body */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 3, 12]} />
        <meshStandardMaterial color="#e8d4a8" roughness={0.7} />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 3.2, 0]} castShadow>
        <boxGeometry args={[4.2, 0.4, 12.2]} />
        <meshStandardMaterial color="#8b4513" roughness={0.8} />
      </mesh>

      {/* Windows */}
      {[-4, -1, 2, 5].map((z, i) => (
        <group key={i}>
          <mesh position={[2.01, 2, z]} castShadow>
            <boxGeometry args={[0.02, 1, 1]} />
            <meshStandardMaterial color="#4d9de0" metalness={0.5} roughness={0.1} />
          </mesh>
          <mesh position={[-2.01, 2, z]} castShadow>
            <boxGeometry args={[0.02, 1, 1]} />
            <meshStandardMaterial color="#4d9de0" metalness={0.5} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* Door */}
      <mesh position={[2.01, 1, 5.5]} castShadow>
        <boxGeometry args={[0.05, 2, 1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Steps */}
      <mesh position={[2.8, 0.25, 5.5]} castShadow>
        <boxGeometry args={[0.5, 0.5, 1.2]} />
        <meshStandardMaterial color="#808080" />
      </mesh>
    </group>
  );
}
