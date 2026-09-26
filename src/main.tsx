import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import { App } from './app/App'
import { PlayerProvider } from './state/PlayerContext'
import './styles/reset.css'
import './styles/stage.css'
import './styles/components.css'
import './styles/screens.css'
import './styles/levels.css'
import './styles/game.css'
import './styles/legal.css'
import './styles/native-assets.css'
import './styles/player-status.css'
import './styles/theme.css'

document.documentElement.classList.toggle('native-platform', Capacitor.isNativePlatform())

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
