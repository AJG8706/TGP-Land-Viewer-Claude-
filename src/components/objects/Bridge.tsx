export function Bridge() {
  return (
    <group>
      {/* Main deck */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 0.3, 10]} />
        <meshStandardMaterial color="#8b7355" roughness={0.9} />
      </mesh>

      {/* Deck planks (detail) */}
      {Array.from({ length: 20 }).map((_, i) => {
        const z = -4.5 + i * 0.5;
        return (
          <mesh key={i} position={[0, 0.46, z]} castShadow>
            <boxGeometry args={[2, 0.02, 0.4]} />
            <meshStandardMaterial color="#6b5345" roughness={0.95} />
          </mesh>
        );
      })}

      {/* Support beams underneath */}
      {[-0.7, 0, 0.7].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} castShadow>
          <boxGeometry args={[0.2, 0.5, 10]} />
          <meshStandardMaterial color="#654321" roughness={0.9} />
        </mesh>
      ))}

      {/* Side rails */}
      <group>
        {/* Left rail posts */}
        {[-4, -2, 0, 2, 4].map((z, i) => (
          <mesh key={`left-post-${i}`} position={[-1.1, 0.8, z]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 1.6, 8]} />
            <meshStandardMaterial color="#654321" roughness={0.9} />
          </mesh>
        ))}
        {/* Left top rail */}
        <mesh position={[-1.1, 1.5, 0]} castShadow>
          <boxGeometry args={[0.1, 0.1, 10]} />
          <meshStandardMaterial color="#654321" roughness={0.9} />
        </mesh>
        {/* Left mid rail */}
        <mesh position={[-1.1, 0.9, 0]} castShadow>
          <boxGeometry args={[0.08, 0.08, 10]} />
          <meshStandardMaterial color="#654321" roughness={0.9} />
        </mesh>

        {/* Right rail posts */}
        {[-4, -2, 0, 2, 4].map((z, i) => (
          <mesh key={`right-post-${i}`} position={[1.1, 0.8, z]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 1.6, 8]} />
            <meshStandardMaterial color="#654321" roughness={0.9} />
          </mesh>
        ))}
        {/* Right top rail */}
        <mesh position={[1.1, 1.5, 0]} castShadow>
          <boxGeometry args={[0.1, 0.1, 10]} />
          <meshStandardMaterial color="#654321" roughness={0.9} />
        </mesh>
        {/* Right mid rail */}
        <mesh position={[1.1, 0.9, 0]} castShadow>
          <boxGeometry args={[0.08, 0.08, 10]} />
          <meshStandardMaterial color="#654321" roughness={0.9} />
        </mesh>
      </group>

      {/* Entry ramps at both ends */}
      <mesh position={[0, -0.15, -5.5]} rotation={[-Math.PI / 8, 0, 0]} castShadow>
        <boxGeometry args={[2, 0.2, 1]} />
        <meshStandardMaterial color="#8b7355" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.15, 5.5]} rotation={[Math.PI / 8, 0, 0]} castShadow>
        <boxGeometry args={[2, 0.2, 1]} />
        <meshStandardMaterial color="#8b7355" roughness={0.9} />
      </mesh>
    </group>
  );
}
