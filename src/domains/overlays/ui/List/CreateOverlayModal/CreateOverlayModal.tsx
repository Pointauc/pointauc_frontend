import { Box, Card, Grid, Modal, Stack, Text } from '@mantine/core';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import AuctionOverlayPreview from '@assets/img/auction-overlay-preview.png';
import WheelOverlayPreview from '@assets/img/wheel-overlay-preview.png';

import { OverlayType } from '../../../model/overlay.types';

import styles from './CreateOverlayModal.module.css';

interface CreateOverlayModalProps {
  opened: boolean;
  onClose: () => void;
  onSelectType: (type: OverlayType) => void;
}

interface OverlayTypeCardProps {
  type: OverlayType;
  onClick: () => void;
}

const OverlayTypeCard: FC<OverlayTypeCardProps> = ({ type, onClick }) => {
  const { t } = useTranslation();

  const getOverlayConfig = (overlayType: OverlayType) => {
    switch (overlayType) {
      case 'Auction':
        return {
          title: t('overlays.overlayTypes.Auction'),
          description: t('overlays.auction.description'),
          sections: [
            t('overlays.auction.sections.bidTable'),
            t('overlays.auction.sections.timer'),
            t('overlays.auction.sections.rules'),
          ],
          preview: AuctionOverlayPreview,
        };
      case 'Wheel':
        return {
          title: t('overlays.overlayTypes.Wheel'),
          description: t('overlays.wheel.description'),
          sections: [
            t('overlays.wheel.sections.wheelDisplay'),
            t('overlays.wheel.sections.participants'),
            t('overlays.wheel.sections.results'),
          ],
          preview: WheelOverlayPreview,
        };
      default:
        return { description: '', sections: [] };
    }
  };

  const config = getOverlayConfig(type);

  return (
    <Card
      className={styles.overlayTypeCard}
      withBorder
      padding='lg'
      onClick={onClick}
      style={{ cursor: 'pointer', height: '100%' }}
    >
      <Stack gap='md'>
        <Text size='xl' fw={600} ta='center'>
          {config.title}
        </Text>

        {/* Preview Image Placeholder */}
        <Box className={styles.previewPlaceholder} style={{ backgroundImage: `url(${config.preview})` }} />

        <Text size='sm' c='dimmed' ta='center'>
          {config.description}
        </Text>

        <Stack gap='xs'>
          <Text size='sm' fw={500} c='dimmed'>
            {t('overlays.sections')}:
          </Text>
          {config.sections.map((section, index) => (
            <Text key={index} size='xs' c='dimmed' style={{ paddingLeft: '12px' }}>
              • {section}
            </Text>
          ))}
        </Stack>
      </Stack>
    </Card>
  );
};

const CreateOverlayModal: FC<CreateOverlayModalProps> = ({ opened, onClose, onSelectType }) => {
  const { t } = useTranslation();

  const handleTypeSelect = (type: OverlayType) => {
    onSelectType(type);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('overlays.chooseYourOverlay')}
      size='xl'
      centered
      className={styles.createOverlayModal}
    >
      <Grid gutter='md'>
        <Grid.Col span={6}>
          <OverlayTypeCard type='Auction' onClick={() => handleTypeSelect('Auction')} />
        </Grid.Col>
        <Grid.Col span={6}>
          <OverlayTypeCard type='Wheel' onClick={() => handleTypeSelect('Wheel')} />
        </Grid.Col>
      </Grid>
    </Modal>
  );
};

export default CreateOverlayModal;
