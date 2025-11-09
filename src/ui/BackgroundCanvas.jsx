import { Canvas, useFrame } from '@react-three/fiber';
import { GradientTexture, Float, Points, PointMaterial } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import './BackgroundCanvas.css';

const COLOR_STOPS = [
  '#ff8a8a',
  '#ffd36b',
  '#8ae6ff',
  '#a08aff',
  '#ff9bf5'
];

function GradientPlane() {
  return (
    <mesh scale={12} rotation-x={-Math.PI / 2}>
      <planeGeometry args={[10, 10]} />
      <meshBasicMaterial toneMapped={false}>
        <GradientTexture stops={[0, 0.25, 0.5, 0.75, 1]} colors={COLOR_STOPS} />
      </meshBasicMaterial>
    </mesh>
  );
}

function ParticleSwarm() {
  const ref = useRef();
  const positions = useMemo(() => {
    const particles = [];
    for (let i = 0; i < 2000; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.5 + Math.random() * 3.5;
      const height = (Math.random() - 0.5) * 3;
      particles.push(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      );
    }
    return new Float32Array(particles);
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.y = t * 0.05;
      ref.current.position.y = Math.sin(t * 0.3) * 0.2;
    }
  });

  return (
    <group ref={ref}>
      <Points positions={positions} stride={3}>
        <PointMaterial
          transparent
          color="#ffffff"
          size={0.04}
          sizeAttenuation
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

function LightRings() {
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color('#ffffff').multiplyScalar(0.3),
        transparent: true,
        opacity: 0.5
      }),
    []
  );

  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      {[1.5, 2.5, 3.5, 4.5].map((radius, index) => (
        <mesh key={radius} material={material}>
          <torusGeometry args={[radius, 0.04, 32, 200]} />
          <Float
            speed={1 + index * 0.3}
            rotationIntensity={0.35}
            floatIntensity={0.1}
          >
            <primitive object={material} attach="material" />
          </Float>
        </mesh>
      ))}
    </group>
  );
}

function BackgroundScene() {
  return (
    <>
      <GradientPlane />
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 4, 2]} intensity={0.6} />
      <ParticleSwarm />
      <LightRings />
    </>
  );
}

function BackgroundCanvas() {
  return (
    <div className="background-canvas">
      <Canvas camera={{ position: [0, 2.5, 6], fov: 50 }}>
        <color attach="background" args={['#020312']} />
        <fog attach="fog" args={['#020312', 5, 18]} />
        <BackgroundScene />
      </Canvas>
      <div className="background-overlay" />
    </div>
  );
}

export default BackgroundCanvas;

