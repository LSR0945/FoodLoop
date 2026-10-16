import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.foodloop.app",
  appName: "FoodLoop",
  webDir: "dist-capacitor",
  server: {
    androidScheme: "https",
  },
  android: {
    buildOptions: {
      releaseType: "APK",
    },
  },
};

export default config;
