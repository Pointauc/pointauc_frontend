import { Button, Card, CopyButton, Group, Loader, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowLeft, IconCheck, IconCopy, IconExternalLink, IconFileArrowRight } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { getPointaucDesktop } from '@shared/lib/desktop/checkIsDesktop';

export interface SplashWaitingViewProps {
  syncUrl: string;
  onSwitchToFileImport: () => void;
  onCancel: () => void;
}

export const SplashWaitingView = ({ syncUrl, onSwitchToFileImport, onCancel }: SplashWaitingViewProps) => {
  const { t } = useTranslation();
  const desktopBridge = getPointaucDesktop();

  const handleOpenBrowser = () => {
    if (desktopBridge?.openExternal) {
      desktopBridge.openExternal(syncUrl);
    } else {
      window.open(syncUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-[500px] w-full max-w-xl mx-auto px-4 py-8'>
      <Card withBorder padding='xl' radius='md' className='w-full bg-zinc-900/90 border-zinc-800 text-center shadow-lg'>
        <Stack align='center' gap='lg'>
          <div className='w-16 h-16 rounded-full bg-violet-950/60 border border-violet-800/50 flex items-center justify-center text-violet-400'>
            <Loader color='violet' size='md' type='dots' />
          </div>

          <div>
            <Title order={3} className='text-zinc-100 font-bold mb-2'>
              {t('desktop.splash.waiting.title')}
            </Title>
            <Text size='sm' className='text-zinc-400 max-w-md mx-auto leading-relaxed'>
              {t('desktop.splash.waiting.description')}
            </Text>
          </div>

          <div className='w-full bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80'>
            <TextInput
              value={syncUrl}
              readOnly
              size='sm'
              styles={{
                input: {
                  backgroundColor: '#18181b',
                  borderColor: '#27272a',
                  color: '#a1a1aa',
                  fontSize: '0.85rem',
                },
              }}
              rightSection={
                <CopyButton value={syncUrl} timeout={2000}>
                  {({ copied, copy }) => (
                    <Button
                      size='xs'
                      variant='subtle'
                      color={copied ? 'teal' : 'violet'}
                      onClick={copy}
                      className='mr-1'
                      leftSection={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                    >
                      {copied ? t('desktop.splash.waiting.copied') : t('desktop.splash.waiting.copyLink')}
                    </Button>
                  )}
                </CopyButton>
              }
              rightSectionWidth={110}
            />
          </div>

          <Group justify='center' gap='sm' className='w-full'>
            <Button
              variant='light'
              color='violet'
              size='sm'
              onClick={handleOpenBrowser}
              leftSection={<IconExternalLink size={16} />}
            >
              {t('desktop.splash.waiting.openBrowser')}
            </Button>

            <Button
              variant='subtle'
              color='gray'
              size='sm'
              onClick={onSwitchToFileImport}
              leftSection={<IconFileArrowRight size={16} />}
              className='text-zinc-300 hover:text-zinc-100'
            >
              {t('desktop.splash.waiting.manualFile')}
            </Button>
          </Group>

          <div className='w-full pt-4 border-t border-zinc-800/80 flex justify-center'>
            <Button
              variant='transparent'
              color='gray'
              size='xs'
              onClick={onCancel}
              leftSection={<IconArrowLeft size={14} />}
              className='text-zinc-400 hover:text-zinc-200'
            >
              {t('desktop.splash.waiting.cancel')}
            </Button>
          </div>
        </Stack>
      </Card>
    </div>
  );
};
