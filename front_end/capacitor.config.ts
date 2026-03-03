import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.valkyr.app',
  appName: 'ValkyrApp',
  webDir: 'dist',
  server: {
    cleartext: true
  }
};

export default config;
