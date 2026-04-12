import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel } from "swiper/modules";

import "swiper/css";
import "swiper/css/free-mode";
import { useNavigate } from "react-router-dom";

import HackNiteCard from "../components/HackNiteCard";
import CinematicPage from "../components/CinematicPage";

const linearTransition = {
  type: "tween",
  ease: "linear",
  duration: 0.35,
};

const HorizontalGallery = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [heists, setHeists] = useState([]);
  const [role, setRole] = useState("sicario");
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Check user role
    fetch("https://api.sicari.works/api/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((authData) => {
        const userRole = authData?.user?.role || "sicario";
        setRole(userRole);
        
        // 2. Fetch appropriate heists
        const url = userRole === "fixer" 
          ? "https://api.sicari.works/api/fixer/heists" 
          : "https://api.sicari.works/api/sicario/heists";

        return fetch(url, { credentials: "include" });
      })
      .then((res) => res.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : data.heists || data.data || [];
        setHeists(arr);
      })
      .catch((err) => console.error("Error fetching heists data:", err));
  }, []);

  const infiniteHeists = heists.length > 0 ? [...heists, ...heists, ...heists] : [];

  return (
    <CinematicPage>
      <div className="relative w-full h-[100dvh] overflow-hidden bg-[#050505] flex items-center justify-center">
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ backgroundColor: "#050505" }}
        />

        <Swiper
          modules={[FreeMode, Mousewheel]}
          mousewheel={{
            enabled: true,
            sensitivity: 0.4,
            releaseOnEdges: true,
          }}
          freeMode={{ enabled: true, sticky: false, momentumRatio: 0.5 }}
          loop={true}
          centeredSlides={true}
          grabCursor={true}
          slidesPerView="auto"
          className="w-full h-full z-10"
        >
          {infiniteHeists.map((item, index) => {
            const title = item.heading || item.title || item.name || `Heist ${index + 1}`;

            const requiredSkills = (item.required_skills || []).map(
              (skill) => `# ${skill.role.toUpperCase()} - ${skill.moneyshare}`
            );

            const hashtags = [
              `# ${item.timeline || "Top Secret"}`,
              ...requiredSkills,
              `# ${item.crew_details?.threat_level || "Unknown"} Threat`,
              item.payout ? `# Payout ${item.payout}` : "# Classified",
            ];

            return (
              <SwiperSlide
                key={index}
                className="!w-auto h-full !flex justify-center items-center px-[5vw]"
              >
                <div
                  className="relative w-fit flex-shrink-0 cursor-pointer group transform-gpu will-change-transform"
                  onClick={() =>
                    setSelectedItem({
                      ...item,
                      uniqueIndex: index,
                      _title: title,
                      _hashtags: hashtags,
                      description: item.quote || item.short_description || "",
                    })
                  }
                >
                  {/* 1. The Masked Background */}
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vh] pointer-events-none z-0"
                    style={{
                      backgroundImage: "url('/assets/StoneTexture.png')",
                      backgroundSize: "30rem",
                      backgroundRepeat: "repeat",
                      backgroundPosition: "center",
                      // FIX 1: Massively widened the ellipse (from 20vw to 35vw) so the light bleeds around the wide cards!
                      WebkitMaskImage: "linear-gradient(to bottom, black 20%, transparent 80%), radial-gradient(ellipse 35vw 45vh at 50% 35%, black 0%, transparent 70%), conic-gradient(from 140deg at 50% 32%, transparent 0deg, black 20deg, black 60deg, transparent 100deg)",

                      maskImage: "linear-gradient(to bottom, black 20%, transparent 80%), radial-gradient(ellipse 35vw 45vh at 50% 35%, black 0%, transparent 70%), conic-gradient(from 140deg at 50% 32%, transparent 0deg, black 20deg, black 60deg, transparent 100deg)",
                      WebkitMaskComposite: "source-in, source-over",

                      maskComposite: "intersect, add",
                    }}
                  />

                  {/* FIX 2: THE INVISIBLE ANCHOR
                    This stops the layout from collapsing to 0x0 pixels when the real card flies away.
                    Because it's opacity-0, when the card leaves, it leaves a beautiful glowing empty spotlight! */}
                  {/* The Invisible Anchor */}
                  <div className="relative z-0 opacity-0 pointer-events-none">
                    <HackNiteCard title={title} hashtagLines={hashtags} />
                  </div>

                  {/* 3. THE FLYING CARD
                    Now positioned absolute so it perfectly overlaps the invisible anchor */}
                  <motion.div
                    layoutId={`card-${index}`}
                    className="absolute inset-0 z-10 transition-transform duration-300 group-hover:scale-105"
                    transition={linearTransition}
                  >
                    <HackNiteCard title={title} hashtagLines={hashtags} />
                  </motion.div>

                  {/* 4. The Shadow Overlay */}
                  <div
                    // Removed the border/clip-padding classes, added rounded-[inherit]
                    className={`absolute inset-0 z-20 pointer-events-none transition-all duration-300 group-hover:scale-105 rounded-[inherit] ${selectedItem?.uniqueIndex === index ? "opacity-0" : "opacity-100"
                      }`}
                    // Added a custom radial shadow that naturally hugs the bottom corners
                    style={{
                      background: "radial-gradient(120% 120% at 50% -10%, transparent 30%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0.95) 100%)"
                    }}
                  />
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={linearTransition}
              className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer bg-black/95"
              onClick={() => setSelectedItem(null)}
            >
              <div className="relative flex flex-col items-center justify-center p-[2rem]">
                <motion.div
                  layoutId={`card-${selectedItem.uniqueIndex}`}
                  transition={linearTransition}
                  className="cursor-default will-change-transform shadow-[0_0_5rem_rgba(0,0,0,1)] scale-[1.2] md:scale-[1.5]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <HackNiteCard
                    title={selectedItem._title}
                    hashtagLines={selectedItem._hashtags}
                  />
                </motion.div>
                
                {/* Independent Unscaled Interactive Button outside the card */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={linearTransition}
                  onClick={(e) => {
                    e.stopPropagation();
                    const hid = selectedItem?.id;
                    if (hid != null) {
                      navigate(`/heist_description/${hid}`, { state: { heist: selectedItem } });
                    }
                  }}
                  className="absolute left-1/2 -translate-x-1/2 -bottom-[9rem] bg-[#2c1303] text-[#f0e8d0] font-['Bungee'] py-[0.75rem] px-[2.5rem] shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:scale-105 active:scale-95 transition-transform"
                  style={{ fontSize: 20, border: "2px solid black", letterSpacing: "1px" }}
                >
                  {role === "fixer" ? "SEE APPLICANTS" : "APPLY"}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </CinematicPage>
  );
};

export default HorizontalGallery;