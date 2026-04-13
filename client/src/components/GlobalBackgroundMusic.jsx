import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const GlobalBackgroundMusic = ({ src, excludePath }) => {
  const audioRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const startAudio = () => {
      // Only play if we aren't on the excluded route
      if (location.pathname !== excludePath) {
        audio.play()
          .then(() => {
            // Success! Remove listeners so they don't run again
            removeListeners();
          })
          .catch((err) => {
            console.log("Playback still blocked:", err);
          });
      }
    };

    const removeListeners = () => {
      window.removeEventListener('click', startAudio);
      window.removeEventListener('keydown', startAudio);
      window.removeEventListener('touchstart', startAudio);
    };

    // 1. Try playing immediately (works if they navigated here via Link)
    startAudio();

    // 2. Add listeners for "Cold Starts" (Direct URL entry)
    window.addEventListener('click', startAudio);
    window.addEventListener('keydown', startAudio);
    window.addEventListener('touchstart', startAudio); // Better support for mobile

    return () => removeListeners();
  }, [location.pathname, excludePath]);

  return (
    <audio
      ref={audioRef}
      src={src}
      loop
      style={{ display: 'none' }}
    />
  );
};

export default GlobalBackgroundMusic;