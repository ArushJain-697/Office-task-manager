import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Html, Environment, ContactShadows } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";

// 1. THE ACTUAL 3D MODEL
function GunMesh({ isZoomed, setIsZoomed }) {
  // Load your model (Update the path to match your file!)
  const { scene } = useGLTF("/assets/gun.glb"); 

  return (
    <group 
      // Change position and scale based on zoom state
      position={isZoomed ? [0, 0, 0] : [2, -1, 0]} 
      scale={isZoomed ? 2 : 0.5} 
      onClick={(e) => {
        e.stopPropagation(); // Stop click from bleeding to the table
        setIsZoomed(true);
      }}
    >
      <primitive object={scene} />
      
      {/* HTML Overlay anchored to the 3D object */}
      {isZoomed && (
        <Html position={[0, -1.5, 0]} center >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-64 p-4 bg-black/80 border border-[#00FF41] text-[#00FF41] font-mono rounded-md pointer-events-none backdrop-blur-md text-sm"
          >
            <h3 className="text-center font-bold text-lg mb-2">EVIDENCE #042</h3>
            <div className="flex justify-between border-b border-[#00FF41]/30 pb-1 mb-1">
              <span>CALIBER:</span> <span>.45 ACP</span>
            </div>
            <div className="flex justify-between border-b border-[#00FF41]/30 pb-1 mb-1">
              <span>STATUS:</span> <span className="text-red-500">FIRED</span>
            </div>
            <div className="flex justify-between">
              <span>OWNER:</span> <span>UNKNOWN</span>
            </div>
          </motion.div>
        </Html>
      )}
    </group>
  );
}

// 2. THE CANVAS WRAPPER
export default function EvidenceGun() {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <>
      {/* Dark Overlay when inspecting */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsZoomed(false)} // Click background to close
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 cursor-zoom-out"
          />
        )}
      </AnimatePresence>

      {/* The 3D Canvas container */}
      <div className={`absolute inset-0 pointer-events-none ${isZoomed ? 'z-50' : 'z-10'}`}>
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <Environment preset="city" /> {/* Gives realistic metallic reflections */}

          {/* The Gun */}
          <group className={isZoomed ? "pointer-events-auto cursor-grab active:cursor-grabbing" : "pointer-events-auto cursor-zoom-in"}>
             <GunMesh isZoomed={isZoomed} setIsZoomed={setIsZoomed} />
          </group>

          {/* Interactive Controls (Only active when zoomed) */}
          <OrbitControls 
            enabled={isZoomed}
            autoRotate={isZoomed} 
            autoRotateSpeed={2.5} 
            enablePan={false}
            enableZoom={false} // Disable scroll wheel zooming
            minPolarAngle={Math.PI / 3} // Restrict how far up/down they can look
            maxPolarAngle={Math.PI / 1.5}
          />
          
          {/* Fake shadow underneath the gun */}
          {isZoomed && <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={10} blur={2} far={4} />}
        </Canvas>
      </div>
    </>
  );
}