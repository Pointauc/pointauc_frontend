import { Box, Card, Grid, Modal, Stack, Text } from '@mantine/core';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

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
          description: t('overlays.auction.description'),
          sections: [
            t('overlays.auction.sections.bidTable'),
            t('overlays.auction.sections.timer'),
            t('overlays.auction.sections.rules'),
          ],
        };
      case 'Wheel':
        return {
          description: t('overlays.wheel.description'),
          sections: [
            t('overlays.wheel.sections.wheelDisplay'),
            t('overlays.wheel.sections.participants'),
            t('overlays.wheel.sections.results'),
          ],
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
          {type}
        </Text>

        {/* Preview Image Placeholder */}
        <Box
          className={styles.previewPlaceholder}
          style={{
            height: '120px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '2px dashed #dee2e6',
          }}
        />

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
