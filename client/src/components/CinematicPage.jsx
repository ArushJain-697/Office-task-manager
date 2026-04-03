// CinematicPage.jsx
import { motion } from 'framer-motion';

const CinematicPage = ({ children }) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 1.1, // Reduced from 1.5 to make the "entry" less violent
        filter: 'blur(10px)',
      }}
      animate={{
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        transition: {
          duration: 1, // Snappy but smooth
          ease: "easeOut", // Standard smooth decelerating curve
          // Or use a custom soft curve: ease: [0, 0, 0.2, 1]
        },
      }}
      exit={{
        opacity: 0,
        scale: 1.1, // Zooming into the page
        filter: 'blur(30px)',
        transition: {
          duration: 0.6,
          ease: "easeIn", // Accelerates away from the camera
        },
      }}
      style={{
        width: '100%',
        minHeight: '100vh',
        transformOrigin: 'center center',
        position: 'absolute', // Prevents layout jumping during wait mode
        top: 0,
        left: 0,
      }}
    >
      {children}
    </motion.div>
  );
};

export default CinematicPage;