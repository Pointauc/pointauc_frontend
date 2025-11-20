import { FC, useCallback } from 'react';
import { Card, Badge, Group, Text, Stack, ActionIcon } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { Overlay } from '../../../model/overlay.types';
import UrlControls from '../../UrlControls';
import './OverlayCard.scss';

interface OverlayCardProps {
  overlay: Overlay;
  onEdit: (overlay: Overlay) => void;
  onDelete: (overlay: Overlay) => void;
}

const OverlayCard: FC<OverlayCardProps> = ({ overlay, onEdit, onDelete }) => {
  const { t } = useTranslation();

  const handleCardClick = useCallback(() => {
    onEdit(overlay);
  }, [overlay, onEdit]);

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card click when delete button is clicked
      onDelete(overlay);
    },
    [overlay, onDelete],
  );

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'Auction':
        return 'blue';
      case 'Wheel':
        return 'green';
      default:
        return 'gray';
    }
  };

  return (
    <Card
      className='overlay-card'
      withBorder
      padding='md'
      radius='md'
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      <Stack gap='sm' style={{ height: '100%' }}>
        {/* Header with badge and delete button */}
        <Group justify='space-between' align='flex-start'>
          {/* Overlay name */}
          <Text size='lg' fw={600} lineClamp={2} style={{ flex: 1 }}>
            {overlay.name}
          </Text>
          <Group gap='xs'>
            <Badge color={getBadgeColor(overlay.type)} variant='filled' size='sm'>
              {t(`overlays.overlayTypes.${overlay.type}`)}
            </Badge>
            <ActionIcon
              variant='light'
              color='red'
              size='md'
              onClick={handleDeleteClick}
              className='delete-button'
              aria-label={t('overlays.deleteOverlay')}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        </Group>

        <Text
          size='sm'
          c='dimmed'
          ta='center'
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {t('overlays.clickToEdit')}
        </Text>

        <UrlControls overlayId={overlay.id} />
      </Stack>
    </Card>
  );
};

export default OverlayCard;
