import { MantineProvider } from '@mantine/core';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import enTranslations from '@assets/i18n/locales/en.json';
import * as syncApi from '@domains/desktop/api/desktopSyncApi';
import * as setupStorage from '@domains/desktop/lib/desktopSetupStorage';
import * as importDataModule from '@domains/desktop/lib/importDesktopData';
import { DesktopSplashScreen } from '@domains/desktop/ui/DesktopSplashScreen/DesktopSplashScreen';
import * as desktopBridgeModule from '@shared/lib/desktop/checkIsDesktop';

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

const createTestStore = () => {
  return configureStore({
    reducer: {
      user: () => ({ username: null }),
    },
  });
};

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <Provider store={createTestStore()}>
      <MantineProvider>{component}</MantineProvider>
    </Provider>,
  );
};

describe('DesktopSplashScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders intro view and completes setup on fresh start', () => {
    const markCompletedSpy = vi.spyOn(setupStorage, 'markDesktopSetupCompleted');
    const onCompleteMock = vi.fn();

    renderWithProviders(<DesktopSplashScreen onComplete={onCompleteMock} />);

    expect(screen.getByText('Welcome to Pointauc Desktop')).toBeInTheDocument();
    expect(screen.getByText('Start from Scratch')).toBeInTheDocument();
    expect(screen.getByText('Carry all data from web browser')).toBeInTheDocument();

    const startFreshButton = screen.getByRole('button', { name: 'Start Fresh' });
    fireEvent.click(startFreshButton);

    expect(markCompletedSpy).toHaveBeenCalled();
    expect(onCompleteMock).toHaveBeenCalled();
  });

  it('handles web sync flow when transfer button is clicked', async () => {
    const mockSession = { sessionId: 'test-session-42', claimToken: 'token-42' };
    const mockPayload = {
      localStorage: { pointauc_username: 'PointaucStreamer', theme: 'dark' },
      sessionStorage: {},
      indexedDb: [],
    };

    const openExternalMock = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(desktopBridgeModule, 'getPointaucDesktop').mockReturnValue({
      isDesktop: true,
      version: '1.0.0',
      publicOrigin: 'https://pointauc.com',
      openExternal: openExternalMock,
      onProtocolUrl: vi.fn(),
      onDesktopSyncSession: vi.fn(),
    });

    vi.spyOn(syncApi, 'createDesktopSyncSession').mockResolvedValue(mockSession);
    vi.spyOn(syncApi, 'fetchDesktopSyncStatus').mockResolvedValue({ status: 'READY' });
    vi.spyOn(syncApi, 'claimDesktopSyncSession').mockResolvedValue({
      success: true,
      userId: 1,
      data: mockPayload,
    });
    vi.spyOn(importDataModule, 'importDesktopData').mockResolvedValue(undefined);

    const onCompleteMock = vi.fn();
    renderWithProviders(<DesktopSplashScreen onComplete={onCompleteMock} />);

    const transferButton = screen.getByRole('button', { name: 'Transfer from Browser' });
    fireEvent.click(transferButton);

    await waitFor(() => {
      expect(syncApi.createDesktopSyncSession).toHaveBeenCalled();
      expect(openExternalMock).toHaveBeenCalledWith(
        'https://pointauc.com/desktop-sync?session=test-session-42',
      );
    });

    await waitFor(
      () => {
        expect(syncApi.claimDesktopSyncSession).toHaveBeenCalledWith('test-session-42', 'token-42');
        expect(importDataModule.importDesktopData).toHaveBeenCalledWith(mockPayload);
      },
      { timeout: 3000 },
    );

    await waitFor(() => {
      expect(screen.getByText('Transfer Complete!')).toBeInTheDocument();
      expect(screen.getByText('Welcome back, PointaucStreamer!')).toBeInTheDocument();
    });
  });

  it('allows switching to file import and importing payload file', async () => {
    vi.spyOn(importDataModule, 'importDesktopData').mockResolvedValue(undefined);
    vi.spyOn(syncApi, 'createDesktopSyncSession').mockResolvedValue({
      sessionId: 'sess-1',
      claimToken: 'tok-1',
    });
    vi.spyOn(syncApi, 'fetchDesktopSyncStatus').mockResolvedValue({ status: 'PENDING' });

    const onCompleteMock = vi.fn();
    renderWithProviders(<DesktopSplashScreen onComplete={onCompleteMock} />);

    fireEvent.click(screen.getByRole('button', { name: 'Transfer from Browser' }));

    await waitFor(() => {
      expect(screen.getByText('Waiting for browser transfer...')).toBeInTheDocument();
    });

    const fileImportSwitch = screen.getByRole('button', { name: 'Import from backup file instead' });
    fireEvent.click(fileImportSwitch);

    expect(screen.getByText('Import Backup File')).toBeInTheDocument();

    const validPayload = {
      localStorage: { pointauc_username: 'ImportedHero' },
      sessionStorage: {},
      indexedDb: [],
    };
    const file = new File([JSON.stringify(validPayload)], 'backup.pointauc', {
      type: 'application/json',
    });

    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).not.toBeNull();
    if (fileInput) {
      fireEvent.change(fileInput, { target: { files: [file] } });
    }

    await waitFor(() => {
      expect(importDataModule.importDesktopData).toHaveBeenCalledWith(validPayload);
      expect(screen.getByText('Transfer Complete!')).toBeInTheDocument();
    });
  });
});
