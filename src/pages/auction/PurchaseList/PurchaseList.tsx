import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Group, Text } from '@mantine/core';
import { ThunkDispatch } from 'redux-thunk';
import { useTranslation } from 'react-i18next';

import { RootState } from '@reducers';
import { processRedemption, Purchase } from '@reducers/Purchases/Purchases.ts';
import { PURCHASE_SORT_OPTIONS } from '@constants/purchase.constants.ts';
import { globalBidsEventBus } from '@domains/bids/lib/globalBidsEventBus.ts';

import DraggableRedemption from '../DraggableRedemption/DraggableRedemption';
import DragBidContext from '../DragBidContext/DragBidContext';

import classes from './PurchaseList.module.css';

const PurchaseList: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const { purchases } = useSelector((root: RootState) => root.purchases);
  const {
    settings: { purchaseSort },
  } = useSelector((root: RootState) => root.aucSettings);

  const handleRedemption = useCallback(
    (redemption: Purchase): void => {
      dispatch(processRedemption(redemption));
    },
    [dispatch],
  );

  const compareValues = (a: string | number, b: string | number): number => {
    if (a === b) {
      return 0;
    }
    return a > b ? 1 : -1;
  };

  const sortedPurchases = useMemo(() => {
    const { key, order } = PURCHASE_SORT_OPTIONS[purchaseSort || 0];
    const orderModifier = order === 'ascend' ? 1 : -1;

    return [...purchases].sort((a: Purchase, b: Purchase) => compareValues(a[key], b[key]) * orderModifier);
  }, [purchaseSort, purchases]);

  useEffect(() => {
    const handleBid = (bid: Purchase) => handleRedemption(bid);
    globalBidsEventBus.on('bid', handleBid);

    return () => {
      globalBidsEventBus.off('bid', handleBid);
    };
  }, [handleRedemption]);

  return (
    <div className={classes.container}>
      <DragBidContext />
      <div className={classes.list}>
        {sortedPurchases.map((purchase) => (
          <DraggableRedemption {...purchase} key={purchase.id} />
        ))}
      </div>
      {!!purchases.length && (
        <Group className={classes.totalPurchases} gap='xs'>
          <Text>{t('bid.totalBids')}</Text>
          <Text fw={600}>{purchases.length}</Text>
        </Group>
      )}
    </div>
  );
};

export default PurchaseList;
