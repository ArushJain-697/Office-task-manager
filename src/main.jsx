import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import FrontPageTerminal from './components/FrontPageTerminal'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FrontPageTerminal />
  </StrictMode>,
)
