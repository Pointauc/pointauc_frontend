import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation, Trans } from 'react-i18next';
import { Button, Group, Modal, Stack, Text, Title, Alert } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

import { resetPurchases, setPurchases } from '@reducers/Purchases/Purchases.ts';
import { resetSlots, setSlots } from '@reducers/Slots/Slots.ts';
import { addAlert, deleteAlert } from '@reducers/notifications/notifications.ts';
import { AlertTypeEnum } from '@models/alert.model.ts';
import { RootState } from '@reducers';

interface ClearAllModalProps {
  opened: boolean;
  onClose: () => void;
}

const ClearAllModal: FC<ClearAllModalProps> = ({ opened, onClose }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const slots = useSelector((rootReducer: RootState) => rootReducer.slots.slots);
  const purchases = useSelector((rootReducer: RootState) => rootReducer.purchases.purchases);

  const handleResetSlots = (): void => {
    dispatch(resetSlots());
    dispatch(resetPurchases());

    const id = Math.random();
    const lotsAmount = slots.length;
    const backup = { slots, purchases };

    const revertDeletion = () => {
      dispatch(deleteAlert(id));
      dispatch(setSlots(backup.slots));
      dispatch(setPurchases(backup.purchases));
    };

    dispatch(
      addAlert({
        id,
        type: AlertTypeEnum.Info,
        message: (
          <Text
            onClick={revertDeletion}
            style={{ color: 'inherit', fontWeight: 'normal', cursor: 'pointer' }}
            component='span'
          >
            <Trans i18nKey='auc.revertClearAll' values={{ count: lotsAmount }} components={{ b: <b /> }} />
          </Text>
        ),
        duration: 1000 * 18,
        closable: false,
        showCountdown: true,
        static: true,
      }),
    );

    onClose();
  };

  const slotsCount = slots.length;
  const hasSlots = slotsCount > 0;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Title order={3}>{t('auc.clearAllConfirmation', { count: slotsCount })}</Title>}
      size='sm'
      centered
    >
      <Stack gap='md'>
        <Alert icon={<IconAlertTriangle size={16} />} color='orange'>
          <Text size='sm'>{hasSlots ? t('auc.clearAllConfirmationDetails') : t('auc.noLotsToDelete')}</Text>
        </Alert>

        <Group justify='flex-end' gap='sm'>
          <Button variant='subtle' onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button leftSection={<DeleteSweepIcon />} color='red' onClick={handleResetSlots} disabled={!hasSlots}>
            {t('auc.clearAll')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default ClearAllModal;
