import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'br.com.dedilhadovivo',
  appName: 'Dedilhado Vivo',
  webDir: 'www',
  backgroundColor: '#172033',
  android: {
    backgroundColor: '#172033',
  },
  server: {
    androidScheme: 'https',
  },
};

export default config;
