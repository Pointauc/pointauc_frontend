import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../reducers';
import PurchaseComponent from '../PurchaseComponent/PurchaseComponent';
import './PurchaseList.scss';
import CustomDragLayer from '../CustomDragLayer/CustomDragLayer';
import { MESSAGE_TYPES } from '../../constants/webSocket.constants';
import { addPurchase } from '../../reducers/Purchases/Purchases';

const PurchaseList: React.FC = () => {
  const dispatch = useDispatch();
  const { purchases } = useSelector((root: RootState) => root.purchases);
  const { webSocket } = useSelector((root: RootState) => root.pubSubSocket);

  const handleNewPurchase = useCallback(
    ({ data }: MessageEvent): void => {
      const { type, purchase } = JSON.parse(data);

      if (type === MESSAGE_TYPES.PURCHASE) {
        dispatch(addPurchase(purchase));
      }
    },
    [dispatch],
  );

  useEffect(() => {
    if (webSocket) {
      webSocket.addEventListener('message', handleNewPurchase);
    }
  }, [handleNewPurchase, webSocket]);

  return (
    <div className="purchase-list">
      <CustomDragLayer />
      {purchases.map((purchase) => (
        <PurchaseComponent {...purchase} key={purchase.id} />
      ))}
    </div>
  );
};

export default PurchaseList;
