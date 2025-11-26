import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, Modal, Stack, Text } from '@mantine/core';

interface RewardPresetsConfirmationProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const RewardPresetsConfirmation: FC<RewardPresetsConfirmationProps> = ({ open, onClose, onConfirm }) => {
  const { t } = useTranslation();

  const handleConfirmClick = (): void => {
    onConfirm();
    onClose();
  };

  return (
    <Modal opened={open} onClose={onClose} title={t('settings.twitch.rewardPresetsConfirmation.title')}>
      <Stack>
        <Text>{t('settings.twitch.rewardPresetsConfirmation.description')}</Text>
        <Group justify='flex-end'>
          <Button onClick={onClose} variant='outline'>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleConfirmClick}>{t('settings.twitch.rewardPresetsConfirmation.confirm')}</Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default RewardPresetsConfirmation;
