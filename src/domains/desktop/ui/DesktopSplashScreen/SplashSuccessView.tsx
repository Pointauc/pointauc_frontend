import { Button, Card, Group, Stack, Text, Title } from '@mantine/core';
import { IconCircleCheck, IconDatabase, IconPlayerPlay, IconSettings } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export interface SplashSuccessViewProps {
  username?: string | null;
  archivesCount?: number;
  settingsCount?: number;
  onLaunch: () => void;
  inModal?: boolean;
}

export const SplashSuccessView = ({
  username,
  archivesCount = 0,
  settingsCount = 0,
  onLaunch,
  inModal = false,
}: SplashSuccessViewProps) => {
  const { t } = useTranslation();

  useEffect(() => {
    const launchTimer = setTimeout(() => {
      onLaunch();
    }, 2000);

    return () => {
      clearTimeout(launchTimer);
    };
  }, [onLaunch]);

  const content = (
    <Stack align='center' gap='lg'>
      <div className='w-20 h-20 rounded-full bg-emerald-950/60 border border-emerald-600/40 flex items-center justify-center text-emerald-400'>
        <IconCircleCheck size={48} />
      </div>

      <div>
        <Title order={3} className='text-zinc-100 font-bold mb-2'>
          {t('desktop.splash.success.title')}
        </Title>
        <Text size='sm' className='text-zinc-400 max-w-sm mx-auto'>
          {t('desktop.splash.success.description')}
        </Text>
      </div>

      <div className='w-full bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/80 text-left space-y-3'>
        <Text size='sm' fw={600} className='text-violet-300'>
          {username
            ? t('desktop.splash.success.greeting', { username })
            : t('desktop.splash.success.greetingGuest')}
        </Text>

        <Group gap='md' className='text-xs text-zinc-300 pt-1'>
          <div className='flex items-center gap-2'>
            <IconDatabase size={16} className='text-violet-400' />
            <span>{t('desktop.splash.success.summaryArchives', { count: archivesCount })}</span>
          </div>
          <div className='flex items-center gap-2'>
            <IconSettings size={16} className='text-violet-400' />
            <span>{t('desktop.splash.success.summarySettings', { count: settingsCount })}</span>
          </div>
        </Group>
      </div>

      <Button
        color='violet'
        size='md'
        fullWidth
        onClick={onLaunch}
        leftSection={<IconPlayerPlay size={18} />}
        className='bg-violet-600 hover:bg-violet-700 text-white font-medium shadow-md'
      >
        {t('desktop.splash.success.button')}
      </Button>
    </Stack>
  );

  if (inModal) {
    return <div className='w-full py-2'>{content}</div>;
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-[500px] w-full max-w-lg mx-auto px-4 py-8'>
      <Card withBorder padding='xl' radius='md' className='w-full bg-zinc-900/90 border-zinc-800 text-center shadow-xl'>
        {content}
      </Card>
    </div>
  );
};
