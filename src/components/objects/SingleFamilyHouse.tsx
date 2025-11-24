interface SingleFamilyHouseProps {
  variant: 'singleFamilyHouse1' | 'singleFamilyHouse2' | 'singleFamilyHouse3';
}

export function SingleFamilyHouse({ variant }: SingleFamilyHouseProps) {
  const colors = {
    singleFamilyHouse1: { body: '#f5e6d3', roof: '#8b0000', trim: '#ffffff' },
    singleFamilyHouse2: { body: '#e8dcc0', roof: '#2f4f4f', trim: '#ffffff' },
    singleFamilyHouse3: { body: '#d4c4a8', roof: '#4a4a4a', trim: '#f0f0f0' },
  };

  const color = colors[variant];

  return (
    <group>
      {/* Main body */}
      <mesh position={[0, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[10, 4, 10]} />
        <meshStandardMaterial color={color.body} roughness={0.7} />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 4.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[7, 2, 4]} />
        <meshStandardMaterial color={color.roof} roughness={0.8} />
      </mesh>

      {/* Garage */}
      <mesh position={[5, 1.5, 2]} castShadow receiveShadow>
        <boxGeometry args={[4, 3, 6]} />
        <meshStandardMaterial color={color.body} roughness={0.7} />
      </mesh>

      {/* Garage door */}
      <mesh position={[7.01, 1.5, 2]} castShadow>
        <boxGeometry args={[0.05, 2.5, 5]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Front door */}
      <mesh position={[5.01, 1, -2]} castShadow>
        <boxGeometry args={[0.05, 2, 1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Windows */}
      {[-3, 0, 3].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 2.5, 5.01]} castShadow>
            <boxGeometry args={[1.5, 1.5, 0.02]} />
            <meshStandardMaterial color="#4d9de0" metalness={0.5} roughness={0.1} />
          </mesh>
          <mesh position={[x, 2.5, -5.01]} castShadow>
            <boxGeometry args={[1.5, 1.5, 0.02]} />
            <meshStandardMaterial color="#4d9de0" metalness={0.5} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* Chimney */}
      <mesh position={[-3, 5.5, -3]} castShadow>
        <boxGeometry args={[0.8, 3, 0.8]} />
        <meshStandardMaterial color="#8b4513" roughness={0.9} />
      </mesh>

      {/* Porch */}
      <mesh position={[6.5, 0.1, -2]} receiveShadow>
        <boxGeometry args={[3, 0.2, 3]} />
        <meshStandardMaterial color={color.trim} roughness={0.8} />
      </mesh>
    </group>
  );
}
