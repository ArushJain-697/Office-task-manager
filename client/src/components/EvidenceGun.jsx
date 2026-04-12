import React, { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  OrbitControls,
  Html,
  Environment,
  ContactShadows,
} from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import InteractionMarker from "./InteractionMarker";

// 1. GUN MESH (No more post-processing wrappers!)
function GunMesh({ isZoomed, setIsZoomed, setHovered }) {
  const stats = React.useMemo(
    () => ({
      heists: Math.floor(Math.random() * (20 - 2 + 1)) + 2,
      kills: Math.floor(Math.random() * (70 - 27 + 1)) + 27,
      earnings: Math.floor(Math.random() * (3000 - 900 + 1)) + 900,
    }),
    [],
  );
  const { scene } = useGLTF("/assets/gun.glb");
  const gunGroupRef = useRef();

  const tablePosition = [-3.8, -1.2, 0];
  const inspectPosition = [0, 0, 0];

  const tableRotation = [-0.1, 0.3, -0.8];
  const inspectRotation = [0, 0, 0];

  const tableScale = 0.3;
  const inspectScale = 0.8; // (You can increase this if it's too small when inspecting)

  useFrame(() => {
    if (!gunGroupRef.current) return;
    const targetPos = isZoomed ? inspectPosition : tablePosition;
    const targetRot = isZoomed ? inspectRotation : tableRotation;
    const targetScale = isZoomed ? inspectScale : tableScale;

    gunGroupRef.current.position.lerp(new THREE.Vector3(...targetPos), 0.1);
    const targetQuaternion = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(...targetRot),
    );
    gunGroupRef.current.quaternion.slerp(targetQuaternion, 0.1);
    const s = THREE.MathUtils.lerp(
      gunGroupRef.current.scale.x,
      targetScale,
      0.1,
    );
    gunGroupRef.current.scale.set(s, s, s);
  });

  return (
    <group
      ref={gunGroupRef}
      position={tablePosition}
      rotation={tableRotation}
      scale={tableScale}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true); // Pass hover state up to parent
        document.body.style.cursor = !isZoomed ? "pointer" : "auto";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      <primitive object={scene} />

      {isZoomed && (
        <Html transform={false} zIndexRange={[100, 0]}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-[-25em] left-1/2 -translate-x-1/2 
               w-64 p-4 bg-black/80 border border-[#ffff00] 
               text-[#ffff00] font-mono rounded-md 
               pointer-events-none backdrop-blur-md text-1xl"
          >
            <h3 className="text-center font-bold text-lg mb-2 underline">
              MY STATS
            </h3>
            <div className="flex justify-between border-b border-[#ffff00]/30 pb-1 mb-1">
              <span>Heists</span> <span>{stats.heists}</span>
            </div>
            <div className="flex justify-between border-b border-[#ffff00]/30 pb-1 mb-1">
              <span>Kills:</span>
              <span>{stats.kills}</span>
            </div>
            <div className="flex justify-between border-b border-[#ffff00]/30 pb-1 mb-1">
              <span>Earnings:</span>
              <span>${stats.earnings}</span>
            </div>
          </motion.div>
        </Html>
      )}
    </group>
  );
}

// 2. MAIN EXPORT
export default function EvidenceGun() {
  const [isZoomed, setIsZoomed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const controlsRef = useRef(null);

  useEffect(() => {
    if (!isZoomed && controlsRef.current) {
      controlsRef.current.reset();
    }
  }, [isZoomed]);

  return (
    <>
      {/* ----------------------------------- */}

      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div
        // Notice we removed "transition-all duration-200" so the hover is INSTANT
        className={`absolute inset-0 ${isZoomed ? "z-50" : "z-10"}`}
      >
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          onPointerMissed={() => setIsZoomed(false)}
        >
          <ambientLight intensity={0.2} />
          <spotLight
            position={[5, 8, 2]}
            angle={0.3}
            penumbra={0.5}
            intensity={1.5}
            castShadow
          />
          <Environment preset="studio" environmentIntensity={0.4} />

          <GunMesh
            isZoomed={isZoomed}
            setIsZoomed={setIsZoomed}
            setHovered={setHovered}
          />

          {!isZoomed && (
            <Html position={[-3.8, -1.2, 0.5]} center zIndexRange={[100, 0]}>
              <InteractionMarker
                onClick={() => {
                  setIsZoomed(true);
                  setHovered(false);
                }}
                baseScale={1.0}
                forceVisible={hovered}
                text="STATS"
              />
            </Html>
          )}

          <OrbitControls
            ref={controlsRef}
            makeDefault
            enabled={isZoomed}
            autoRotate={isZoomed}
            enablePan={false}
            enableZoom={false}
          />

          {isZoomed && (
            <ContactShadows
              position={[0, -1, 0]}
              opacity={0.8}
              scale={5}
              blur={1.5}
              far={2}
              color="#000000"
              depthWrite={false}
            />
          )}
        </Canvas>
      </div>
    </>
  );
}
//  const tablePosition = [-3, 1, 0];
//   const inspectPosition = [0, 0, 0];

//   const tableRotation = [-0.1, 0.3, 0];
//   const inspectRotation = [0, 0, 0];

//   const tableScale = 0.45;
//   const inspectScale = 0.8; // (You can increase this if it's too small when inspecting)
