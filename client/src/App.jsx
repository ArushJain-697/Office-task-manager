import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
//import pages :
import FrontPageTerminal from "./pages/FrontPageTerminal";
import Newspaper from "./pages/Newspaper";
import { motion, AnimatePresence } from 'framer-motion';
import WantedPoster from "./components/WantedPoster";
const App = () => {
    const location = useLocation();
    const currentPath = location?.pathname || "/";

const BlackFlash = ({ isNavigating }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: [0, 1, 1, 0], // Flash black in the middle
      }}
      transition={{
        duration: 2.2, // Total time covers Exit (1s) + Gap + Entry (1.2s)
        times: [0, 0.4, 0.6, 1], 
        ease: "easeInOut"
      }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'black',
        zIndex: 99,
        pointerEvents: 'none'
      }}
    />
  );
};
  return (
    <div className="min-h-screen bg-black"> 
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<FrontPageTerminal />} />
          <Route path="/feed" element={<Newspaper />} />
          <Route path="/working" element={<WantedPoster />} />
        </Routes>
      </AnimatePresence>

      {/* <Transition key={location.pathname} /> */}
    </div>
  );
};

export default App;
