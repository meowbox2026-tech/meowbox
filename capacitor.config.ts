import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.meowbox.puzzle',
  appName: 'Meow Box',
  webDir: 'dist',
  backgroundColor: '#f6b75c',
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#f6b75c'
    }
  }
}

export default config
