export function DoubleWideMobileHome() {
  return (
    <group>
      {/* Main body */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[8, 3, 14]} />
        <meshStandardMaterial color="#d4c4a8" roughness={0.7} />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 3.2, 0]} castShadow>
        <boxGeometry args={[8.2, 0.4, 14.2]} />
        <meshStandardMaterial color="#6b4423" roughness={0.8} />
      </mesh>

      {/* Windows - Front side */}
      {[-5, -2, 1, 4].map((z, i) => (
        <group key={`front-${i}`}>
          <mesh position={[4.01, 2, z]} castShadow>
            <boxGeometry args={[0.02, 1.2, 1.5]} />
            <meshStandardMaterial color="#4d9de0" metalness={0.5} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* Windows - Back side */}
      {[-5, -2, 1, 4].map((z, i) => (
        <group key={`back-${i}`}>
          <mesh position={[-4.01, 2, z]} castShadow>
            <boxGeometry args={[0.02, 1.2, 1.5]} />
            <meshStandardMaterial color="#4d9de0" metalness={0.5} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* Front door */}
      <mesh position={[4.01, 1, 6.5]} castShadow>
        <boxGeometry args={[0.05, 2, 1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Steps */}
      <mesh position={[4.8, 0.25, 6.5]} castShadow>
        <boxGeometry args={[0.6, 0.5, 1.5]} />
        <meshStandardMaterial color="#808080" />
      </mesh>

      {/* AC unit */}
      <mesh position={[0, 3.6, 0]} castShadow>
        <boxGeometry args={[1, 0.4, 1]} />
        <meshStandardMaterial color="#a0a0a0" metalness={0.6} />
      </mesh>
    </group>
  );
}
