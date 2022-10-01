import React, { ReactText, useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Typography } from '@material-ui/core';
import { RootState } from '../../../reducers';
import './PurchaseList.scss';
import { processRedemption, Purchase } from '../../../reducers/Purchases/Purchases';
import { PURCHASE_SORT_OPTIONS } from '../../../constants/purchase.constants';
import DraggableRedemption from '../DraggableRedemption/DraggableRedemption';
import DragBidContext from '../DragBidContext/DragBidContext';

const PurchaseList: React.FC = () => {
  const dispatch = useDispatch();
  const { purchases } = useSelector((root: RootState) => root.purchases);
  const { twitchSocket, daSocket } = useSelector((root: RootState) => root.socketIo);
  const {
    settings: { purchaseSort },
  } = useSelector((root: RootState) => root.aucSettings);

  const handleRedemption = useCallback(
    (redemption: Purchase): void => {
      dispatch(processRedemption(redemption));
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
    twitchSocket?.on('Bid', handleRedemption);
    daSocket?.on('Bid', handleRedemption);
  }, [daSocket, handleRedemption, twitchSocket]);

  return (
    <div className="purchase-container">
      <DragBidContext />
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
