export interface PointaucDesktopBridge {
  isDesktop: true;
  version: string;
  publicOrigin: string;
  openExternal: (url: string) => Promise<void>;
  onProtocolUrl: (listener: (url: string) => void) => () => void;
  onUpdateAvailable?: (listener: (info: any) => void) => () => void;
  onUpdateDownloaded?: (listener: (info: any) => void) => () => void;
  restartAndInstallUpdate?: () => void;
  startOAuth?: (request: { providerId: string; authorizeUrl: string }) => Promise<void>;
  onOAuthCallback?: (listener: (callback: { providerId: string; search: string }) => void) => () => void;
  onDesktopSyncSession?: (listener: (sessionId: string) => void) => () => void;
}

declare global {
  interface Window {
    pointaucDesktop?: PointaucDesktopBridge;
    __pointauc_perform_final_save?: () => Promise<void>;
  }
}
