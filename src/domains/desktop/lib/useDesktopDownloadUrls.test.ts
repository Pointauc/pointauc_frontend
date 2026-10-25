import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DEFAULT_INSTALLER_URL,
  DEFAULT_PORTABLE_URL,
  RELEASES_PAGE_URL,
  resetCachedUrlsForTesting,
  useDesktopDownloadUrls,
} from '@domains/desktop/lib/useDesktopDownloadUrls';

describe('useDesktopDownloadUrls', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    resetCachedUrlsForTesting();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    resetCachedUrlsForTesting();
    vi.restoreAllMocks();
  });

  it('returns default fallback URLs immediately and resolves asset URLs from GitHub release API', async () => {
    const mockReleaseData = {
      tag_name: 'deploy-test123',
      assets: [
        {
          name: 'Pointauc-Setup-0.0.0-test123.exe',
          browser_download_url: 'https://github.com/Pointauc/pointauc_frontend/releases/download/deploy-test123/Pointauc-Setup-0.0.0-test123.exe',
        },
        {
          name: 'Pointauc-Portable-0.0.0-test123.zip',
          browser_download_url: 'https://github.com/Pointauc/pointauc_frontend/releases/download/deploy-test123/Pointauc-Portable-0.0.0-test123.zip',
        },
      ],
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockReleaseData,
    }) as unknown as typeof fetch;

    const { result } = renderHook(() => useDesktopDownloadUrls());

    // Initially defaults to working fallbacks
    expect(result.current.installerUrl).toBe(DEFAULT_INSTALLER_URL);
    expect(result.current.portableUrl).toBe(DEFAULT_PORTABLE_URL);
    expect(result.current.releasesPageUrl).toBe(RELEASES_PAGE_URL);

    // After fetch resolves, updates to dynamic assets
    await waitFor(() => {
      expect(result.current.installerUrl).toBe(
        'https://github.com/Pointauc/pointauc_frontend/releases/download/deploy-test123/Pointauc-Setup-0.0.0-test123.exe',
      );
      expect(result.current.portableUrl).toBe(
        'https://github.com/Pointauc/pointauc_frontend/releases/download/deploy-test123/Pointauc-Portable-0.0.0-test123.zip',
      );
      expect(result.current.tagName).toBe('deploy-test123');
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('prefers unversioned alias assets when available in release', async () => {
    const mockReleaseData = {
      tag_name: 'v1.0.0',
      assets: [
        {
          name: 'Pointauc-Setup-1.0.0.exe',
          browser_download_url: 'https://github.com/Pointauc/pointauc_frontend/releases/download/v1.0.0/Pointauc-Setup-1.0.0.exe',
        },
        {
          name: 'Pointauc-Setup.exe',
          browser_download_url: 'https://github.com/Pointauc/pointauc_frontend/releases/download/v1.0.0/Pointauc-Setup.exe',
        },
        {
          name: 'Pointauc-Portable.zip',
          browser_download_url: 'https://github.com/Pointauc/pointauc_frontend/releases/download/v1.0.0/Pointauc-Portable.zip',
        },
      ],
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockReleaseData,
    }) as unknown as typeof fetch;

    const { result } = renderHook(() => useDesktopDownloadUrls());

    await waitFor(() => {
      expect(result.current.installerUrl).toBe(
        'https://github.com/Pointauc/pointauc_frontend/releases/download/v1.0.0/Pointauc-Setup.exe',
      );
      expect(result.current.portableUrl).toBe(
        'https://github.com/Pointauc/pointauc_frontend/releases/download/v1.0.0/Pointauc-Portable.zip',
      );
    });
  });

  it('falls back to default URLs when API request fails', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network offline')) as unknown as typeof fetch;

    const { result } = renderHook(() => useDesktopDownloadUrls());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.installerUrl).toBe(DEFAULT_INSTALLER_URL);
    expect(result.current.portableUrl).toBe(DEFAULT_PORTABLE_URL);
  });
});
