import { Alert, Button, Card, Loader, Stack, Text, Title } from '@mantine/core';
import { IconAlertCircle, IconArrowLeft, IconFileImport, IconRefresh } from '@tabler/icons-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  claimDesktopSyncSession,
  createDesktopSyncSession,
  fetchDesktopSyncStatus,
} from '@domains/desktop/api/desktopSyncApi';
import { markDesktopSetupCompleted } from '@domains/desktop/lib/desktopSetupStorage';
import { importDesktopData } from '@domains/desktop/lib/importDesktopData';
import { getSyncPayloadSummary } from '@domains/desktop/lib/validateSyncPayload';
import { DesktopSyncDataPayload, DesktopSyncSession } from '@domains/desktop/model/types';
import { SplashFileImportView } from '@domains/desktop/ui/DesktopSplashScreen/SplashFileImportView';
import { SplashIntroView } from '@domains/desktop/ui/DesktopSplashScreen/SplashIntroView';
import { SplashSuccessView } from '@domains/desktop/ui/DesktopSplashScreen/SplashSuccessView';
import { SplashWaitingView } from '@domains/desktop/ui/DesktopSplashScreen/SplashWaitingView';
import { getPointaucDesktop } from '@shared/lib/desktop/checkIsDesktop';

export type DesktopSplashStep = 'intro' | 'waiting' | 'file-import' | 'importing' | 'success' | 'error';

export interface DesktopSplashScreenProps {
  onComplete: () => void;
}

const POLL_INTERVAL_MS = 1500;

export const DesktopSplashScreen = ({ onComplete }: DesktopSplashScreenProps) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<DesktopSplashStep>('intro');
  const [syncUrl, setSyncUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isInitializingTransfer, setIsInitializingTransfer] = useState(false);
  const [importedUsername, setImportedUsername] = useState<string | null>(null);
  const [summaryStats, setSummaryStats] = useState<{ archivesCount: number; settingsCount: number }>({
    archivesCount: 0,
    settingsCount: 0,
  });

  const activeSessionRef = useRef<DesktopSyncSession | null>(null);
  const isClaimingRef = useRef(false);

  const cleanupSessionPolling = useCallback(() => {
    activeSessionRef.current = null;
    isClaimingRef.current = false;
  }, []);

  const handleApplyImportedData = useCallback(async (payload: DesktopSyncDataPayload) => {
    setStep('importing');
    try {
      const summary = getSyncPayloadSummary(payload);
      setSummaryStats({
        archivesCount: summary.archivesCount,
        settingsCount: summary.settingsCount,
      });
      setImportedUsername(summary.detectedUsername ?? null);

      await importDesktopData(payload);
      setStep('success');
    } catch {
      setErrorMessage(t('desktop.splash.error.claimFailed'));
      setStep('error');
    }
  }, [t]);

  const handleClaimReadySession = useCallback(
    async (session: DesktopSyncSession) => {
      if (isClaimingRef.current) {
        return;
      }
      isClaimingRef.current = true;

      try {
        setStep('importing');
        const claimResult = await claimDesktopSyncSession(session.sessionId, session.claimToken);
        if (claimResult.success && claimResult.data) {
          await handleApplyImportedData(claimResult.data);
        } else {
          setErrorMessage(t('desktop.splash.error.claimFailed'));
          setStep('error');
        }
      } catch {
        setErrorMessage(t('desktop.splash.error.claimFailed'));
        setStep('error');
      } finally {
        isClaimingRef.current = false;
      }
    },
    [handleApplyImportedData, t],
  );

  const handleStartTransfer = useCallback(async () => {
    setIsInitializingTransfer(true);
    setErrorMessage(null);

    try {
      const session = await createDesktopSyncSession();
      activeSessionRef.current = session;

      const desktopBridge = getPointaucDesktop();
      const origin = desktopBridge?.publicOrigin || window.location.origin;
      const transferUrl = `${origin}/desktop-sync?session=${encodeURIComponent(session.sessionId)}`;
      setSyncUrl(transferUrl);

      if (desktopBridge?.openExternal) {
        desktopBridge.openExternal(transferUrl).catch(() => {
          // Ignore external browser open failure
        });
      }

      setStep('waiting');
    } catch {
      setErrorMessage(t('desktop.splash.error.sessionFailed'));
      setStep('error');
    } finally {
      setIsInitializingTransfer(false);
    }
  }, [t]);

  const handleStartFresh = useCallback(() => {
    markDesktopSetupCompleted();
    onComplete();
  }, [onComplete]);

  const handleLaunchApp = useCallback(() => {
    markDesktopSetupCompleted();
    if (typeof window !== 'undefined' && typeof window.location?.reload === 'function') {
      try {
        window.location.reload();
        return;
      } catch {
        // Fallback if reload is restricted
      }
    }
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (step !== 'waiting') {
      return;
    }

    const currentSession = activeSessionRef.current;
    if (!currentSession) {
      return;
    }

    let isCancelled = false;

    // Listen to protocol URL callbacks via bridge if available
    const desktopBridge = getPointaucDesktop();
    let unregisterSyncListener: (() => void) | undefined;

    if (desktopBridge?.onDesktopSyncSession) {
      unregisterSyncListener = desktopBridge.onDesktopSyncSession((incomingSessionId) => {
        if (!isCancelled && incomingSessionId === currentSession.sessionId) {
          handleClaimReadySession(currentSession);
        }
      });
    }

    // Polling fallback
    const pollInterval = setInterval(async () => {
      if (isCancelled || isClaimingRef.current) {
        return;
      }

      try {
        const response = await fetchDesktopSyncStatus(currentSession.sessionId);
        if (response.status === 'READY') {
          clearInterval(pollInterval);
          if (!isCancelled) {
            await handleClaimReadySession(currentSession);
          }
        } else if (response.status === 'EXPIRED') {
          clearInterval(pollInterval);
          if (!isCancelled) {
            setErrorMessage(t('desktop.splash.error.claimFailed'));
            setStep('error');
          }
        }
      } catch {
        // Continue polling despite occasional network hiccups
      }
    }, POLL_INTERVAL_MS);

    return () => {
      isCancelled = true;
      clearInterval(pollInterval);
      if (unregisterSyncListener) {
        unregisterSyncListener();
      }
    };
  }, [step, handleClaimReadySession, t]);

  const handleCancelWaiting = () => {
    cleanupSessionPolling();
    setStep('intro');
  };

  const handleSwitchToFileImport = () => {
    cleanupSessionPolling();
    setStep('file-import');
  };

  return (
    <div className='min-h-screen w-full flex items-center justify-center bg-zinc-950 text-zinc-100 select-none'>
      {step === 'intro' && (
        <SplashIntroView
          onStartFresh={handleStartFresh}
          onStartTransfer={handleStartTransfer}
          isLoading={isInitializingTransfer}
        />
      )}

      {step === 'waiting' && (
        <SplashWaitingView
          syncUrl={syncUrl}
          onSwitchToFileImport={handleSwitchToFileImport}
          onCancel={handleCancelWaiting}
        />
      )}

      {step === 'file-import' && (
        <SplashFileImportView
          onFileImport={handleApplyImportedData}
          onCancel={() => setStep('intro')}
        />
      )}

      {step === 'importing' && (
        <div className='flex flex-col items-center justify-center min-h-[500px] w-full max-w-md mx-auto px-4 py-8'>
          <Card withBorder padding='xl' radius='md' className='w-full bg-zinc-900/90 border-zinc-800 text-center shadow-lg'>
            <Stack align='center' gap='lg'>
              <Loader color='violet' size='lg' />
              <div>
                <Title order={3} className='text-zinc-100 font-bold mb-2'>
                  {t('desktop.sync.transferring')}
                </Title>
                <Text size='sm' className='text-zinc-400'>
                  {t('desktop.splash.transferBrowser.description')}
                </Text>
              </div>
            </Stack>
          </Card>
        </div>
      )}

      {step === 'success' && (
        <SplashSuccessView
          username={importedUsername}
          archivesCount={summaryStats.archivesCount}
          settingsCount={summaryStats.settingsCount}
          onLaunch={handleLaunchApp}
        />
      )}

      {step === 'error' && (
        <div className='flex flex-col items-center justify-center min-h-[500px] w-full max-w-md mx-auto px-4 py-8'>
          <Card withBorder padding='xl' radius='md' className='w-full bg-zinc-900/90 border-zinc-800 shadow-lg text-center'>
            <Stack align='center' gap='lg'>
              <div className='w-16 h-16 rounded-full bg-red-950/60 border border-red-800/40 flex items-center justify-center text-red-400'>
                <IconAlertCircle size={36} />
              </div>

              <div>
                <Title order={3} className='text-zinc-100 font-bold mb-2'>
                  {t('desktop.splash.error.claimFailed')}
                </Title>
                {errorMessage && (
                  <Alert color='red' variant='light' radius='md' className='text-left mt-2'>
                    {errorMessage}
                  </Alert>
                )}
              </div>

              <div className='w-full space-y-2 pt-2'>
                <Button
                  color='violet'
                  fullWidth
                  onClick={() => setStep('intro')}
                  leftSection={<IconRefresh size={18} />}
                >
                  {t('desktop.splash.error.retry')}
                </Button>

                <Button
                  variant='subtle'
                  color='gray'
                  fullWidth
                  onClick={() => setStep('file-import')}
                  leftSection={<IconFileImport size={18} />}
                  className='text-zinc-400 hover:text-zinc-200'
                >
                  {t('desktop.splash.waiting.manualFile')}
                </Button>

                <Button
                  variant='transparent'
                  color='gray'
                  size='xs'
                  onClick={handleStartFresh}
                  leftSection={<IconArrowLeft size={14} />}
                  className='text-zinc-500 hover:text-zinc-300'
                >
                  {t('desktop.splash.startScratch.button')}
                </Button>
              </div>
            </Stack>
          </Card>
        </div>
      )}
    </div>
  );
};
