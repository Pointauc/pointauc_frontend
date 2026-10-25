import { Badge, Button, Card, Group, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconDeviceDesktop, IconDownload } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { openDesktopDownloadModal } from '@domains/desktop/ui/DesktopDownloadModal/openDesktopDownloadModal';

export const DesktopDownloadSidebarCard = () => {
  const { t } = useTranslation();

  return (
    <Card withBorder radius='md' shadow='sm' p='sm' bg='dark.8'>
      <Stack gap='xs'>
        <Group justify='space-between' align='center'>
          <Group gap='xs'>
            <ThemeIcon size='md' radius='md' variant='light' color='blue'>
              <IconDeviceDesktop size={18} />
            </ThemeIcon>
            <Text component='h3' fw={700} size='sm'>
              {t('desktop.sidebarCard.title')}
            </Text>
          </Group>
          <Badge size='xs' variant='light' color='blue'>
            {t('desktop.downloadModal.betaBadge')}
          </Badge>
        </Group>

        <Text size='xs' c='dimmed'>
          {t('desktop.sidebarCard.description')}
        </Text>

        <Button
          size='xs'
          variant='light'
          color='blue'
          leftSection={<IconDownload size={14} />}
          onClick={openDesktopDownloadModal}
          fullWidth
        >
          {t('desktop.sidebarCard.button')}
        </Button>
      </Stack>
    </Card>
  );
};

export default DesktopDownloadSidebarCard;
