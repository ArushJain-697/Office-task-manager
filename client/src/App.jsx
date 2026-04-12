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
import HeistsWall from "./pages/HeistsWall";
import Network from "./pages/Network";
import AddPost from "./pages/AddPost";
import EditProfile from "./pages/EditProfile";
import HeistDescription from "./pages/HeistDescription";
import ApprovalInterface from "./components/ApprovalInterface";
import MyHeists from "./pages/My_Heists";
const dummyProfiles = [
  {
    id: 1,
    name: "Marcus 'Ghost' Vance",
    role: "Infiltration Specialist",
    skill: "Master",
    successRate: 98,
    wantedBy: ["Interpol", "MI6"],
    bio: "Specializes in biometric evasion and bypassing level-4 physical security."
  },
  {
    id: 2,
    name: "Elena Rostova",
    role: "Cyber Operations",
    skill: "Expert",
    successRate: 94,
    wantedBy: ["FBI", "Cyber Command"],
    bio: "Holds the record for penetrating the Central Bank mainframe in under 4 minutes."
  },
  {
    id: 3,
    name: "Jin 'The Architect' Kwon",
    role: "Demolitions / Structural",
    skill: "Veteran",
    successRate: 89,
    wantedBy: ["SIS", "CIA"],
    bio: "Creator of the shaped-charge micro-implosion technique used in the 2021 Tokyo Vault job."
  },
  {
    id: 4,
    name: "Sarah 'Wheels' Miller",
    role: "Extraction/Wheelman",
    skill: "Elite",
    successRate: 99,
    wantedBy: ["Europol", "GIGN"],
    bio: "Unmatched response time. Has never lost a pursuit, regardless of terrain or opposition."
  },
  {
    id: 5,
    name: "Alexander Thorne",
    role: "Social Engineer",
    skill: "Master",
    successRate: 96,
    wantedBy: ["Interpol", "KGB (formerly)"],
    bio: "Can adopt any persona with 100% conviction. Bypassed the Paris Security summit armed only with a clipboard."
  }
];
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
          <Route path="/Heists" element={<HeistsWall />} />
          <Route path="/Network" element={<Network />} />
          <Route path="/add_post" element={<AddPost />} />
          <Route path="/edit_profile" element={<EditProfile />} />
          <Route path="/heist_description/:id" element={<HeistDescription />} />
          <Route path="/working" element={<ApprovalInterface initialProfiles={dummyProfiles} />} />
          <Route path="/my_heists" element={<MyHeists />} />
        </Routes>
      </AnimatePresence>

      {/* <Transition key={location.pathname} /> */}
    </div>
  );
};

export default App;
