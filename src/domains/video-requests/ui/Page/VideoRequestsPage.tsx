import { Paper, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';

const VideoRequestsPage = () => {
  const { t } = useTranslation();

  return (
    <main className='min-h-screen bg-slate-950 px-6 py-10 text-slate-50'>
      <div className='mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center'>
        <Paper
          radius='lg'
          shadow='xl'
          className='w-full max-w-2xl border border-slate-800 bg-slate-900/90 p-8'
        >
          <Stack gap='md'>
            <Title order={1} className='text-3xl font-semibold text-slate-50'>
              {t('videoRequests.page.title')}
            </Title>
            <Text size='lg' c='dimmed'>
              {t('videoRequests.page.description')}
            </Text>
          </Stack>
        </Paper>
      </div>
    </main>
  );
};

export default VideoRequestsPage;
