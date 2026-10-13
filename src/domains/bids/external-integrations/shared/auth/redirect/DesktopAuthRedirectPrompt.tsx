import { Anchor, Center, Loader, Paper, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';

interface DesktopAuthRedirectPromptProps {
  protocolUrl: string;
}

const DesktopAuthRedirectPrompt = ({ protocolUrl }: DesktopAuthRedirectPromptProps) => {
  const { t } = useTranslation();

  return (
    <Center h='100vh' w='100vw' className='bg-[#1a1b1e] text-white p-4'>
      <Paper radius='md' p='xl' withBorder className='max-w-md w-full text-center bg-[#25262b] border-[#373a40]'>
        <Stack align='center' gap='md'>
          <Loader size='lg' />
          <Title order={3}>{t('desktop.oauth.title')}</Title>
          <Text c='dimmed' size='sm'>
            {t('desktop.oauth.description')}
          </Text>
          <Anchor href={protocolUrl} size='sm' className='text-blue-400 underline font-medium'>
            {t('desktop.oauth.openPointauc')}
          </Anchor>
        </Stack>
      </Paper>
    </Center>
  );
};

export default DesktopAuthRedirectPrompt;
