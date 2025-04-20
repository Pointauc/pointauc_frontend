import { ReactText, useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Typography } from '@mui/material';
import { ThunkDispatch } from 'redux-thunk';
import { useTranslation } from 'react-i18next';

import { RootState } from '@reducers';
import { processRedemption, Purchase } from '@reducers/Purchases/Purchases.ts';
import { PURCHASE_SORT_OPTIONS } from '@constants/purchase.constants.ts';
import donatePay from '@components/Integration/DonatePay';
import da from '@components/Integration/DA';

import DraggableRedemption from '../DraggableRedemption/DraggableRedemption';
import DragBidContext from '../DragBidContext/DragBidContext';

import './PurchaseList.scss';

const PurchaseList: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const { purchases } = useSelector((root: RootState) => root.purchases);
  const { globalSocket, twitchSocket, tourniquetSocket } = useSelector((root: RootState) => root.socketIo);
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
    globalSocket?.on('Bid', (bid) => handleRedemption({ ...bid, source: 'API' }));
    twitchSocket?.on('Bid', (bid) => handleRedemption({ ...bid, source: 'twitch' }));

    const handleTourniquetBid = (bid: Purchase) => handleRedemption({ ...bid, source: 'tourniquet' });
    tourniquetSocket?.on('Bid', handleTourniquetBid);

    const donatePayUnsub = donatePay.pubsubFlow.events.on('bid', (bid: Bid.Item) =>
      handleRedemption({ ...bid, source: 'donatePay' }),
    );

    const daUnsub = da.pubsubFlow.events?.on('bid', handleRedemption);

    return () => {
      donatePayUnsub();
      daUnsub();
      tourniquetSocket?.off('Bid', handleTourniquetBid);
    };
  }, [handleRedemption, twitchSocket, globalSocket, tourniquetSocket]);

  return (
    <div className='purchase-container'>
      <DragBidContext />
      <div className='purchase-list'>
        {sortedPurchases.map((purchase) => (
          <DraggableRedemption {...purchase} key={purchase.id} />
        ))}
      </div>
      {!!purchases.length && (
        <Typography className='total-purchases'>
          <span>{t('bid.totalBids')}</span>
          <span>{purchases.length}</span>
        </Typography>
      )}
    </div>
  );
};

export default PurchaseList;
