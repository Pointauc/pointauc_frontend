import { Badge, Button, Popover, SegmentedControl, Text } from '@mantine/core';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { PURCHASE_SORT_OPTIONS } from '@constants/purchase.constants.ts';
import { RootState } from '@reducers';
import { addActionLogEntry, createActionLogEntry, revertActionLogEntry } from '@reducers/ActionsLog/ActionsLog.ts';
import { Purchase, resetPurchases } from '@reducers/Purchases/Purchases.ts';

import DragBidContext from '../DragBidContext/DragBidContext';
import DraggableBid from '../DraggableBid/DraggableBid';

import ActionLogsList from './actionLogs/ActionLogsList';
import { ACTION_LOG_REVERT_ANIMATION_MS } from './actionLogs/constants';
import classes from './BidList.module.css';

type BidListTab = 'pending' | 'history';

const compareValues = (firstValue: string | number, secondValue: string | number): number => {
  if (firstValue === secondValue) {
    return 0;
  }

  return firstValue > secondValue ? 1 : -1;
};

const BidList: React.FC = () => {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<BidListTab>('pending');
  const [revertingIds, setRevertingIds] = useState<string[]>([]);
  const { purchases } = useSelector((root: RootState) => root.purchases);
  const { slots } = useSelector((root: RootState) => root.slots);
  const actionLog = useSelector((root: RootState) => root.actionsLog.entries);
  const {
    settings: { purchaseSort },
  } = useSelector((root: RootState) => root.aucSettings);

  const handleClearPurchases = (): void => {
    dispatch(
      addActionLogEntry(
        createActionLogEntry({
          type: 'auction.cleared',
          previousLots: slots,
          previousPurchases: purchases,
        }),
      ),
    );
    dispatch(resetPurchases());
  };

  const handleRevertAction = (entryId: string): void => {
    if (revertingIds.includes(entryId)) {
      return;
    }

    setRevertingIds((currentIds) => [...currentIds, entryId]);

    window.setTimeout(() => {
      dispatch(revertActionLogEntry(entryId));
      setRevertingIds((currentIds) => currentIds.filter((id) => id !== entryId));
    }, ACTION_LOG_REVERT_ANIMATION_MS);
  };

  const sortedPurchases = useMemo(() => {
    if (!purchaseSort || purchaseSort === 0) {
      return purchases;
    }

    const { key, order } = PURCHASE_SORT_OPTIONS[purchaseSort || 0];
    const orderModifier = order === 'ascend' ? 1 : -1;

    return [...purchases].sort(
      (firstPurchase: Purchase, secondPurchase: Purchase) =>
        compareValues(firstPurchase[key], secondPurchase[key]) * orderModifier,
    );
  }, [purchaseSort, purchases]);
  const historyEntries = useMemo(() => [...actionLog].reverse(), [actionLog]);

  return (
    <div className={`${classes.container} min-h-0`}>
      <DragBidContext />
      <SegmentedControl
        value={activeTab}
        onChange={(value) => setActiveTab(value as BidListTab)}
        data={[
          {
            value: 'pending',
            label: (
              <div className='flex items-center justify-center gap-2'>
                {t('actionsLog.tabs.pending')}
                {purchases.length > 0 && (
                  <div className='bg-primary-800/60 flex h-full items-center justify-center rounded-full px-1.75 text-[12px] font-bold'>
                    {purchases.length}
                  </div>
                )}
              </div>
            ),
          },
          { value: 'history', label: t('actionsLog.tabs.history') },
        ]}
        size='xs'
        className='mb-3'
      />
      {activeTab === 'pending' ? (
        <>
          <div className={classes.list}>
            {sortedPurchases.map((purchase) => (
              <DraggableBid {...purchase} key={purchase.id} isHotkeyTarget={sortedPurchases[0]?.id === purchase.id} />
            ))}
          </div>
          {!!purchases.length && (
            <div className='mt-3 flex w-full justify-end align-middle'>
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
        </>
      ) : (
        <ActionLogsList entries={historyEntries} revertingIds={revertingIds} onRevert={handleRevertAction} />
      )}
    </div>
  );
};

export default BidList;
