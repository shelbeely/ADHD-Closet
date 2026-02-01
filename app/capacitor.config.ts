import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.twinstyle.app',
  appName: 'Twin Style',
  webDir: 'public',
  server: {
    // For production builds, this will be overridden
    // In development, you can point to your local server
    url: process.env.CAPACITOR_SERVER_URL,
    cleartext: process.env.NODE_ENV === 'development', // Only allow cleartext in development
    androidScheme: 'https',
    iosScheme: 'capacitor',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#6750a4",
      showSpinner: false,
      androidSpinnerStyle: "small",
      iosSpinnerStyle: "small",
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: "#6750a4",
    },
  },
};

export default config;
