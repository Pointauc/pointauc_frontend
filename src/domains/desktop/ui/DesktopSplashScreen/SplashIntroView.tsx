import { Badge, Button, Card, Group, Stack, Text, Title } from '@mantine/core';
import { IconCheck, IconDeviceDesktopCheck, IconSparkles } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export interface SplashIntroViewProps {
  onStartFresh: () => void;
  onStartTransfer: () => void;
  isLoading?: boolean;
}

export const SplashIntroView = ({ onStartFresh, onStartTransfer, isLoading = false }: SplashIntroViewProps) => {
  const { t } = useTranslation();

  return (
    <div className='flex flex-col items-center justify-center min-h-[500px] w-full max-w-4xl mx-auto px-4 py-8'>
      <div className='flex flex-col items-center text-center mb-8'>
        <div className='w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mb-4 shadow-lg border border-zinc-700'>
          <img src='/favicon-96x96.png' alt='Pointauc' className='w-10 h-10 object-contain' />
        </div>
        <Title order={2} className='text-zinc-100 font-bold mb-2'>
          {t('desktop.splash.title')}
        </Title>
        <Text size='md' className='text-zinc-400 max-w-lg'>
          {t('desktop.splash.subtitle')}
        </Text>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 w-full'>
        {/* Option 1: Start from Scratch */}
        <Card
          withBorder
          padding='xl'
          radius='md'
          className='flex flex-col justify-between bg-zinc-900/90 border-zinc-800 hover:border-zinc-700 transition-colors'
        >
          <Stack gap='md'>
            <div className='w-12 h-12 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-300'>
              <IconSparkles size={28} />
            </div>

            <div>
              <Title order={4} className='text-zinc-100 font-semibold mb-2'>
                {t('desktop.splash.startScratch.title')}
              </Title>
              <Text size='sm' className='text-zinc-400 leading-relaxed'>
                {t('desktop.splash.startScratch.description')}
              </Text>
            </div>
          </Stack>

          <Button
            variant='default'
            size='md'
            mt='xl'
            fullWidth
            onClick={onStartFresh}
            disabled={isLoading}
            className='border-zinc-700 text-zinc-200 hover:bg-zinc-800'
          >
            {t('desktop.splash.startScratch.button')}
          </Button>
        </Card>

        {/* Option 2: Carry all data from web browser (Recommended) */}
        <Card
          withBorder
          padding='xl'
          radius='md'
          className='flex flex-col justify-between bg-zinc-900/90 border-violet-800/60 hover:border-violet-700 transition-colors relative'
        >
          <Stack gap='md'>
            <Group justify='space-between' align='center'>
              <div className='w-12 h-12 rounded-lg bg-violet-950/60 flex items-center justify-center text-violet-400 border border-violet-800/40'>
                <IconDeviceDesktopCheck size={28} />
              </div>
              <Badge variant='filled' color='violet' size='sm' radius='sm'>
                {t('desktop.splash.transferBrowser.badge')}
              </Badge>
            </Group>

            <div>
              <Title order={4} className='text-zinc-100 font-semibold mb-2'>
                {t('desktop.splash.transferBrowser.title')}
              </Title>
              <Text size='sm' className='text-zinc-400 leading-relaxed mb-4'>
                {t('desktop.splash.transferBrowser.description')}
              </Text>

              <div className='space-y-2 pt-2 border-t border-zinc-800/80'>
                <div className='flex items-center text-xs text-zinc-300'>
                  <IconCheck size={16} className='text-violet-400 mr-2 shrink-0' />
                  <span>{t('desktop.splash.transferBrowser.highlights.account')}</span>
                </div>
                <div className='flex items-center text-xs text-zinc-300'>
                  <IconCheck size={16} className='text-violet-400 mr-2 shrink-0' />
                  <span>{t('desktop.splash.transferBrowser.highlights.archives')}</span>
                </div>
                <div className='flex items-center text-xs text-zinc-300'>
                  <IconCheck size={16} className='text-violet-400 mr-2 shrink-0' />
                  <span>{t('desktop.splash.transferBrowser.highlights.settings')}</span>
                </div>
              </div>
            </div>
          </Stack>

          <Button
            color='violet'
            size='md'
            mt='xl'
            fullWidth
            loading={isLoading}
            onClick={onStartTransfer}
            className='bg-violet-600 hover:bg-violet-700 text-white font-medium shadow-sm'
          >
            {t('desktop.splash.transferBrowser.button')}
          </Button>
        </Card>
      </div>
    </div>
  );
};
