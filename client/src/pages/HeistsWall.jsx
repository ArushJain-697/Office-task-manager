import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel } from "swiper/modules";

import "swiper/css";
import "swiper/css/free-mode";

const originalImages = [
  // [object Object]
  {
    "image-url":
      "https://fastly.picsum.photos/id/223/400/600.jpg?hmac=Kkq3gop87I_-mpK19ppuS4AQe9BUNb_LoxVeHV8YbaA",
  }, // [object Object]
  {
    "image-url":
      "https://fastly.picsum.photos/id/869/400/600.jpg?hmac=p6u7xDA3BXia2OpCZt6qt2pVpkoMSEQ5POw5BjOSRX8",
  }, // [object Object]
  {
    "image-url":
      "https://fastly.picsum.photos/id/364/400/600.jpg?hmac=2qcjX2R99VzZ4je2KBRzJYdQCv1fNL79NcOHZhhyJXk",
  }, // [object Object]
  {
    "image-url":
      "https://fastly.picsum.photos/id/977/400/600.jpg?hmac=i7UD_vVqa3h-Bx4rqmXNJVj6JkOXEabQ_DkgOoh1XBw",
  }, // [object Object]
  {
    "image-url":
      "https://fastly.picsum.photos/id/808/400/600.jpg?hmac=Zzz2yNfbnHeu7H-B-Em7qb3PLRri0TnJuZWSP2s3qvY",
  }, // [object Object]
  {
    "image-url":
      "https://fastly.picsum.photos/id/790/400/600.jpg?hmac=JWZAYKuhYuIz3KH5IftdCLANGS0kKDfv6FRA3sb7jgY",
  }, // [object Object]
  {
    "image-url":
      "https://fastly.picsum.photos/id/871/400/600.jpg?hmac=KZS98hk8Vhye6pp0BZNDcb-u8eNpchGknvZIAQld0_0",
  }, // [object Object]
  {
    "image-url":
      "https://fastly.picsum.photos/id/862/400/600.jpg?hmac=XEYz8Gzq1VArgxC11Tf1VtZOd4Zyxw58-zb0QzyQFpM",
  }, // [object Object]
  {
    "image-url":
      "https://fastly.picsum.photos/id/768/400/600.jpg?hmac=5vCiy6TE5n3Ge9vsfzs-hksJmUjQlc-p1sqk0N4ahrY",
  }, // [object Object]
  {
    "image-url":
      "https://fastly.picsum.photos/id/518/400/600.jpg?hmac=cEXYAwirnozHUS6cb-0heswIbwE1iXRFX8hgYnneNFs",
  },
];

const infiniteImages = [
  ...originalImages,
  ...originalImages,
  ...originalImages,
];

const linearTransition = {
  type: "tween",
  ease: "linear",
  duration: 0.35,
};

const HorizontalGallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
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
        {infiniteImages.map((img, index) => (
          <SwiperSlide
            key={index}
            className="!w-auto h-full !flex justify-center items-center px-[5vw]"
          >
            {/* PERFORMANCE FIX 1: 
                Added 'transform-gpu', 'will-change-transform', and 'backface-hidden' 
                This forces the browser to composite each of these groups on its own dedicated GPU layer, preventing layout thrashing. */}
            <div
              className="relative h-[40vh] w-fit flex-shrink-0 cursor-pointer group transform-gpu will-change-transform backface-hidden"
              onClick={() => setSelectedImage({ ...img, uniqueIndex: index })}
            >
              {/* PERFORMANCE FIX 2: 
                  Shrunk w-[150vw] to w-[100vw] and h-[150vh] to h-[100vh].
                  This stops the browser from calculating millions of invisible pixels off-screen. */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vh] pointer-events-none -z-10"
                style={{
                  backgroundImage: "url('/assets/StoneTexture.png')",
                  backgroundSize: "15rem",
                  backgroundRepeat: "repeat",
                  backgroundPosition: "center",

                  WebkitMaskImage:
                    "linear-gradient(to bottom, black 20%, transparent 80%), radial-gradient(ellipse 20vw 30vh at 50% 35%, black 0%, transparent 70%), conic-gradient(from 140deg at 50% 32%, transparent 0deg, black 20deg, black 60deg, transparent 100deg)",

                  // MAGIC: 'source-over' glues the bulb and beam together. 'source-in' fades the glued result!
                  WebkitMaskComposite: "source-in, source-over",

                  // Standard fallbacks
                  maskImage:
                    "linear-gradient(to bottom, black 20%, transparent 80%), radial-gradient(ellipse 15vw 20vh at 50% 35%, black 0%, transparent 70%), conic-gradient(from 140deg at 50% 32%, transparent 0deg, black 20deg, black 60deg, transparent 100deg)",
                  maskComposite: "intersect, add",
                }}
              />

              <img
                src={img["image-url"]}
                alt=""
                // PERFORMANCE FIX 3: Added loading="lazy" and fetchpriority="high" to the anchor images
                loading="lazy"
                className="block h-[40vh] w-auto max-w-[80vw] object-cover border-[0.5rem] border-[#111] rounded-sm shadow-[0_1rem_3rem_rgba(0,0,0,1)]"
              />

              <motion.img
                layoutId={`image-${index}`}
                src={img["image-url"]}
                alt={img.description}
                transition={linearTransition}
                className="absolute inset-0 z-20 h-full w-full object-cover border-[0.5rem] border-[#111] rounded-sm 
                           shadow-[0_1rem_3rem_rgba(0,0,0,1)] transition-transform duration-300 group-hover:scale-105"
              />

              <div
                className={`absolute inset-0 z-30 pointer-events-none transition-all duration-300 group-hover:scale-105 border-[0.5rem] border-transparent bg-clip-padding rounded-sm bg-gradient-to-b from-transparent via-black/40 to-black/90 ${selectedImage?.uniqueIndex === index ? "opacity-0" : "opacity-100"}`}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={linearTransition}
            className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer bg-black/95"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative flex flex-col items-center justify-center p-[2rem]">
              <motion.img
                layoutId={`image-${selectedImage.uniqueIndex}`}
                src={selectedImage["image-url"]}
                alt={selectedImage.description}
                transition={linearTransition}
                className="max-h-[85vh] max-w-[90vw] w-auto h-auto object-cover border-[0.75rem] border-[#111] rounded-sm shadow-[0_0_5rem_rgba(0,0,0,1)] cursor-default will-change-transform"
                onClick={(e) => e.stopPropagation()}
              />

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={linearTransition}
                className="absolute left-0 right-0 -bottom-[4rem] text-center text-[#f4f4f4] text-[1.5rem] font-serif tracking-widest drop-shadow-2xl"
              >
                {selectedImage.description}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HorizontalGallery;
