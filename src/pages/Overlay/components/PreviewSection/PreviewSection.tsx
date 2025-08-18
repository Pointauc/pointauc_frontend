import { FC } from 'react';
import { Stack, Title, Text, Center, Paper, ThemeIcon } from '@mantine/core';
import { IconEye } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { Overlay } from '../../../overlays/types/overlay.types';

interface PreviewSectionProps {
  overlay: Overlay;
}

const PreviewSection: FC<PreviewSectionProps> = ({ overlay }) => {
  const { t } = useTranslation();

  return (
    <Stack gap='lg' h='100%'>
      <Title order={3}>{t('overlays.preview.title')}</Title>

      <Paper
        withBorder
        p='xl'
        radius='md'
        style={{
          flex: 1,
          backgroundColor: '#f8f9fa',
          minHeight: '300px',
        }}
      >
        <Center h='100%'>
          <Stack align='center' gap='md'>
            <ThemeIcon size='xl' variant='light' color='gray'>
              <IconEye size={24} />
            </ThemeIcon>

            <Text size='lg' fw={500} ta='center' c='dimmed'>
              {t('overlays.preview.comingSoon')}
            </Text>

            <Text size='sm' ta='center' c='dimmed' maw={300}>
              {t('overlays.preview.description', { type: overlay.type.toLowerCase() })}
            </Text>

            <Paper withBorder p='sm' bg='white' radius='sm'>
              <Text size='xs' c='dimmed'>
                {t('overlays.preview.urlLabel', { pathname: `view/${overlay.id}` })}
              </Text>
            </Paper>
          </Stack>
        </Center>
      </Paper>
    </Stack>
  );
};

export default PreviewSection;
