import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { PlayerProvider } from './state/PlayerContext'
import './styles/reset.css'
import './styles/components.css'
import './styles/screens.css'
import './styles/game.css'

const isLocalDev = import.meta.env.DEV
  && ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname)

const DevInspector = isLocalDev
  ? lazy(() => import('./devtools/InspectorOverlay').then(({ InspectorOverlay }) => ({ default: InspectorOverlay })))
  : null

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PlayerProvider>
      <App />
      {DevInspector && <Suspense fallback={null}><DevInspector /></Suspense>}
    </PlayerProvider>
  </StrictMode>
)
