import { useEffect, useState } from 'react'

function pageIsHidden(): boolean {
  return document.hidden || document.visibilityState === 'hidden'
}

/** Pause active work whenever the browser tab or native web view is not foregrounded. */
export function usePageSuspended(): boolean {
  const [suspended, setSuspended] = useState(pageIsHidden)

  useEffect(() => {
    const suspend = () => setSuspended(true)
    const resume = () => { if (!pageIsHidden()) setSuspended(false) }
    const syncVisibility = () => setSuspended(pageIsHidden())

    syncVisibility()

    document.addEventListener('visibilitychange', syncVisibility)
    document.addEventListener('freeze', suspend)
    document.addEventListener('resume', resume)
    window.addEventListener('blur', suspend)
    window.addEventListener('focus', resume)
    window.addEventListener('pagehide', suspend)
    window.addEventListener('pageshow', resume)
    return () => {
      document.removeEventListener('visibilitychange', syncVisibility)
      document.removeEventListener('freeze', suspend)
      document.removeEventListener('resume', resume)
      window.removeEventListener('blur', suspend)
      window.removeEventListener('focus', resume)
      window.removeEventListener('pagehide', suspend)
      window.removeEventListener('pageshow', resume)
    }
  }, [])

  return suspended
}
