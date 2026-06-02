import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.app.medicinedelivery',
  appName: 'Medicine Delivery App',
  webDir: 'www',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'http',
    cleartext: true
  }
};

export default config;
