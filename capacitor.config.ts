import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.studiovv.quotaionsystem',
  appName: 'Meow Line',
  webDir: 'dist',
  backgroundColor: '#fff8e8',
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#fff8e8'
    }
  }
}

export default config
