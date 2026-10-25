import { useEffect, useState } from 'react';

const REPO_OWNER = 'Pointauc';
const REPO_NAME = 'pointauc_frontend';

export const LATEST_RELEASE_API = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`;
export const RELEASES_PAGE_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/latest`;

export const DEFAULT_INSTALLER_URL =
  'https://github.com/Pointauc/pointauc_frontend/releases/download/deploy-ebb3222/Pointauc-Setup-0.0.0-ebb3222.exe';
export const DEFAULT_PORTABLE_URL =
  'https://github.com/Pointauc/pointauc_frontend/releases/download/deploy-ebb3222/Pointauc-Portable-0.0.0-ebb3222.zip';

export interface GitHubAsset {
  name: string;
  browser_download_url: string;
}

export interface GitHubReleaseResponse {
  tag_name?: string;
  assets?: GitHubAsset[];
}

export interface DesktopDownloadUrls {
  installerUrl: string;
  portableUrl: string;
  releasesPageUrl: string;
  tagName?: string;
  isLoading: boolean;
}

let cachedUrls: DesktopDownloadUrls | null = null;
let activeFetchPromise: Promise<DesktopDownloadUrls> | null = null;

export const resetCachedUrlsForTesting = () => {
  cachedUrls = null;
  activeFetchPromise = null;
};

const fetchLatestDownloadUrls = async (): Promise<DesktopDownloadUrls> => {
  if (cachedUrls) {
    return cachedUrls;
  }

  try {
    const response = await fetch(LATEST_RELEASE_API);
    if (!response.ok) {
      throw new Error(`Failed to fetch latest release: ${response.status}`);
    }

    const data = (await response.json()) as GitHubReleaseResponse;
    const assets = Array.isArray(data.assets) ? data.assets : [];

    const installerAsset =
      assets.find((asset) => asset.name === 'Pointauc-Setup.exe') ??
      assets.find((asset) => asset.name.startsWith('Pointauc-Setup-') && asset.name.endsWith('.exe'));

    const portableAsset =
      assets.find((asset) => asset.name === 'Pointauc-Portable.zip') ??
      assets.find((asset) => asset.name.startsWith('Pointauc-Portable-') && asset.name.endsWith('.zip'));

    const resolvedUrls: DesktopDownloadUrls = {
      installerUrl: installerAsset?.browser_download_url || DEFAULT_INSTALLER_URL,
      portableUrl: portableAsset?.browser_download_url || DEFAULT_PORTABLE_URL,
      releasesPageUrl: RELEASES_PAGE_URL,
      tagName: data.tag_name,
      isLoading: false,
    };

    cachedUrls = resolvedUrls;
    return resolvedUrls;
  } catch {
    const fallbackUrls: DesktopDownloadUrls = {
      installerUrl: DEFAULT_INSTALLER_URL,
      portableUrl: DEFAULT_PORTABLE_URL,
      releasesPageUrl: RELEASES_PAGE_URL,
      isLoading: false,
    };
    return fallbackUrls;
  }
};

export const useDesktopDownloadUrls = (): DesktopDownloadUrls => {
  const [urls, setUrls] = useState<DesktopDownloadUrls>(() => {
    return (
      cachedUrls ?? {
        installerUrl: DEFAULT_INSTALLER_URL,
        portableUrl: DEFAULT_PORTABLE_URL,
        releasesPageUrl: RELEASES_PAGE_URL,
        isLoading: true,
      }
    );
  });

  useEffect(() => {
    if (cachedUrls) {
      setUrls(cachedUrls);
      return;
    }

    let isMounted = true;
    if (!activeFetchPromise) {
      activeFetchPromise = fetchLatestDownloadUrls().finally(() => {
        activeFetchPromise = null;
      });
    }

    activeFetchPromise.then((resolved) => {
      if (isMounted) {
        setUrls(resolved);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return urls;
};

export default useDesktopDownloadUrls;
