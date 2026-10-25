import { MantineProvider } from '@mantine/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

import enTranslations from '@assets/i18n/locales/en.json';
import * as syncApi from '@domains/desktop/api/desktopSyncApi';
import * as exportModule from '@domains/desktop/lib/exportBrowserData';
import { DesktopSyncExportView } from '@domains/desktop/ui/DesktopSyncExportView/DesktopSyncExportView';

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: {
      translation: enTranslations,
    },
  },
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

const createTestStore = (username = 'StreamerTest') => {
  return configureStore({
    reducer: {
      user: () => ({ username }),
    },
  });
};

const renderExportView = (
  initialEntry = '/desktop-sync?session=session-99',
  testStore = createTestStore(),
) => {
  return render(
    <Provider store={testStore}>
      <MantineProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <DesktopSyncExportView />
        </MemoryRouter>
      </MantineProvider>
    </Provider>,
  );
};

describe('DesktopSyncExportView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.cookie = 'userSession=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'userSession.sig=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.localStorage.clear();
  });

  it('renders sync view and uploads data when transfer button is clicked', async () => {
    const mockPayload = {
      localStorage: { key: 'val' },
      sessionStorage: {},
      indexedDb: [],
    };

    vi.spyOn(exportModule, 'exportBrowserData').mockResolvedValue(mockPayload);
    const uploadSpy = vi.spyOn(syncApi, 'uploadDesktopSyncData').mockResolvedValue(undefined);

    renderExportView('/desktop-sync?session=session-99');

    expect(screen.getByText('Transfer Data to Pointauc Desktop')).toBeInTheDocument();

    const transferButton = screen.getByRole('button', { name: 'Transfer to Pointauc Desktop' });
    await waitFor(() => {
      expect(transferButton).not.toBeDisabled();
    });
    fireEvent.click(transferButton);

    await waitFor(() => {
      expect(exportModule.exportBrowserData).toHaveBeenCalled();
      expect(uploadSpy).toHaveBeenCalledWith('session-99', mockPayload);
      expect(screen.getByText('Transfer Successful!')).toBeInTheDocument();
    });
  });

  it('saves username and session cookies to localStorage when transfer button is clicked', async () => {
    document.cookie = 'userSession=sample-sess-token-xyz; path=/';
    document.cookie = 'userSession.sig=sample-sess-sig-xyz; path=/';

    const mockPayload = {
      localStorage: {},
      sessionStorage: {},
      indexedDb: [],
    };

    vi.spyOn(exportModule, 'exportBrowserData').mockResolvedValue(mockPayload);
    vi.spyOn(syncApi, 'uploadDesktopSyncData').mockResolvedValue(undefined);

    renderExportView('/desktop-sync?session=session-100', createTestStore('StreamerPro'));

    expect(screen.getByText('Signed in as StreamerPro')).toBeInTheDocument();

    const transferButton = screen.getByRole('button', { name: 'Transfer to Pointauc Desktop' });
    await waitFor(() => {
      expect(transferButton).not.toBeDisabled();
    });
    fireEvent.click(transferButton);

    await waitFor(() => {
      expect(window.localStorage.getItem('pointauc_username')).toBe('StreamerPro');
      expect(window.localStorage.getItem('pointauc_cookie_userSession')).toBe('sample-sess-token-xyz');
      expect(window.localStorage.getItem('pointauc_cookie_userSession_sig')).toBe('sample-sess-sig-xyz');
    });
  });

  it('shows guest mode when not signed in', () => {
    renderExportView('/desktop-sync?session=session-99', createTestStore(null as any));
    expect(screen.getByText('Guest mode (no active login)')).toBeInTheDocument();
  });

  it('shows missing session alert when no session query param is present', () => {
    renderExportView('/desktop-sync');
    expect(
      screen.getByText(
        'Invalid or missing sync session ID. Please launch sync from Pointauc Desktop.',
      ),
    ).toBeInTheDocument();
  });
});
