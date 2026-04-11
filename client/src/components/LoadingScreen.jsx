import React, { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen() {
  // We drop 'progress' and use 'loaded' (files finished) and 'total' (files found)
  const { active, loaded, total } = useProgress();
  const [isImagesLoaded, setIsImagesLoaded] = useState(false);

  useEffect(() => {
    // Make sure these match your exact file paths!
    const imageUrls = [
      "/assets/table.png",
      "/assets/frontPageBG.jpeg",
      "/assets/wanted.jpeg"
    ];

    let loadedCount = 0;
    imageUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === imageUrls.length) {
          setIsImagesLoaded(true);
        }
      };
    });
  }, []);

  // VITE FIX: Calculate progress based on number of files, not bytes!
  const safeProgress = total > 0 ? (loaded / total) * 100 : 0;

  // The loading screen disappears when:
  // 1. Images are loaded
  // 2. Three.js has registered files to load (total > 0)
  // 3. Three.js is no longer actively downloading (active is false)
  const isLoading = !isImagesLoaded || active || total === 0;

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-999 bg-[#0a0a0a] flex flex-col items-center justify-center text-[#00FF41] font-mono"
        >
          {/* CRT Scanline Effect Overlay */}
          <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>

          <div className="relative z-10 flex flex-col items-center">
            <motion.h1 
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-2xl mb-6 tracking-widest font-bold"
            >
              LOADING . . .
            </motion.h1>

            <div className="w-80 h-2 bg-gray-900 border border-[#00FF41]/30 rounded-none overflow-hidden relative">
              {/* Uses the new safeProgress variable */}
              <motion.div
                className="h-full bg-[#00FF41] shadow-[0_0_10px_#00FF41]"
                initial={{ width: 0 }}
                animate={{ width: `${safeProgress}%` }}
                transition={{ ease: "easeOut", duration: 0.2 }}
              />
            </div>

            <div className="mt-4 text-sm opacity-80">
              SYS.MEM: {Math.round(safeProgress)}%
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}