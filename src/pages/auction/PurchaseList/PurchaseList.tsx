import { Group, Text } from '@mantine/core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { PURCHASE_SORT_OPTIONS } from '@constants/purchase.constants.ts';
import { RootState } from '@reducers';
import { Purchase } from '@reducers/Purchases/Purchases.ts';

import DragBidContext from '../DragBidContext/DragBidContext';
import DraggableRedemption from '../DraggableRedemption/DraggableRedemption';

import classes from './PurchaseList.module.css';

const PurchaseList: React.FC = () => {
  const { t } = useTranslation();
  const { purchases } = useSelector((root: RootState) => root.purchases);
  const {
    settings: { purchaseSort },
  } = useSelector((root: RootState) => root.aucSettings);

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
