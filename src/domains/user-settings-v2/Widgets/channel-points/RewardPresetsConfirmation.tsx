import { Button, Modal, Text } from '@mantine/core';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

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
      <div className='flex flex-col gap-4'>
        <Text>{t('settings.twitch.rewardPresetsConfirmation.description')}</Text>
        <div className='flex justify-end gap-2'>
          <Button onClick={onClose} variant='outline'>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleConfirmClick}>{t('settings.twitch.rewardPresetsConfirmation.confirm')}</Button>
        </div>
      </div>
    </Modal>
  );
};

export default RewardPresetsConfirmation;
