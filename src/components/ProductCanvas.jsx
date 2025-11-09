import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  AdaptiveDpr,
  Environment,
  Float,
  Lightformer,
  MeshDistortMaterial,
  PointMaterial,
  Points,
  Sparkles,
  Sphere,
  Torus,
  useGLTF
} from '@react-three/drei';
import { getGPUTier } from 'detect-gpu';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Color, MathUtils } from 'three';

const PALETTES = {
  iphone: { base: '#ff8a8a', secondary: '#ffd36b', accent: '#8ae6ff' },
  tshirt: { base: '#ffd36b', secondary: '#ff8a8a', accent: '#8ae6ff' },
  car: { base: '#8ae6ff', secondary: '#a08aff', accent: '#ffd36b' },
  hamburger: { base: '#ff9bf5', secondary: '#ffd36b', accent: '#ff8a8a' },
  television: { base: '#a08aff', secondary: '#8ae6ff', accent: '#ffd36b' },
  fridge: { base: '#8ae6ff', secondary: '#ff9bf5', accent: '#ffd36b' }
};

const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024
};

const DEFAULT_MOTION_PROFILE = {
  tiltIntensity: 0.32,
  hoverLift: 0.12,
  pressLift: 0.24,
  pointerLift: 0.12,
  pointerDrift: 0.05,
  rotationSmoothing: 2.8,
  positionSmoothing: 2.4,
  prefersReducedMotion: false,
  floatIntensity: 0.45,
  rotationIntensity: 0.65
};

function deriveDeviceState(width) {
  const isMobile = width <= BREAKPOINTS.mobile;
  const isTablet = width > BREAKPOINTS.mobile && width <= BREAKPOINTS.tablet;
  return {
    width,
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet
  };
}

function useDeviceState() {
  const [state, setState] = useState(() =>
    deriveDeviceState(typeof window === 'undefined' ? BREAKPOINTS.tablet : window.innerWidth)
  );

  useEffect(() => {
    const handleResize = () => setState(deriveDeviceState(window.innerWidth));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return state;
}

function useMotionProfileRef(profile) {
  const profileRef = useRef(profile);
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);
  return profileRef;
}

function useGpuTier(device, prefersReducedMotion) {
  const [tier, setTier] = useState(() =>
    prefersReducedMotion ? { tier: 0, isMobile: device.isMobile } : null
  );

  useEffect(() => {
    let cancelled = false;

    if (prefersReducedMotion) {
      setTier({ tier: 0, isMobile: device.isMobile });
      return () => {
        cancelled = true;
      };
    }

    if (typeof window === 'undefined') {
      return () => {
        cancelled = true;
      };
    }

    getGPUTier({ mobileBenchmarkPercentages: [0.5, 0.7, 0.9] })
      .then((result) => {
        if (!cancelled) {
          setTier(result);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTier({ tier: 1, isMobile: device.isMobile });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [prefersReducedMotion, device.isMobile]);

  return tier;
}

function normalizePointer(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return { x: 0, y: 0 };
  }
  const rect = target.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
  return {
    x: MathUtils.clamp(x, -1, 1),
    y: MathUtils.clamp(y, -1, 1)
  };
}

function InteractiveRig({ children, motionProfile }) {
  const group = useRef();
  const { pointer } = useThree();
  const mergedProfile = useMemo(
    () => ({ ...DEFAULT_MOTION_PROFILE, ...(motionProfile ?? {}) }),
    [motionProfile]
  );
  const profileRef = useMotionProfileRef(mergedProfile);
  const isPressing = useRef(false);
  const manualPointer = useRef({ x: 0, y: 0 });
  const pressProgress = useRef(0);

  useFrame((_, delta) => {
    if (!group.current) return;
    const profile = profileRef.current;
    const pointerSource = isPressing.current ? manualPointer.current : pointer;

    pressProgress.current = MathUtils.damp(pressProgress.current, isPressing.current ? 1 : 0, 6, delta);

    const tiltMultiplier = profile.tiltIntensity;
    const hoverLift = profile.hoverLift;
    const pressLift = profile.pressLift;
    const pointerLift = profile.pointerLift;
    const pointerDrift = profile.pointerDrift;

    const rotationYTarget = pointerSource.x * tiltMultiplier;
    const rotationXTarget = -pointerSource.y * tiltMultiplier * 0.6;
    group.current.rotation.y = MathUtils.damp(
      group.current.rotation.y,
      rotationYTarget,
      profile.rotationSmoothing,
      delta
    );
    group.current.rotation.x = MathUtils.damp(
      group.current.rotation.x,
      rotationXTarget,
      profile.rotationSmoothing * 0.85,
      delta
    );

    const liftTarget =
      MathUtils.lerp(hoverLift, pressLift, pressProgress.current) - pointerSource.y * pointerLift;
    group.current.position.y = MathUtils.damp(
      group.current.position.y,
      liftTarget,
      profile.positionSmoothing,
      delta
    );
    group.current.position.x = MathUtils.damp(
      group.current.position.x,
      pointerSource.x * pointerDrift,
      profile.positionSmoothing,
      delta
    );
  });

  return (
    <group
      ref={group}
      onPointerDown={(event) => {
        isPressing.current = true;
        manualPointer.current = normalizePointer(event);
      }}
      onPointerUp={() => {
        isPressing.current = false;
      }}
      onPointerOut={() => {
        isPressing.current = false;
      }}
      onPointerMove={(event) => {
        if (!isPressing.current) return;
        manualPointer.current = normalizePointer(event);
      }}
    >
      {children}
    </group>
  );
}

function ParticleHalo({ color, spin = 0.18, enabled = true }) {
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
    if (!group.current || !enabled) return;
    group.current.rotation.y += delta * spin;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * spin * 0.45;
  });

  if (!enabled) {
    return null;
  }

  return (
    <group ref={group}>
      <Points positions={positions} stride={3}>
        <PointMaterial transparent color={color} size={0.015} sizeAttenuation depthWrite={false} />
      </Points>
    </group>
  );
}

function SwirlField({ color, speed = 0.25, enabled = true }) {
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
    if (!group.current || !enabled) return;
    group.current.rotation.y -= delta * speed;
  });

  if (!enabled) {
    return null;
  }

  return (
    <group ref={group}>
      <Points positions={positions} stride={3}>
        <PointMaterial transparent color={color} size={0.01} sizeAttenuation depthWrite={false} />
      </Points>
    </group>
  );
}

function GroundShadow({ radius = 3.6, color = '#05060f', opacity = 0.4, height = -1.5 }) {
  const mesh = useRef();

  useFrame((state, delta) => {
    if (!mesh.current) return;
    const targetOpacity = 0.35 + Math.sin(state.clock.elapsedTime * 2) * 0.03;
    mesh.current.material.opacity = MathUtils.damp(mesh.current.material.opacity, targetOpacity, 3, delta);
  });

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, height, 0]}>
      <circleGeometry args={[radius, 64]} />
      <meshBasicMaterial color={color} opacity={opacity} transparent />
    </mesh>
  );
}

function useHoverDampedRotation(ref, intensity = 0.35, motionProfile) {
  const { pointer } = useThree();
  const profileRef = useMotionProfileRef(motionProfile ?? DEFAULT_MOTION_PROFILE);
  useFrame((_, delta) => {
    if (!ref.current) return;
    const profile = profileRef.current;
    const multiplier = profile.prefersReducedMotion ? intensity * 0.5 : intensity;
    ref.current.rotation.y = MathUtils.damp(ref.current.rotation.y, pointer.x * multiplier, 2.6, delta);
    ref.current.rotation.x = MathUtils.damp(ref.current.rotation.x, -pointer.y * multiplier * 0.6, 2.2, delta);
  });
}

function FloatingSculpture({ colors, motionProfile, ambientFx }) {
  return (
    <InteractiveRig motionProfile={motionProfile}>
      <Float
        speed={1.7}
        rotationIntensity={motionProfile.rotationIntensity}
        floatIntensity={motionProfile.floatIntensity}
      >
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
      <Float
        position={[0, -0.35, 0]}
        speed={1.3}
        rotationIntensity={motionProfile.rotationIntensity * 0.75}
        floatIntensity={motionProfile.floatIntensity * 0.7}
      >
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
      <Float
        position={[0, 0.95, 0]}
        speed={2.05}
        rotationIntensity={motionProfile.rotationIntensity}
        floatIntensity={motionProfile.floatIntensity * 0.6}
      >
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
      {ambientFx.sparkles > 0 ? (
        <Sparkles
          count={ambientFx.sparkles}
          speed={0.35}
          opacity={0.7}
          color={colors.accent}
          scale={[4, 3, 4]}
          size={2.4}
        />
      ) : null}
      <SwirlField color={colors.secondary} speed={ambientFx.swirlSpeed} enabled={ambientFx.sparkles > 0} />
      <ParticleHalo color={colors.accent} spin={ambientFx.haloSpin} enabled={ambientFx.sparkles > 0} />
    </InteractiveRig>
  );
}

function ElectricCarScene({ colors, device, motionProfile }) {
  const car = useGLTF('/models/electric-car.glb');
  const group = useRef();
  const chassis = useRef();
  const profileRef = useMotionProfileRef(motionProfile);
  const { isMobile, isTablet } = device;
  const scale = useMemo(() => {
    if (isMobile) return 0.95;
    if (isTablet) return 1.05;
    return 1.12;
  }, [isMobile, isTablet]);
  const yOffset = useMemo(() => (isMobile ? -1 : -0.82), [isMobile]);

  useHoverDampedRotation(group, motionProfile.tiltIntensity * 0.75, motionProfile);

  useFrame((state, delta) => {
    if (!group.current) return;
    const profile = profileRef.current;
    const t = state.clock.elapsedTime;
    const driveProgress = Math.min(t / 1.4, 1);
    const wobble = profile.prefersReducedMotion ? 0.35 : 1;
    group.current.position.z = MathUtils.damp(group.current.position.z, -1.8 * (1 - driveProgress), 2.2, delta);
    group.current.position.x = MathUtils.damp(
      group.current.position.x,
      Math.sin(t * 0.4) * 0.08 * wobble,
      3,
      delta
    );
    group.current.rotation.z = MathUtils.damp(
      group.current.rotation.z,
      Math.sin(t * 0.6) * 0.012 * wobble,
      4,
      delta
    );

    if (chassis.current) {
      chassis.current.rotation.x = MathUtils.damp(
        chassis.current.rotation.x,
        Math.sin(t * 1.2) * 0.005 * wobble,
        6,
        delta
      );
      chassis.current.rotation.y = MathUtils.damp(
        chassis.current.rotation.y,
        Math.sin(t * 0.6) * 0.01 * wobble,
        6,
        delta
      );
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
    <group ref={group} position={[0, yOffset, 0]} scale={scale}>
      <group ref={chassis}>
        <primitive object={car.scene} />
      </group>
      <GroundShadow radius={3.8} color={colors.base} opacity={0.28} height={yOffset - 0.2} />
    </group>
  );
}

function TShirtScene({ colors, device, motionProfile }) {
  const { scene, nodes } = useGLTF('/models/tshirt-soft.glb');
  const group = useRef();
  const cloth = useRef();
  const profileRef = useMotionProfileRef(motionProfile);
  const { isMobile, isTablet } = device;
  const scale = useMemo(() => {
    if (isMobile) return 1.05;
    if (isTablet) return 1.15;
    return 1.25;
  }, [isMobile, isTablet]);
  const yOffset = useMemo(() => (isMobile ? -0.1 : -0.3), [isMobile]);

  useHoverDampedRotation(group, motionProfile.tiltIntensity * 0.9, motionProfile);

  useFrame((state, delta) => {
    if (!group.current) return;
    const profile = profileRef.current;
    const t = state.clock.elapsedTime;
    const drift = profile.prefersReducedMotion ? 0.5 : 1;
    group.current.position.y = Math.sin(t * 0.7) * 0.12 * drift;
    group.current.rotation.z = Math.sin(t * 0.45) * 0.05 * drift;

    if (cloth.current) {
      cloth.current.morphTargetInfluences?.forEach((_, idx, array) => {
        array[idx] = 0.4 + Math.sin(t * 1.6 + idx * 0.6) * 0.05 * drift;
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
    <group ref={group} position={[0, yOffset, 0]} scale={scale}>
      <primitive object={scene} />
      <GroundShadow radius={3} color={colors.secondary} opacity={0.25} height={yOffset - 0.2} />
    </group>
  );
}

function IPhoneScene({ colors, device, motionProfile }) {
  const { scene, nodes } = useGLTF('/models/iphone-pro.glb');
  const group = useRef();
  const glass = useRef();
  const back = useRef();
  const profileRef = useMotionProfileRef(motionProfile);
  const { isMobile, isTablet } = device;
  const scale = useMemo(() => {
    if (isMobile) return 1.08;
    if (isTablet) return 1.16;
    return 1.22;
  }, [isMobile, isTablet]);
  const yOffset = useMemo(() => (isMobile ? -0.42 : -0.5), [isMobile]);

  useHoverDampedRotation(group, motionProfile.tiltIntensity * 0.95, motionProfile);

  useFrame((state, delta) => {
    if (!group.current) return;
    const profile = profileRef.current;
    const t = state.clock.elapsedTime;
    const drift = profile.prefersReducedMotion ? 0.4 : 1;
    group.current.position.y = MathUtils.damp(
      group.current.position.y,
      Math.sin(t * 1.1) * 0.14 * drift,
      3,
      delta
    );
    group.current.rotation.y = MathUtils.damp(
      group.current.rotation.y,
      Math.sin(t * 0.6) * 0.15 * drift,
      4.2,
      delta
    );
    group.current.rotation.z = MathUtils.damp(
      group.current.rotation.z,
      Math.sin(t * 0.4) * 0.08 * drift,
      5,
      delta
    );

    const shimmer = 0.2 + Math.sin(t * 2.6) * 0.05 * drift;
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
    <group ref={group} position={[0, yOffset, 0]} scale={scale}>
      <primitive object={scene} />
      <GroundShadow radius={2.4} color={colors.accent} opacity={0.22} height={yOffset - 0.18} />
    </group>
  );
}

function HamburgerScene({ colors, device, motionProfile }) {
  const burger = useGLTF('/models/hamburger-stack.glb');
  const group = useRef();
  const layers = useRef([]);
  const profileRef = useMotionProfileRef(motionProfile);
  const { isMobile, isTablet } = device;
  const scale = useMemo(() => {
    if (isMobile) return 1.25;
    if (isTablet) return 1.35;
    return 1.45;
  }, [isMobile, isTablet]);
  const yOffset = useMemo(() => (isMobile ? -0.7 : -0.82), [isMobile]);

  useHoverDampedRotation(group, motionProfile.tiltIntensity * 0.8, motionProfile);

  useFrame((state, delta) => {
    if (!group.current) return;
    const profile = profileRef.current;
    const t = state.clock.elapsedTime;
    const drift = profile.prefersReducedMotion ? 0.45 : 1;
    group.current.position.y = Math.sin(t * 0.8) * 0.06 * drift;
    group.current.rotation.x = MathUtils.damp(
      group.current.rotation.x,
      Math.sin(t * 0.5) * 0.05 * drift,
      4,
      delta
    );

    layers.current.forEach((layer, index) => {
      if (!layer) return;
      const offset = index * 0.05;
      layer.position.y = MathUtils.damp(
        layer.position.y,
        offset + Math.sin(t * 1.6 + offset * 6) * 0.04 * drift,
        6,
        delta
      );
      layer.rotation.z = Math.sin(t * 2 + index * 0.3) * 0.02 * drift;
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
    <group ref={group} position={[0, yOffset, 0]} scale={scale}>
      <primitive object={burger.scene} />
      <GroundShadow radius={2.6} color={colors.secondary} opacity={0.3} height={yOffset - 0.2} />
    </group>
  );
}

function TelevisionScene({ colors, device, motionProfile }) {
  const { scene, nodes } = useGLTF('/models/television-retro.glb');
  const group = useRef();
  const screen = useRef();
  const glow = useRef();
  const profileRef = useMotionProfileRef(motionProfile);
  const { isMobile, isTablet } = device;
  const scale = useMemo(() => {
    if (isMobile) return 1.02;
    if (isTablet) return 1.12;
    return 1.24;
  }, [isMobile, isTablet]);
  const yOffset = useMemo(() => (isMobile ? -0.8 : -0.9), [isMobile]);

  useHoverDampedRotation(group, motionProfile.tiltIntensity * 0.68, motionProfile);

  useFrame((state, delta) => {
    const profile = profileRef.current;
    const t = state.clock.elapsedTime;
    const drift = profile.prefersReducedMotion ? 0.45 : 1;
    if (glow.current) {
      const intensity = 0.4 + Math.sin(t * 5) * 0.1 * drift;
      glow.current.material.opacity = MathUtils.damp(glow.current.material.opacity, intensity, 4, delta);
    }
    if (screen.current) {
      const emissiveIntensity = 1.2 + Math.sin(t * 4) * 0.15 * drift;
      screen.current.material.emissiveIntensity = MathUtils.damp(
        screen.current.material.emissiveIntensity,
        emissiveIntensity,
        6,
        delta
      );
    }
    if (group.current) {
      group.current.rotation.z = MathUtils.damp(
        group.current.rotation.z,
        Math.sin(t * 0.7) * 0.02 * drift,
        4,
        delta
      );
      group.current.position.y = MathUtils.damp(
        group.current.position.y,
        Math.sin(t * 0.9) * 0.04 * drift - 0.2,
        3,
        delta
      );
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
    <group ref={group} position={[0, yOffset, 0]} scale={scale}>
      <primitive object={scene} />
      <mesh ref={glow} position={[0, 0.55, -0.1]}>
        <planeGeometry args={[1.6, 1.1]} />
        <meshBasicMaterial color={new Color(colors.accent).lerp(new Color('#ffffff'), 0.35)} transparent opacity={0.4} />
      </mesh>
      <GroundShadow radius={3.2} color={colors.base} opacity={0.32} height={yOffset - 0.2} />
    </group>
  );
}

function FridgeScene({ colors, device, motionProfile }) {
  const { scene, nodes } = useGLTF('/models/fridge-modern.glb');
  const group = useRef();
  const door = useRef();
  const interiorLight = useRef();
  const profileRef = useMotionProfileRef(motionProfile);
  const { isMobile, isTablet } = device;
  const scale = useMemo(() => {
    if (isMobile) return 1.14;
    if (isTablet) return 1.24;
    return 1.34;
  }, [isMobile, isTablet]);
  const yOffset = useMemo(() => (isMobile ? -0.9 : -1), [isMobile]);

  useHoverDampedRotation(group, motionProfile.tiltIntensity * 0.6, motionProfile);

  useFrame((state, delta) => {
    const profile = profileRef.current;
    const t = state.clock.elapsedTime;
    const drift = profile.prefersReducedMotion ? 0.5 : 1;
    const openProgress = (Math.sin(t * 0.7) + 1) / 2;
    if (door.current) {
      door.current.rotation.y = MathUtils.damp(
        door.current.rotation.y,
        MathUtils.degToRad(55) * openProgress * drift,
        5,
        delta
      );
    }
    if (interiorLight.current) {
      interiorLight.current.material.emissiveIntensity = MathUtils.damp(
        interiorLight.current.material.emissiveIntensity,
        0.8 + openProgress * 1.4 * drift,
        4,
        delta
      );
    }
    if (group.current) {
      group.current.position.y = MathUtils.damp(
        group.current.position.y,
        -0.6 + openProgress * 0.05 * drift,
        3,
        delta
      );
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
    <group ref={group} position={[0, yOffset, 0]} scale={scale}>
      <primitive object={scene} />
      <GroundShadow radius={3.5} color={colors.secondary} opacity={0.3} height={yOffset - 0.22} />
    </group>
  );
}

const ENABLED_PRODUCT_MODELS = import.meta.env?.VITE_ENABLE_PRODUCT_MODELS === 'true';

function ProductCanvas({ slug, palette }) {
  const device = useDeviceState();
  const prefersReducedMotion = useReducedMotion();
  const gpuTier = useGpuTier(device, prefersReducedMotion);
  const colors = palette ?? PALETTES[slug] ?? PALETTES.iphone;
  const qualityTier = useMemo(() => {
    if (prefersReducedMotion) return 'reduced';
    if (!gpuTier) return device.isMobile ? 'balanced' : 'high';
    if (gpuTier.tier <= 1 || device.isMobile) return 'balanced';
    return 'high';
  }, [device.isMobile, gpuTier, prefersReducedMotion]);

  const motionProfile = useMemo(() => {
    if (prefersReducedMotion) {
      return {
        ...DEFAULT_MOTION_PROFILE,
        tiltIntensity: 0.16,
        hoverLift: 0.04,
        pressLift: 0.08,
        pointerLift: 0.05,
        pointerDrift: 0.02,
        floatIntensity: 0.12,
        rotationIntensity: 0.18,
        prefersReducedMotion: true
      };
    }

    const base = device.isMobile
      ? {
          tiltIntensity: 0.26,
          hoverLift: 0.1,
          pressLift: 0.18,
          pointerLift: 0.08,
          pointerDrift: 0.04,
          floatIntensity: 0.32,
          rotationIntensity: 0.5
        }
      : device.isTablet
      ? {
          tiltIntensity: 0.3,
          hoverLift: 0.12,
          pressLift: 0.22,
          pointerLift: 0.1,
          pointerDrift: 0.05,
          floatIntensity: 0.4,
          rotationIntensity: 0.6
        }
      : {
          tiltIntensity: 0.34,
          hoverLift: 0.14,
          pressLift: 0.24,
          pointerLift: 0.12,
          pointerDrift: 0.06,
          floatIntensity: 0.45,
          rotationIntensity: 0.65
        };

    return {
      ...DEFAULT_MOTION_PROFILE,
      ...base,
      prefersReducedMotion: false
    };
  }, [device.isMobile, device.isTablet, prefersReducedMotion]);

  const ambientFx = useMemo(() => {
    if (prefersReducedMotion) {
      return {
        sparkles: 0,
        swirlSpeed: 0.08,
        haloSpin: 0.08
      };
    }

    if (qualityTier === 'balanced') {
      return {
        sparkles: 42,
        swirlSpeed: 0.18,
        haloSpin: 0.14
      };
    }

    return {
      sparkles: 68,
      swirlSpeed: 0.24,
      haloSpin: 0.18
    };
  }, [prefersReducedMotion, qualityTier]);

  const cameraConfig = useMemo(() => {
    if (device.isMobile) {
      return { position: [0, 0.28, 4.9], fov: 58 };
    }
    if (device.isTablet) {
      return { position: [0, 0.36, 4.3], fov: 54 };
    }
    return { position: [0, 0.45, 4.1], fov: 52 };
  }, [device.isMobile, device.isTablet]);

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

  const shouldShowModel = SceneBySlug && qualityTier !== 'reduced';

  return (
    <Canvas
      camera={cameraConfig}
      dpr={prefersReducedMotion ? [1, 1.4] : device.isMobile ? [1, 1.6] : [1, 2]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: device.isMobile ? 'high-performance' : 'default'
      }}
    >
      <AdaptiveDpr pixelated={device.isMobile} />
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
        fallback={<FloatingSculpture colors={colors} motionProfile={motionProfile} ambientFx={ambientFx} />}
      >
        {shouldShowModel ? (
          <InteractiveRig motionProfile={motionProfile}>
            <SceneBySlug colors={colors} device={device} motionProfile={motionProfile} />
            {ambientFx.sparkles > 0 ? (
              <Sparkles
                count={ambientFx.sparkles}
                speed={0.25}
                opacity={0.55}
                color={colors.accent}
                scale={[3.6, 3, 3.6]}
                size={2}
              />
            ) : null}
            <ParticleHalo color={colors.accent} spin={ambientFx.haloSpin} enabled={ambientFx.sparkles > 0} />
          </InteractiveRig>
        ) : (
          <FloatingSculpture colors={colors} motionProfile={motionProfile} ambientFx={ambientFx} />
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
