import { Button, Popover, Tooltip } from '@mantine/core';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { checkShouldSmartSaveAuction } from '@domains/auction/history/lib/activeAuctionState';
import { finalizeAuctionHistory } from '@domains/auction/history/lib/finalizeAuctionHistory';
import { RootState } from '@reducers';
import { resetPurchases } from '@reducers/Purchases/Purchases.ts';
import { resetSlots } from '@reducers/Slots/Slots.ts';

const DeleteAllLots = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const slots = useSelector((rootReducer: RootState) => rootReducer.slots.slots);
  const purchases = useSelector((rootReducer: RootState) => rootReducer.purchases.purchases);
  const shouldSmartSave = useSelector(checkShouldSmartSaveAuction);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleResetSlots = async (): Promise<void> => {
    if (shouldSmartSave) {
      await finalizeAuctionHistory({ shouldSave: true });
      return;
    }

    dispatch(resetSlots());
    dispatch(resetPurchases());

    // const id = Math.random();
    // const lotsAmount = slots.length;
    // const backup = { slots, purchases };

    // const revertDeletion = () => {
    //   dispatch(deleteAlert(id));
    //   dispatch(setSlots(backup.slots));
    //   dispatch(setPurchases(backup.purchases));
    // };

    // dispatch(
    //   addAlert({
    //     id,
    //     type: AlertTypeEnum.Info,
    //     message: (
    //       <Anchor onClick={revertDeletion} c='inherit' fw='normal'>
    //         <Trans i18nKey='auc.revertClearAll' values={{ count: lotsAmount }} components={{ b: <b /> }} />
    //       </Anchor>
    //     ),
    //     duration: 1000 * 18,
    //     closable: false,
    //     showCountdown: true,
    //     static: true,
    //   }),
    // );
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    handleResetSlots().catch((err) => console.error(err));
  };

  return (
    <Tooltip label={t('auc.clearAll')}>
      <Popover position='top' offset={-1} opened={showConfirm}>
        <Popover.Target>
          <Button size='sm' onClick={() => setShowConfirm((prev) => !prev)} variant='outline' color='primary.3'>
            <DeleteSweepIcon />
          </Button>
        </Popover.Target>
        <Popover.Dropdown p='4'>
          <Button color='red' size='xs' variant='light' onClick={handleConfirm}>
            {t('common.confirm')}
          </Button>
        </Popover.Dropdown>
      </Popover>
    </Tooltip>
  );
};

export default DeleteAllLots;
