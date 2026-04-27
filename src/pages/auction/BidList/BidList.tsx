import { Button, Group, Popover, Text, Tooltip } from '@mantine/core';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { PURCHASE_SORT_OPTIONS } from '@constants/purchase.constants.ts';
import { RootState } from '@reducers';
import { Purchase, resetPurchases } from '@reducers/Purchases/Purchases.ts';

import DragBidContext from '../DragBidContext/DragBidContext';
import DraggableBid from '../DraggableBid/DraggableBid';

import classes from './BidList.module.css';

const BidList: React.FC = () => {
  const dispatch = useDispatch();
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

  const handleClearPurchases = (): void => {
    dispatch(resetPurchases());
  };

  const sortedPurchases = useMemo(() => {
    if (!purchaseSort || purchaseSort === 0) {
      return purchases;
    }

    const { key, order } = PURCHASE_SORT_OPTIONS[purchaseSort || 0];
    const orderModifier = order === 'ascend' ? 1 : -1;

    return [...purchases].sort((a: Purchase, b: Purchase) => compareValues(a[key], b[key]) * orderModifier);
  }, [purchaseSort, purchases]);

  return (
    <div className={classes.container}>
      <DragBidContext />
      <div className={classes.list}>
        {sortedPurchases.map((purchase) => (
          <DraggableBid {...purchase} key={purchase.id} isHotkeyTarget={sortedPurchases[0]?.id === purchase.id} />
        ))}
      </div>
      {!!purchases.length && (
        <div className='mt-3 flex w-full justify-between align-middle'>
          <div className='flex items-center gap-1'>
            <Text size='sm' c='dimmed'>
              {t('bid.totalBids')}{' '}
            </Text>
            <Text c='dimmed' fw={600}>
              {purchases.length}
            </Text>
          </div>
          <Popover position='top' offset={-2}>
            <Popover.Target>
              <Button
                variant='subtle'
                color='transparent'
                size='xs'
                c='white'
                h='auto'
                className='hover:underline'
                fw={400}
              >
                {t('bid.clearPurchases')}
              </Button>
            </Popover.Target>
            <Popover.Dropdown p='4'>
              <Button color='red' size='xs' variant='light' onClick={handleClearPurchases}>
                {t('common.confirm')}
              </Button>
            </Popover.Dropdown>
          </Popover>
        </div>
      )}
    </div>
  );
};

export default BidList;
