const PROTOCOL_SCHEME = 'pointauc';

export const parseDesktopSyncProtocol = (url: string): string | undefined => {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== `${PROTOCOL_SCHEME}:`) {
      return undefined;
    }

    const host = parsedUrl.host;
    const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
    const isDesktopSync = host === 'desktop-sync' || pathSegments[0] === 'desktop-sync';

    if (!isDesktopSync) {
      return undefined;
    }

    const session = parsedUrl.searchParams.get('session') ?? parsedUrl.searchParams.get('sessionId');
    return session || undefined;
  } catch {
    return undefined;
  }
};
