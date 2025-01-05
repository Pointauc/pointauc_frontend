import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Link, Tooltip } from '@mui/material';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { Trans, useTranslation } from 'react-i18next';

import { resetPurchases, setPurchases } from '@reducers/Purchases/Purchases.ts';
import { resetSlots, setSlots } from '@reducers/Slots/Slots.ts';
import { addAlert, deleteAlert } from '@reducers/notifications/notifications.ts';
import { AlertTypeEnum } from '@models/alert.model.ts';
import { RootState } from '@reducers';

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
          <Link onClick={revertDeletion} style={{ color: 'inherit', fontWeight: 'normal' }} color='inherit'>
            <Trans i18nKey='auc.revertClearAll' values={{ count: lotsAmount }} components={{ b: <b /> }} />
          </Link>
        ),
        duration: 1000 * 18,
        closable: false,
        showCountdown: true,
        static: true,
      }),
    );
  };

  return (
    <Tooltip title={t('auc.clearAll')}>
      <Button onClick={handleResetSlots} startIcon={<DeleteSweepIcon />} />
    </Tooltip>
  );
};

export default DeleteAllLots;
