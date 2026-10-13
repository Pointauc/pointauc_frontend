export interface ParsedDesktopOAuthProtocol {
  providerId: string;
  search: string;
}

export const parseDesktopOAuthProtocol = (url: string): ParsedDesktopOAuthProtocol | undefined => {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== 'pointauc:') {
      return undefined;
    }

    const searchParams = new URLSearchParams(parsedUrl.search);
    let providerId: string | undefined;

    const host = parsedUrl.host;
    const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);

    if (host === 'oauth-callback' || pathSegments[0] === 'oauth-callback') {
      providerId = searchParams.get('provider') ?? undefined;
      searchParams.delete('provider');
    } else if (host) {
      providerId = host;
    } else if (pathSegments.length > 0) {
      providerId = pathSegments[0];
    }

    if (!providerId) {
      return undefined;
    }

    const state = searchParams.get('state');
    if (state?.startsWith('desktop.')) {
      const originalState = state.slice('desktop.'.length);
      if (originalState) {
        searchParams.set('state', originalState);
      } else {
        searchParams.delete('state');
      }
    }

    return {
      providerId,
      search: searchParams.toString(),
    };
  } catch {
    return undefined;
  }
};
