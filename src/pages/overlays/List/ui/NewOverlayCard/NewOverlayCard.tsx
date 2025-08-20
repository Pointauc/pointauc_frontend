import { FC } from 'react';
import { Card, Text, Center, Stack } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import './NewOverlayCard.scss';

interface NewOverlayCardProps {
  onClick?: () => void;
}

const NewOverlayCard: FC<NewOverlayCardProps> = ({ onClick }) => {
  const { t } = useTranslation();

  return (
    <Card
      className='new-overlay-card'
      withBorder
      padding='md'
      radius='md'
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        height: '100%',
        minHeight: '200px',
      }}
    >
      <Center style={{ height: '100%' }}>
        <Stack align='center' gap='md'>
          <IconPlus size={48} stroke={1.5} className='plus-icon' />
          <Text size='lg' fw={500} ta='center' className='new-overlay-text'>
            {t('overlays.newOverlay')}
          </Text>
        </Stack>
      </Center>
    </Card>
  );
};

export default NewOverlayCard;
