import { Alert, Button, Loader, Stack, Text, Title } from '@mantine/core';
import { IconAlertCircle, IconFileImport, IconRefresh } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { useDesktopSyncFlow } from '@domains/desktop/lib/useDesktopSyncFlow';
import { SplashFileImportView } from '@domains/desktop/ui/DesktopSplashScreen/SplashFileImportView';
import { SplashSuccessView } from '@domains/desktop/ui/DesktopSplashScreen/SplashSuccessView';
import { SplashWaitingView } from '@domains/desktop/ui/DesktopSplashScreen/SplashWaitingView';

export interface DesktopSyncModalContentProps {
  onClose: () => void;
}

export const DesktopSyncModalContent = ({ onClose }: DesktopSyncModalContentProps) => {
  const { t } = useTranslation();
  const {
    step,
    syncUrl,
    errorMessage,
    isInitializingTransfer,
    importedUsername,
    summaryStats,
    handleStartTransfer,
    handleApplyImportedData,
    handleSwitchToFileImport,
    handleLaunchApp,
  } = useDesktopSyncFlow({
    initialStep: 'waiting',
    autoStartTransfer: true,
    onComplete: onClose,
  });

  if (isInitializingTransfer) {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-center'>
        <Stack align='center' gap='md'>
          <Loader color='violet' size='md' />
          <Text size='sm' className='text-zinc-400'>
            {t('desktop.sync.transferring')}
          </Text>
        </Stack>
      </div>
    );
  }

  if (step === 'waiting') {
    return (
      <SplashWaitingView
        syncUrl={syncUrl}
        onSwitchToFileImport={handleSwitchToFileImport}
        onCancel={onClose}
        inModal
      />
    );
  }

  if (step === 'file-import') {
    return (
      <SplashFileImportView
        onFileImport={handleApplyImportedData}
        onCancel={() => {
          void handleStartTransfer();
        }}
        inModal
      />
    );
  }

  if (step === 'importing') {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-center'>
        <Stack align='center' gap='lg'>
          <Loader color='violet' size='lg' />
          <div>
            <Title order={4} className='text-zinc-100 font-bold mb-2'>
              {t('desktop.sync.transferring')}
            </Title>
            <Text size='sm' className='text-zinc-400'>
              {t('desktop.splash.transferBrowser.description')}
            </Text>
          </div>
        </Stack>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <SplashSuccessView
        username={importedUsername}
        archivesCount={summaryStats.archivesCount}
        settingsCount={summaryStats.settingsCount}
        onLaunch={handleLaunchApp}
        inModal
      />
    );
  }

  if (step === 'error') {
    return (
      <div className='flex flex-col items-center justify-center py-8 text-center'>
        <Stack align='center' gap='lg' className='w-full max-w-md'>
          <div className='w-14 h-14 rounded-full bg-red-950/60 border border-red-800/40 flex items-center justify-center text-red-400'>
            <IconAlertCircle size={32} />
          </div>

          <div>
            <Title order={4} className='text-zinc-100 font-bold mb-2'>
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
              onClick={() => {
                void handleStartTransfer();
              }}
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
              onClick={onClose}
              className='text-zinc-500 hover:text-zinc-300'
            >
              {t('common.cancel')}
            </Button>
          </div>
        </Stack>
      </div>
    );
  }

  return null;
};

export default DesktopSyncModalContent;
