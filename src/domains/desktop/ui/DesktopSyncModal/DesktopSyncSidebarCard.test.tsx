import { MantineProvider } from '@mantine/core';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import i18n from 'i18next';
import { FormProvider, useForm } from 'react-hook-form';
import { initReactI18next } from 'react-i18next';
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import enTranslations from '@assets/i18n/locales/en.json';
import * as syncApi from '@domains/desktop/api/desktopSyncApi';
import * as importDataModule from '@domains/desktop/lib/importDesktopData';
import { DesktopSyncSidebarCard } from '@domains/desktop/ui/DesktopSyncModal/DesktopSyncSidebarCard';
import SettingsSidebar from '@domains/user-settings-v2/ui/SettingsSidebar';
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
      aucSettings: () => ({
        presets: [],
        activePresetId: null,
        settings: {},
      }),
    },
  });
};

const FormWrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({ defaultValues: {} });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <Provider store={createTestStore()}>
      <MantineProvider>
        <FormWrapper>{component}</FormWrapper>
      </MantineProvider>
    </Provider>,
  );
};

describe('DesktopSyncSidebarCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sidebar card with sync button and opens modal when clicked', async () => {
    const mockSession = { sessionId: 'modal-sync-session-123', claimToken: 'token-abc' };
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
    vi.spyOn(syncApi, 'fetchDesktopSyncStatus').mockResolvedValue({ status: 'PENDING' });

    renderWithProviders(<DesktopSyncSidebarCard />);

    const syncButton = screen.getByRole('button', { name: 'Sync with Browser' });
    expect(syncButton).toBeInTheDocument();

    fireEvent.click(syncButton);

    await waitFor(() => {
      expect(syncApi.createDesktopSyncSession).toHaveBeenCalledTimes(1);
    });

    expect(openExternalMock).toHaveBeenCalledWith(
      'https://pointauc.com/desktop-sync?session=modal-sync-session-123',
    );

    expect(screen.getByText('Waiting for browser transfer...')).toBeInTheDocument();
  });

  it('renders Download App card on web browser and Sync with Browser card on desktop app in SettingsSidebar', () => {
    // 1. In browser environment
    vi.spyOn(desktopBridgeModule, 'checkIsDesktop').mockReturnValue(false);

    const { unmount } = renderWithProviders(<SettingsSidebar />);
    expect(screen.getByRole('button', { name: 'Download App' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sync with Browser' })).not.toBeInTheDocument();
    unmount();

    // 2. In desktop environment
    vi.spyOn(desktopBridgeModule, 'checkIsDesktop').mockReturnValue(true);

    renderWithProviders(<SettingsSidebar />);
    expect(screen.getByRole('button', { name: 'Sync with Browser' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Download App' })).not.toBeInTheDocument();
  });

  it('completes data import when claimed session arrives in modal', async () => {
    const mockSession = { sessionId: 'claim-session-999', claimToken: 'token-claim' };
    const mockPayload = {
      localStorage: { pointauc_username: 'StreamerJohn', theme: 'dark' },
      sessionStorage: {},
      indexedDb: [],
    };

    vi.spyOn(desktopBridgeModule, 'getPointaucDesktop').mockReturnValue({
      isDesktop: true,
      version: '1.0.0',
      publicOrigin: 'https://pointauc.com',
      openExternal: vi.fn().mockResolvedValue(undefined),
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
    const importSpy = vi.spyOn(importDataModule, 'importDesktopData').mockResolvedValue(undefined);

    renderWithProviders(<DesktopSyncSidebarCard />);

    fireEvent.click(screen.getByRole('button', { name: 'Sync with Browser' }));

    await waitFor(
      () => {
        expect(syncApi.claimDesktopSyncSession).toHaveBeenCalledWith('claim-session-999', 'token-claim');
        expect(importSpy).toHaveBeenCalledWith(mockPayload);
      },
      { timeout: 3000 },
    );

    await waitFor(() => {
      expect(screen.getByText('Transfer Complete!')).toBeInTheDocument();
      expect(screen.getByText('Welcome back, StreamerJohn!')).toBeInTheDocument();
    });
  });
});
