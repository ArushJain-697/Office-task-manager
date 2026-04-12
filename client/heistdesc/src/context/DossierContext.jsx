import { createContext, useContext, useState } from 'react'

const DossierContext = createContext(null)

export function DossierProvider({ children }) {
  const [dossierData, setDossierData] = useState(null)
  return (
    <DossierContext.Provider value={{ dossierData, setDossierData }}>
      {children}
    </DossierContext.Provider>
  )
}

export const useDossier = () => useContext(DossierContext)
