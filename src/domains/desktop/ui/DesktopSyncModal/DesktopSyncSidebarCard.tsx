import { Badge, Button, Card, Group, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconArrowsExchange } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DesktopSyncModal } from '@domains/desktop/ui/DesktopSyncModal/DesktopSyncModal';

export const DesktopSyncSidebarCard = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Card withBorder radius='md' shadow='sm' p='sm' bg='dark.8'>
        <Stack gap='xs'>
          <Group justify='space-between' align='center'>
            <Group gap='xs'>
              <ThemeIcon size='md' radius='md' variant='light' color='violet'>
                <IconArrowsExchange size={18} />
              </ThemeIcon>
              <Text component='h3' fw={700} size='sm'>
                {t('desktop.syncSidebarCard.title')}
              </Text>
            </Group>
            <Badge size='xs' variant='light' color='violet'>
              {t('desktop.syncModal.badge')}
            </Badge>
          </Group>

          <Text size='xs' c='dimmed'>
            {t('desktop.syncSidebarCard.description')}
          </Text>

          <Button
            size='xs'
            variant='light'
            color='violet'
            leftSection={<IconArrowsExchange size={14} />}
            onClick={() => setIsModalOpen(true)}
            fullWidth
          >
            {t('desktop.syncSidebarCard.button')}
          </Button>
        </Stack>
      </Card>

      <DesktopSyncModal opened={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default DesktopSyncSidebarCard;
