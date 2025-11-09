import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Float,
  MeshDistortMaterial,
  Sphere,
  Torus,
  Points,
  PointMaterial,
  Sparkles,
  Environment,
  Lightformer,
  useGLTF
} from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { MathUtils, Color } from 'three';

const PALETTES = {
  iphone: { base: '#ff8a8a', secondary: '#ffd36b', accent: '#8ae6ff' },
  tshirt: { base: '#ffd36b', secondary: '#ff8a8a', accent: '#8ae6ff' },
  car: { base: '#8ae6ff', secondary: '#a08aff', accent: '#ffd36b' },
  hamburger: { base: '#ff9bf5', secondary: '#ffd36b', accent: '#ff8a8a' },
  television: { base: '#a08aff', secondary: '#8ae6ff', accent: '#ffd36b' },
  fridge: { base: '#8ae6ff', secondary: '#ff9bf5', accent: '#ffd36b' }
};

function InteractiveRig({ children }) {
  const group = useRef();
  const { pointer } = useThree();

  useFrame((_, delta) => {
    if (!group.current) return;

    const targetX = pointer.x * 0.4;
    const targetY = pointer.y * 0.25;

    group.current.rotation.y = MathUtils.damp(group.current.rotation.y, targetX, 2.8, delta);
    group.current.rotation.x = MathUtils.damp(group.current.rotation.x, -targetY, 2.4, delta);
    group.current.position.y = MathUtils.damp(group.current.position.y, pointer.y * 0.3, 2.2, delta);
  });

  return <group ref={group}>{children}</group>;
}

function ParticleHalo({ color }) {
  const group = useRef();
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

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.18;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.08;
  });

  return (
    <group ref={group}>
      <Points positions={positions} stride={3}>
        <PointMaterial transparent color={color} size={0.015} sizeAttenuation depthWrite={false} />
      </Points>
    </group>
  );
}

function SwirlField({ color }) {
  const group = useRef();
  const positions = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 800; i += 1) {
      const theta = (i / 80) * Math.PI * 1.2;
      const radius = 0.6 + (i % 40) * 0.01;
      const y = Math.sin(theta * 1.4) * 0.45;
      pts.push(Math.cos(theta) * radius, y, Math.sin(theta) * radius);
    }
    return new Float32Array(pts);
  }, []);

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y -= delta * 0.25;
  });

  return (
    <group ref={group}>
      <Points positions={positions} stride={3}>
        <PointMaterial transparent color={color} size={0.01} sizeAttenuation depthWrite={false} />
      </Points>
    </group>
  );
}

function GroundShadow({ radius = 3.6, color = '#05060f', opacity = 0.4 }) {
  const mesh = useRef();

  useFrame((state, delta) => {
    if (!mesh.current) return;
    const targetOpacity = 0.35 + Math.sin(state.clock.elapsedTime * 2) * 0.03;
    mesh.current.material.opacity = MathUtils.damp(mesh.current.material.opacity, targetOpacity, 3, delta);
  });

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
      <circleGeometry args={[radius, 64]} />
      <meshBasicMaterial color={color} opacity={opacity} transparent />
    </mesh>
  );
}

function useHoverDampedRotation(ref, intensity = 0.35) {
  const { pointer } = useThree();
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y = MathUtils.damp(ref.current.rotation.y, pointer.x * intensity, 2.8, delta);
    ref.current.rotation.x = MathUtils.damp(ref.current.rotation.x, -pointer.y * intensity * 0.6, 2.4, delta);
  });
}

function ElectricCarScene({ colors }) {
  const car = useGLTF('/models/electric-car.glb');
  const group = useRef();
  const chassis = useRef();

  useHoverDampedRotation(group, 0.25);

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const driveProgress = Math.min(t / 1.4, 1);
    group.current.position.z = MathUtils.damp(group.current.position.z, -1.8 * (1 - driveProgress), 2.2, delta);
    group.current.position.x = MathUtils.damp(group.current.position.x, Math.sin(t * 0.4) * 0.08, 3, delta);
    group.current.rotation.z = MathUtils.damp(group.current.rotation.z, Math.sin(t * 0.6) * 0.01, 4, delta);

    if (chassis.current) {
      chassis.current.rotation.x = MathUtils.damp(chassis.current.rotation.x, Math.sin(t * 1.2) * 0.005, 6, delta);
      chassis.current.rotation.y = MathUtils.damp(chassis.current.rotation.y, Math.sin(t * 0.6) * 0.01, 6, delta);
    }
  });

  useEffect(() => {
    if (!car || !car.scene) return;
    car.scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material.metalness = Math.min(child.material.metalness ?? 0.6, 0.8);
        child.material.roughness = Math.max(child.material.roughness ?? 0.2, 0.12);
      }
    });
  }, [car]);

  return (
    <group ref={group} position={[0, -0.8, 0]} scale={1.05}>
      <group ref={chassis}>
        <primitive object={car.scene} />
      </group>
      <GroundShadow radius={3.8} color={colors.base} opacity={0.28} />
    </group>
  );
}

function TShirtScene({ colors }) {
  const { scene, nodes } = useGLTF('/models/tshirt-soft.glb');
  const group = useRef();
  const cloth = useRef();

  useHoverDampedRotation(group, 0.3);

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.position.y = Math.sin(t * 0.7) * 0.12;
    group.current.rotation.z = Math.sin(t * 0.45) * 0.05;

    if (cloth.current) {
      cloth.current.morphTargetInfluences?.forEach((_, idx, array) => {
        array[idx] = 0.4 + Math.sin(t * 1.6 + idx * 0.6) * 0.05;
      });
    }
  });

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material.roughness = 0.6;
        child.material.metalness = 0.05;
      }
    });
    const clothMesh = nodes?.Cloth || scene;
    if (clothMesh?.isMesh) {
      cloth.current = clothMesh;
    }
  }, [nodes, scene]);

  return (
    <group ref={group} position={[0, -0.3, 0]} scale={1.2}>
      <primitive object={scene} />
      <GroundShadow radius={3} color={colors.secondary} opacity={0.25} />
    </group>
  );
}

function IPhoneScene({ colors }) {
  const { scene, nodes } = useGLTF('/models/iphone-pro.glb');
  const group = useRef();
  const glass = useRef();
  const back = useRef();

  useHoverDampedRotation(group, 0.35);

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.position.y = MathUtils.damp(group.current.position.y, Math.sin(t * 1.1) * 0.14, 3, delta);
    group.current.rotation.y = MathUtils.damp(group.current.rotation.y, Math.sin(t * 0.6) * 0.15, 4.2, delta);
    group.current.rotation.z = MathUtils.damp(group.current.rotation.z, Math.sin(t * 0.4) * 0.08, 5, delta);

    const shimmer = 0.2 + Math.sin(t * 2.6) * 0.05;
    if (glass.current) glass.current.material.opacity = MathUtils.clamp(0.8 + shimmer * 0.2, 0.75, 0.95);
    if (back.current) back.current.material.metalness = 0.85 + shimmer * 0.1;
  });

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    glass.current = nodes?.Glass;
    back.current = nodes?.Housing;
  }, [nodes, scene]);

  return (
    <group ref={group} position={[0, -0.5, 0]} scale={1.18}>
      <primitive object={scene} />
      <GroundShadow radius={2.4} color={colors.accent} opacity={0.22} />
    </group>
  );
}

function HamburgerScene({ colors }) {
  const burger = useGLTF('/models/hamburger-stack.glb');
  const group = useRef();
  const layers = useRef([]);

  useHoverDampedRotation(group, 0.28);

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.position.y = Math.sin(t * 0.8) * 0.06;
    group.current.rotation.x = MathUtils.damp(group.current.rotation.x, Math.sin(t * 0.5) * 0.05, 4, delta);

    layers.current.forEach((layer, index) => {
      if (!layer) return;
      const offset = index * 0.05;
      layer.position.y = MathUtils.damp(layer.position.y, offset + Math.sin(t * 1.6 + offset * 6) * 0.04, 6, delta);
      layer.rotation.z = Math.sin(t * 2 + index * 0.3) * 0.02;
    });
  });

  useEffect(() => {
    const orderedLayers = [];
    burger.scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        orderedLayers.push(child);
      }
    });
    layers.current = orderedLayers.sort((a, b) => a.position.y - b.position.y);
  }, [burger]);

  return (
    <group ref={group} position={[0, -0.8, 0]} scale={1.4}>
      <primitive object={burger.scene} />
      <GroundShadow radius={2.6} color={colors.secondary} opacity={0.3} />
    </group>
  );
}

function TelevisionScene({ colors }) {
  const { scene, nodes } = useGLTF('/models/television-retro.glb');
  const group = useRef();
  const screen = useRef();
  const glow = useRef();

  useHoverDampedRotation(group, 0.22);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (glow.current) {
      const intensity = 0.4 + Math.sin(t * 5) * 0.1;
      glow.current.material.opacity = MathUtils.damp(glow.current.material.opacity, intensity, 4, delta);
    }
    if (screen.current) {
      const emissiveIntensity = 1.2 + Math.sin(t * 4) * 0.15;
      screen.current.material.emissiveIntensity = MathUtils.damp(
        screen.current.material.emissiveIntensity,
        emissiveIntensity,
        6,
        delta
      );
    }
    if (group.current) {
      group.current.rotation.z = MathUtils.damp(group.current.rotation.z, Math.sin(t * 0.7) * 0.02, 4, delta);
      group.current.position.y = MathUtils.damp(group.current.position.y, Math.sin(t * 0.9) * 0.04 - 0.2, 3, delta);
    }
  });

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    screen.current = nodes?.Screen;
  }, [nodes, scene]);

  return (
    <group ref={group} position={[0, -0.9, 0]} scale={1.2}>
      <primitive object={scene} />
      <mesh ref={glow} position={[0, 0.55, -0.1]}>
        <planeGeometry args={[1.6, 1.1]} />
        <meshBasicMaterial color={new Color(colors.accent).lerp(new Color('#ffffff'), 0.35)} transparent opacity={0.4} />
      </mesh>
      <GroundShadow radius={3.2} color={colors.base} opacity={0.32} />
    </group>
  );
}

function FridgeScene({ colors }) {
  const { scene, nodes } = useGLTF('/models/fridge-modern.glb');
  const group = useRef();
  const door = useRef();
  const interiorLight = useRef();

  useHoverDampedRotation(group, 0.2);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const openProgress = (Math.sin(t * 0.7) + 1) / 2; // 0 → 1 → 0 looping
    if (door.current) {
      door.current.rotation.y = MathUtils.damp(door.current.rotation.y, MathUtils.degToRad(55) * openProgress, 5, delta);
    }
    if (interiorLight.current) {
      interiorLight.current.material.emissiveIntensity = MathUtils.damp(
        interiorLight.current.material.emissiveIntensity,
        0.8 + openProgress * 1.4,
        4,
        delta
      );
    }
    if (group.current) {
      group.current.position.y = MathUtils.damp(group.current.position.y, -0.6 + openProgress * 0.05, 3, delta);
    }
  });

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    door.current = nodes?.Door || scene.getObjectByName('Door');
    interiorLight.current = nodes?.InteriorLight || scene.getObjectByName('InteriorLight');
  }, [nodes, scene]);

  return (
    <group ref={group} position={[0, -1, 0]} scale={1.3}>
      <primitive object={scene} />
      <GroundShadow radius={3.5} color={colors.secondary} opacity={0.3} />
    </group>
  );
}

const ENABLED_PRODUCT_MODELS = import.meta.env?.VITE_ENABLE_PRODUCT_MODELS === 'true';

function ProductCanvas({ slug, palette }) {
  const colors = palette ?? PALETTES[slug] ?? PALETTES.iphone;
  const SceneBySlug =
    ENABLED_PRODUCT_MODELS &&
    {
      car: ElectricCarScene,
      tshirt: TShirtScene,
      iphone: IPhoneScene,
      hamburger: HamburgerScene,
      television: TelevisionScene,
      fridge: FridgeScene
    }[slug];

  return (
    <Canvas camera={{ position: [0, 0.45, 4.1], fov: 52 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
      <color attach="background" args={['transparent']} />
      <ambientLight intensity={0.6} color={colors.secondary} />
      <directionalLight position={[3.5, 2.5, 5]} intensity={0.75} color={colors.accent} />
      <spotLight
        position={[-2.5, 2.2, 2.5]}
        intensity={0.55}
        angle={0.7}
        penumbra={0.8}
        color={colors.base}
        castShadow
      />
      <Environment frames={60} resolution={64}>
        <group rotation={[0, Math.PI / 4, 0]}>
          <Lightformer
            intensity={0.9}
            rotation={[0, Math.PI / 2, 0]}
            position={[-5, 1, 0]}
            scale={[10, 10, 1]}
          />
          <Lightformer intensity={0.4} rotation={[Math.PI / 4, 0, 0]} position={[0, 4, -6]} scale={[10, 10, 1]} />
        </group>
      </Environment>

      <Suspense
        fallback={
          <InteractiveRig>
            <Float speed={1.7} rotationIntensity={0.65} floatIntensity={0.45}>
              <Sphere args={[1, 64, 64]} scale={[1.32, 1.12, 1.38]}>
                <MeshDistortMaterial
                  color={colors.base}
                  roughness={0.12}
                  metalness={0.35}
                  distort={0.42}
                  speed={2.4}
                />
              </Sphere>
            </Float>
            <Float position={[0, -0.35, 0]} speed={1.3} rotationIntensity={0.5} floatIntensity={0.32}>
              <Torus args={[1.9, 0.085, 48, 220]} rotation={[Math.PI / 2, 0, 0]}>
                <meshStandardMaterial
                  color={colors.secondary}
                  emissive={colors.secondary}
                  emissiveIntensity={0.4}
                  metalness={1}
                  roughness={0.2}
                />
              </Torus>
            </Float>
            <Float position={[0, 0.95, 0]} speed={2.05} rotationIntensity={0.65} floatIntensity={0.28}>
              <Torus args={[1.1, 0.05, 48, 180]}>
                <meshStandardMaterial
                  color={colors.accent}
                  emissive={colors.accent}
                  emissiveIntensity={0.5}
                  metalness={1}
                  roughness={0.16}
                />
              </Torus>
            </Float>
            <Sparkles count={85} speed={0.35} opacity={0.85} color={colors.accent} scale={[4, 3, 4]} size={3} />
            <SwirlField color={colors.secondary} />
            <ParticleHalo color={colors.accent} />
          </InteractiveRig>
        }
      >
        {SceneBySlug ? (
          <InteractiveRig>
            <SceneBySlug colors={colors} />
            <Sparkles count={65} speed={0.25} opacity={0.6} color={colors.accent} scale={[3.6, 3, 3.6]} size={2.4} />
            <ParticleHalo color={colors.accent} />
          </InteractiveRig>
        ) : (
          <InteractiveRig>
            <Float speed={1.7} rotationIntensity={0.65} floatIntensity={0.45}>
              <Sphere args={[1, 64, 64]} scale={[1.32, 1.12, 1.38]}>
                <MeshDistortMaterial
                  color={colors.base}
                  roughness={0.12}
                  metalness={0.35}
                  distort={0.42}
                  speed={2.4}
                />
              </Sphere>
            </Float>
            <Float position={[0, -0.35, 0]} speed={1.3} rotationIntensity={0.5} floatIntensity={0.32}>
              <Torus args={[1.9, 0.085, 48, 220]} rotation={[Math.PI / 2, 0, 0]}>
                <meshStandardMaterial
                  color={colors.secondary}
                  emissive={colors.secondary}
                  emissiveIntensity={0.4}
                  metalness={1}
                  roughness={0.2}
                />
              </Torus>
            </Float>
            <Float position={[0, 0.95, 0]} speed={2.05} rotationIntensity={0.65} floatIntensity={0.28}>
              <Torus args={[1.1, 0.05, 48, 180]}>
                <meshStandardMaterial
                  color={colors.accent}
                  emissive={colors.accent}
                  emissiveIntensity={0.5}
                  metalness={1}
                  roughness={0.16}
                />
              </Torus>
            </Float>
            <Sparkles count={85} speed={0.35} opacity={0.85} color={colors.accent} scale={[4, 3, 4]} size={3} />
            <SwirlField color={colors.secondary} />
            <ParticleHalo color={colors.accent} />
          </InteractiveRig>
        )}
      </Suspense>
    </Canvas>
  );
}

export default ProductCanvas;

if (ENABLED_PRODUCT_MODELS) {
  useGLTF.preload('/models/electric-car.glb');
  useGLTF.preload('/models/tshirt-soft.glb');
  useGLTF.preload('/models/iphone-pro.glb');
  useGLTF.preload('/models/hamburger-stack.glb');
  useGLTF.preload('/models/television-retro.glb');
  useGLTF.preload('/models/fridge-modern.glb');
}
