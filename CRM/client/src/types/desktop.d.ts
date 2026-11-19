export {};

declare global {
  interface DesktopAuthBridge {
    getRefreshToken: () => Promise<string | null>;
    setRefreshToken: (token: string) => Promise<void>;
    clearRefreshToken: () => Promise<void>;
  }

  interface DesktopBridge {
    isElectron: true;
    platform: string;
    auth: DesktopAuthBridge;
  }

  interface Window {
    desktop?: DesktopBridge;
  }
}
