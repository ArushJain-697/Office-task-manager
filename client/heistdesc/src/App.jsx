import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { DossierProvider, useDossier } from './context/DossierContext'
import ProfileTypewriter from './ProfileTypewriter'
import WantedProfileFrame from '../WantedProfileFrame'
import './index.css'

function AppContent() {
  const [submitted, setSubmitted] = useState(false);
  const [profileData, setProfileData] = useState(null);
  
  return (
    <AnimatePresence mode="wait">
      {submitted ? (
        <motion.div
          key="dossier"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <div className="flex h-screen items-center justify-center bg-black">
            <WantedProfileFrame profile={profileData} />
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="form"
          initial={{ opacity: 0, filter: 'blur(5px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -50, filter: 'blur(10px)' }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <ProfileTypewriter onLockProfile={(data) => {
            setProfileData(data);
            setSubmitted(true);
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <DossierProvider>
      <AppContent />
    </DossierProvider>
  )
}
