import { FC } from 'react';
import { Card, Text, Center, Stack } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import styles from './NewOverlayCard.module.css';

interface NewOverlayCardProps {
  onClick?: () => void;
}

const NewOverlayCard: FC<NewOverlayCardProps> = ({ onClick }) => {
  const { t } = useTranslation();

  return (
    <Card
      className={styles.newOverlayCard}
      withBorder
      padding='md'
      radius='md'
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        minHeight: '200px',
      }}
    >
      <Center style={{ height: '100%' }}>
        <Stack align='center' gap='md'>
          <IconPlus size={48} stroke={1.5} className={styles.plusIcon} />
          <Text size='lg' fw={500} ta='center' className={styles.newOverlayText}>
            {t('overlays.newOverlay')}
          </Text>
        </Stack>
      </Center>
    </Card>
  );
};

export default NewOverlayCard;
