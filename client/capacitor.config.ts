import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.electleaf.gettoit",
  appName: "GetToIt",
  webDir: "dist",
  android: {
    // Use a real scheme so localStorage persists reliably across app launches.
    backgroundColor: "#0B0B0C",
  },
};

export default config;
