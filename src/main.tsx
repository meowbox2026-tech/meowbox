import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import { App } from './app/App'
import { isLocalDevelopment } from './app/devEnvironment'
import { PlayerProvider } from './state/PlayerContext'
import bundledTheme from './game/content/theme.json'
import { applyGameTheme } from './services/gameContent/theme'
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
import './styles/leaderboard.css'

applyGameTheme(bundledTheme)

document.documentElement.classList.toggle('native-platform', Capacitor.isNativePlatform())

const isLocalDev = isLocalDevelopment()

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
