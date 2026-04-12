import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { DossierProvider, useDossier } from './context/DossierContext'
import Typewriter from './Typewriter'
import HeistSlideDeck from './HeistSlideDeck'
import './index.css'

function AppContent() {
  const [submitted, setSubmitted] = useState(false);
  const { setDossierData } = useDossier();
  
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
          <HeistSlideDeck />
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
          <Typewriter onLockDossier={(data) => {
            setDossierData(data);
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
