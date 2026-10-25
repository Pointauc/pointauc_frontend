import { Alert, Button, Card, Loader, Stack, Text, Title } from '@mantine/core';
import { IconAlertCircle, IconArrowLeft, IconFileImport, IconRefresh } from '@tabler/icons-react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { markDesktopSetupCompleted } from '@domains/desktop/lib/desktopSetupStorage';
import { useDesktopSyncFlow } from '@domains/desktop/lib/useDesktopSyncFlow';
import { SplashFileImportView } from '@domains/desktop/ui/DesktopSplashScreen/SplashFileImportView';
import { SplashIntroView } from '@domains/desktop/ui/DesktopSplashScreen/SplashIntroView';
import { SplashSuccessView } from '@domains/desktop/ui/DesktopSplashScreen/SplashSuccessView';
import { SplashWaitingView } from '@domains/desktop/ui/DesktopSplashScreen/SplashWaitingView';

export interface DesktopSplashScreenProps {
  onComplete: () => void;
}

export const DesktopSplashScreen = ({ onComplete }: DesktopSplashScreenProps) => {
  const { t } = useTranslation();

  const handleSetupComplete = useCallback(() => {
    markDesktopSetupCompleted();
    onComplete();
  }, [onComplete]);

  const {
    step,
    setStep,
    syncUrl,
    errorMessage,
    isInitializingTransfer,
    importedUsername,
    summaryStats,
    handleStartTransfer,
    handleApplyImportedData,
    handleCancelWaiting,
    handleSwitchToFileImport,
    handleLaunchApp,
  } = useDesktopSyncFlow({
    initialStep: 'intro',
    onComplete: handleSetupComplete,
  });

  const handleStartFresh = useCallback(() => {
    handleSetupComplete();
  }, [handleSetupComplete]);

  const onLaunch = useCallback(() => {
    handleSetupComplete();
    handleLaunchApp();
  }, [handleSetupComplete, handleLaunchApp]);

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
          onLaunch={onLaunch}
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
                  onClick={handleStartTransfer}
                  leftSection={<IconRefresh size={18} />}
                >
                  {t('desktop.splash.error.retry')}
                </Button>

                <Button
                  variant='subtle'
                  color='gray'
                  fullWidth
                  onClick={handleSwitchToFileImport}
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

export default DesktopSplashScreen;
