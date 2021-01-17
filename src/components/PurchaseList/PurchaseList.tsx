import React, { ReactText, useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Typography } from '@material-ui/core';
import { RootState } from '../../reducers';
import './PurchaseList.scss';
import { MESSAGE_TYPES } from '../../constants/webSocket.constants';
import { processRedemption, Purchase } from '../../reducers/Purchases/Purchases';
import { PURCHASE_SORT_OPTIONS } from '../../constants/purchase.constants';
import DraggableRedemption from '../DraggableRedemption/DraggableRedemption';

const PurchaseList: React.FC = () => {
  const dispatch = useDispatch();
  const { purchases } = useSelector((root: RootState) => root.purchases);
  const { webSocket } = useSelector((root: RootState) => root.pubSubSocket);
  const {
    settings: { purchaseSort },
  } = useSelector((root: RootState) => root.aucSettings);

  const handleNewPurchase = useCallback(
    ({ data }: MessageEvent): void => {
      const { type, purchase } = JSON.parse(data);

      if (type === MESSAGE_TYPES.PURCHASE) {
        dispatch(processRedemption(purchase));
      }
    },
    [dispatch],
  );

  const compareValues = (a: ReactText, b: ReactText): number => {
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
    if (webSocket) {
      webSocket.addEventListener('message', handleNewPurchase);
    }
  }, [handleNewPurchase, webSocket]);

  return (
    <div className="purchase-container">
      <div className="purchase-list">
        {sortedPurchases.map((purchase) => (
          <DraggableRedemption {...purchase} key={purchase.id} />
        ))}
      </div>
      {!!purchases.length && (
        <Typography className="total-purchases">
          Всего заказов:
          <span>{purchases.length}</span>
        </Typography>
      )}
    </div>
  );
};

export default PurchaseList;
