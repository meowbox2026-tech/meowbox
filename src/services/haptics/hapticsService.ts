import { Capacitor } from '@capacitor/core'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

export async function playPlacementHaptic(enabled: boolean, isSuccess = true): Promise<void> {
  if (!enabled) return
  try {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: isSuccess ? ImpactStyle.Light : ImpactStyle.Medium })
      return
    }
    window.navigator.vibrate?.(isSuccess ? 12 : [12, 20, 12])
  } catch {
    // Haptics should never prevent a puzzle action from completing.
  }
}
