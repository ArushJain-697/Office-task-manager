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

// 1. GUN MESH (No more post-processing wrappers!)
function GunMesh({ isZoomed, setIsZoomed, setHovered }) {
  const { scene } = useGLTF("/assets/gun.glb");
  const gunGroupRef = useRef();

  const tablePosition = [-3, 1, 0];
  const inspectPosition = [0, 0, 0];

  const tableRotation = [-0.1, 0.3, 0];
  const inspectRotation = [0, 0, 0];

  const tableScale = 0.45;
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
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true); // Pass hover state up to parent
        document.body.style.cursor = !isZoomed ? "pointer" : "auto";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!isZoomed) {
          setIsZoomed(true);
          setHovered(false); // Turn off outline when opened
        }
      }}
    >
      <primitive object={scene} />

      {isZoomed && (
        <Html position={[0, -1.5, 0]} center zIndexRange={[100, 0]}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-64 p-4 bg-black/80 border border-[#ffff00] text-[#ffff00] font-mono rounded-md pointer-events-none backdrop-blur-md text-1xl"
          >
            <h3 className="text-center font-bold text-lg mb-2 underline">
              MY STATS
            </h3>
            <div className="flex justify-between border-b border-[#ffff00]/30 pb-1 mb-1">
              <span>Heists</span> <span>14</span>
            </div>
            <div className="flex justify-between border-b border-[#ffff00]/30 pb-1 mb-1">
              <span>Kills: </span>
              <span>67</span>
            </div>
            <div className="flex justify-between border-b border-[#ffff00]/30 pb-1 mb-1">
              <span>Earnings: </span>  
              <span>$1209.22</span>
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
      {/* --- THE SVG FILTER CHEAT CODE --- */}
      {/* This sits invisibly on the page and creates the math for our "Gap Outline" */}
      <svg style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }} aria-hidden="true">
        <filter id="gap-outline">
          {/* 1. Make a thick mask (4px) for the total size of the border */}
          <feMorphology in="SourceAlpha" operator="dilate" radius="6" result="outerEdge" />
          {/* 2. Make a thinner mask (2px) for the empty gap space */}
          <feMorphology in="SourceAlpha" operator="dilate" radius="3" result="innerGap" />
          
          {/* 3. Color the thick mask Yellow */}
          <feFlood floodColor="#ffd230" result="yellowColor" />
          <feComposite in="yellowColor" in2="outerEdge" operator="in" result="yellowBorder" />
          
          {/* 4. Use the thin mask to "punch a hole" out of the yellow border */}
          <feComposite in="yellowBorder" in2="innerGap" operator="out" result="finalBorder" />
          
          {/* 5. Put the original 3D canvas back on top of the new border */}
          <feMerge>
            <feMergeNode in="finalBorder" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </svg>
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
        className={`absolute inset-0 ${isZoomed ? 'z-50' : 'z-10'}`}
        // If hovered and on the table, apply our custom SVG filter!
        style={{ filter: hovered && !isZoomed ? "url(#gap-outline)" : "none" }} 
      >
        <Canvas 
          camera={{ position: [0, 0, 5], fov: 50 }}
          onPointerMissed={() => setIsZoomed(false)}
        >
          <ambientLight intensity={0.2} />
          <spotLight position={[5, 8, 2]} angle={0.3} penumbra={0.5} intensity={1.5} castShadow />
          <Environment preset="studio" environmentIntensity={0.4} /> 

          <GunMesh isZoomed={isZoomed} setIsZoomed={setIsZoomed} setHovered={setHovered} />

          <OrbitControls 
            ref={controlsRef}
            makeDefault 
            enabled={isZoomed}
            autoRotate={isZoomed} 
            enablePan={false}
            enableZoom={false} 
          />
          
          {isZoomed && (
             <ContactShadows position={[0, -1, 0]} opacity={0.8} scale={5} blur={1.5} far={2} color="#000000" depthWrite={false} />
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
