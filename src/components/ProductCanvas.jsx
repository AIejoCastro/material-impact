
import { Canvas } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Torus, Points, PointMaterial } from '@react-three/drei';
import { useMemo } from 'react';

const PALETTES = {
  iphone: { base: '#ff8a8a', secondary: '#ffd36b', accent: '#8ae6ff' },
  tshirt: { base: '#ffd36b', secondary: '#ff8a8a', accent: '#8ae6ff' },
  car: { base: '#8ae6ff', secondary: '#a08aff', accent: '#ffd36b' },
  hamburger: { base: '#ff9bf5', secondary: '#ffd36b', accent: '#ff8a8a' },
  television: { base: '#a08aff', secondary: '#8ae6ff', accent: '#ffd36b' },
  fridge: { base: '#8ae6ff', secondary: '#ff9bf5', accent: '#ffd36b' }
};

function ParticleHalo({ color }) {
  const positions = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 1200; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.2 + Math.random() * 0.8;
      const y = (Math.random() - 0.5) * 1.2;
      pts.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    }
    return new Float32Array(pts);
  }, []);

  return (
    <Points positions={positions} stride={3}>
      <PointMaterial transparent color={color} size={0.02} sizeAttenuation depthWrite={false} />
    </Points>
  );
}

function ProductCanvas({ slug }) {
  const palette = PALETTES[slug] ?? PALETTES.iphone;

  return (
    <Canvas camera={{ position: [0, 0.5, 4], fov: 55 }}>
      <color attach="background" args={['transparent']} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 2, 4]} intensity={0.7} />
      <Float speed={1.8} rotationIntensity={0.6} floatIntensity={0.4}>
        <Sphere args={[1, 64, 64]} scale={[1.25, 1.15, 1.35]}>
          <MeshDistortMaterial
            color={palette.base}
            roughness={0.15}
            metalness={0.3}
            distort={0.35}
            speed={2}
          />
        </Sphere>
      </Float>
      <Float position={[0, -0.4, 0]} speed={1.2} rotationIntensity={0.4} floatIntensity={0.3}>
        <Torus args={[1.8, 0.08, 32, 200]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial
            color={palette.secondary}
            emissive={palette.secondary}
            emissiveIntensity={0.35}
            metalness={1}
            roughness={0.25}
          />
        </Torus>
      </Float>
      <Float position={[0, 0.9, 0]} speed={2.1} rotationIntensity={0.5} floatIntensity={0.25}>
        <Torus args={[0.95, 0.06, 32, 160]}>
          <meshStandardMaterial
            color={palette.accent}
            emissive={palette.accent}
            emissiveIntensity={0.4}
            metalness={1}
            roughness={0.2}
          />
        </Torus>
      </Float>
      <ParticleHalo color={palette.accent} />
    </Canvas>
  );
}

export default ProductCanvas;
