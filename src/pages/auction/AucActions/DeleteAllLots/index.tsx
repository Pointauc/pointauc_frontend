import { Anchor, Button, Tooltip } from '@mantine/core';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { AlertTypeEnum } from '@models/alert.model.ts';
import { RootState } from '@reducers';
import { resetPurchases, setPurchases } from '@reducers/Purchases/Purchases.ts';
import { resetSlots, setSlots } from '@reducers/Slots/Slots.ts';
import { addAlert, deleteAlert } from '@reducers/notifications/notifications.ts';

const DeleteAllLots = () => {
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
          <Anchor onClick={revertDeletion} c='inherit' fw='normal'>
            <Trans i18nKey='auc.revertClearAll' values={{ count: lotsAmount }} components={{ b: <b /> }} />
          </Anchor>
        ),
        duration: 1000 * 18,
        closable: false,
        showCountdown: true,
        static: true,
      }),
    );
  };

  return (
    <Tooltip label={t('auc.clearAll')}>
      <Button onClick={handleResetSlots} size='sm' variant='outline' color='primary.3'>
        <DeleteSweepIcon />
      </Button>
    </Tooltip>
  );
};

export default DeleteAllLots;
