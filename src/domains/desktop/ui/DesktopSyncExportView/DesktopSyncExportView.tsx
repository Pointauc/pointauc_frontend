import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconCircleCheck,
  IconDatabase,
  IconDeviceDesktop,
  IconDownload,
  IconSend,
  IconSettings,
  IconUser,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';

import { uploadDesktopSyncData } from '@domains/desktop/api/desktopSyncApi';
import {
  discoverDatabaseNames,
  exportBrowserData,
  exportSingleIndexedDatabase,
} from '@domains/desktop/lib/exportBrowserData';
import { RootState } from '@reducers';

export const DesktopSyncExportView = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session') || searchParams.get('sessionId') || '';

  const { username } = useSelector((state: RootState) => state.user);

  const [archivesCount, setArchivesCount] = useState<number>(0);
  const [settingsCount, setSettingsCount] = useState<number>(0);
  const [isCountingData, setIsCountingData] = useState<boolean>(true);
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const countLocalBrowserData = async () => {
      try {
        const dbNames = await discoverDatabaseNames();
        let totalRecords = 0;

        for (const name of dbNames) {
          const exportedDb = await exportSingleIndexedDatabase(name);
          if (exportedDb) {
            for (const store of exportedDb.stores) {
              totalRecords += store.records.length;
            }
          }
        }

        if (!isCancelled) {
          setArchivesCount(totalRecords);
        }
      } catch {
        // Fallback to 0 if inspection fails
      }

      if (!isCancelled) {
        try {
          setSettingsCount(window.localStorage?.length || 0);
        } catch {
          setSettingsCount(0);
        }
        setIsCountingData(false);
      }
    };

    countLocalBrowserData();

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleTransfer = useCallback(async () => {
    if (!sessionId) {
      return;
    }

    setIsTransferring(true);
    setErrorMessage(null);

    try {
      if (username && typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem('pointauc_username', username);
        } catch {
          // Ignore storage write error
        }
      }

      const payload = await exportBrowserData();
      await uploadDesktopSyncData(sessionId, payload);

      setIsSuccess(true);

      const desktopProtocolUrl = `pointauc://desktop-sync?session=${encodeURIComponent(sessionId)}`;
      if (typeof window !== 'undefined') {
        try {
          window.location.href = desktopProtocolUrl;
        } catch {
          // Ignore navigation restriction in tests/restricted contexts
        }
      }
    } catch {
      setErrorMessage(t('desktop.sync.error'));
    } finally {
      setIsTransferring(false);
    }
  }, [sessionId, username, t]);

  const handleDownloadBackup = useCallback(async () => {
    setIsDownloading(true);

    try {
      if (username && typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem('pointauc_username', username);
        } catch {
          // Ignore storage write error
        }
      }

      const payload = await exportBrowserData();
      const jsonString = JSON.stringify(payload, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const downloadUrl = URL.createObjectURL(blob);

      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `pointauc-backup-${dayjs().format('YYYY-MM-DD-HH-mm')}.pointauc`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      URL.revokeObjectURL(downloadUrl);
    } catch {
      // Ignore download errors
    } finally {
      setIsDownloading(false);
    }
  }, [username]);

  const handleReturnToDesktop = () => {
    if (sessionId && typeof window !== 'undefined') {
      window.location.href = `pointauc://desktop-sync?session=${encodeURIComponent(sessionId)}`;
    }
  };

  return (
    <div className='min-h-screen w-full flex items-center justify-center bg-zinc-950 text-zinc-100 px-4 py-8 select-none'>
      <Card withBorder padding='xl' radius='md' className='w-full max-w-xl bg-zinc-900/90 border-zinc-800 shadow-xl'>
        <Stack gap='lg'>
          {/* Header */}
          <div className='text-center'>
            <div className='w-14 h-14 rounded-2xl bg-violet-950/60 border border-violet-800/40 flex items-center justify-center text-violet-400 mx-auto mb-3 shadow-md'>
              <IconDeviceDesktop size={30} />
            </div>
            <Title order={3} className='text-zinc-100 font-bold mb-1'>
              {t('desktop.sync.title')}
            </Title>
            <Text size='sm' className='text-zinc-400 max-w-md mx-auto'>
              {t('desktop.sync.subtitle')}
            </Text>
          </div>

          {!sessionId && (
            <Alert icon={<IconAlertCircle size={18} />} color='red' variant='light' radius='md'>
              {t('desktop.sync.noSession')}
            </Alert>
          )}

          {errorMessage && (
            <Alert icon={<IconAlertCircle size={18} />} color='red' variant='light' radius='md'>
              {errorMessage}
            </Alert>
          )}

          {isSuccess ? (
            <div className='p-6 bg-zinc-950/60 rounded-xl border border-emerald-800/40 text-center space-y-4'>
              <div className='w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-600/40 flex items-center justify-center text-emerald-400 mx-auto'>
                <IconCircleCheck size={40} />
              </div>
              <div>
                <Title order={4} className='text-zinc-100 font-semibold mb-1'>
                  {t('desktop.sync.successTitle')}
                </Title>
                <Text size='sm' className='text-zinc-400'>
                  {t('desktop.sync.successDescription')}
                </Text>
              </div>
              <Button
                color='violet'
                size='md'
                fullWidth
                onClick={handleReturnToDesktop}
                className='bg-violet-600 hover:bg-violet-700 text-white font-medium shadow-md'
              >
                {t('desktop.sync.openAppButton')}
              </Button>
            </div>
          ) : (
            <>
              {/* Account Card */}
              <div className='p-4 bg-zinc-950/60 rounded-xl border border-zinc-800/80 space-y-2'>
                <Text size='xs' fw={600} className='text-zinc-400 uppercase tracking-wider'>
                  {t('desktop.sync.accountTitle')}
                </Text>

                <Group justify='space-between' align='center'>
                  <Group gap='sm'>
                    {username ? (
                      <Avatar radius='xl' color='violet' size='md'>
                        {username.charAt(0).toUpperCase()}
                      </Avatar>
                    ) : (
                      <Avatar radius='xl' color='gray' size='md'>
                        <IconUser size={18} />
                      </Avatar>
                    )}

                    <div>
                      <Text size='sm' fw={600} className='text-zinc-200'>
                        {username
                          ? t('desktop.sync.signedInAs', { username })
                          : t('desktop.sync.guestMode')}
                      </Text>
                    </div>
                  </Group>

                  {username && (
                    <Badge variant='light' color='violet' size='sm'>
                      Active
                    </Badge>
                  )}
                </Group>
              </div>

              {/* Data Summary Card */}
              <div className='p-4 bg-zinc-950/60 rounded-xl border border-zinc-800/80 space-y-3'>
                <Text size='xs' fw={600} className='text-zinc-400 uppercase tracking-wider'>
                  {t('desktop.sync.localDataTitle')}
                </Text>

                {isCountingData ? (
                  <Group gap='xs' justify='center' py='xs'>
                    <Loader size='xs' color='violet' />
                    <Text size='xs' className='text-zinc-400'>
                      Loading summary...
                    </Text>
                  </Group>
                ) : (
                  <Group justify='space-between' className='text-xs text-zinc-300'>
                    <div className='flex items-center gap-2'>
                      <IconDatabase size={16} className='text-violet-400' />
                      <span>{t('desktop.sync.archivesFound', { count: archivesCount })}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <IconSettings size={16} className='text-violet-400' />
                      <span>{t('desktop.sync.settingsFound', { count: settingsCount })}</span>
                    </div>
                  </Group>
                )}
              </div>

              {/* Action Buttons */}
              <Stack gap='sm' pt='xs'>
                <Button
                  color='violet'
                  size='md'
                  fullWidth
                  loading={isTransferring}
                  disabled={!sessionId || isCountingData}
                  onClick={handleTransfer}
                  leftSection={<IconSend size={18} />}
                  className='bg-violet-600 hover:bg-violet-700 text-white font-medium shadow-md'
                >
                  {isTransferring ? t('desktop.sync.transferring') : t('desktop.sync.buttonTransfer')}
                </Button>

                <Button
                  variant='subtle'
                  color='gray'
                  size='sm'
                  fullWidth
                  loading={isDownloading}
                  onClick={handleDownloadBackup}
                  leftSection={<IconDownload size={16} />}
                  className='text-zinc-400 hover:text-zinc-200'
                >
                  {t('desktop.sync.buttonDownload')}
                </Button>
              </Stack>
            </>
          )}
        </Stack>
      </Card>
    </div>
  );
};
