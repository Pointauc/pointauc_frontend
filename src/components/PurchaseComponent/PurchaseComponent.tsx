import React, { useCallback, useMemo } from 'react';
import { Button, Card, CardContent, IconButton, Typography } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import CloseIcon from '@material-ui/icons/Close';
import classNames from 'classnames';
import {
  logPurchase,
  Purchase,
  PurchaseStatusEnum,
  removePurchase,
  setDraggedRedemption,
  updateExistBids,
} from '../../reducers/Purchases/Purchases';
import './PurchaseComponent.scss';
import { RootState } from '../../reducers';
import { MESSAGE_TYPES } from '../../constants/webSocket.constants';
import donationBackground from '../../assets/img/donationBackground.jpg';
import { createSlotFromPurchase } from '../../reducers/Slots/Slots';
import { useCostConvert } from '../../hooks/useCostConvert';
import Marble from '../../assets/img/Marble.png';

interface PurchaseComponentProps extends Purchase {
  isDragging?: boolean;
}

const PurchaseComponent: React.FC<PurchaseComponentProps> = ({ isDragging, ...purchase }) => {
  const dispatch = useDispatch();
  const {
    integration: {
      twitch: { isRefundAvailable },
      da: { pointsRate },
    },
    settings: { marblesAuc },
  } = useSelector((root: RootState) => root.aucSettings);
  const { webSocket } = useSelector((root: RootState) => root.pubSubSocket);
  const { id, message, username, cost, color, rewardId, isDonation } = purchase;
  const isRemovePurchase = useMemo(() => cost < 0, [cost]);

  const refundRedemption = useCallback(
    () =>
      webSocket?.send(
        JSON.stringify({
          type: MESSAGE_TYPES.REFUND_REWARD,
          redemptionId: id,
          rewardId,
        }),
      ),
    [id, rewardId, webSocket],
  );

  const handleRemove = (): void => {
    dispatch(logPurchase({ ...purchase, status: PurchaseStatusEnum.Deleted }));
    dispatch(removePurchase(id));

    if (isRefundAvailable && !isDonation) {
      refundRedemption();
    }
  };

  const convertCost = useCostConvert();

  const redemptionStyles = { backgroundColor: color };
  const donationStyles = {
    backgroundImage: `url(${donationBackground})`,
    backgroundColor: 'transparent',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  };
  const cardStyles = isDonation ? donationStyles : redemptionStyles;
  const purchaseClasses = classNames(['purchase', { 'drag-placeholder': isDragging, 'remove-cost': isRemovePurchase }]);
  const donationCost = useMemo(() => (pointsRate === 1 ? `${cost}₽` : `${cost * pointsRate} (${cost} ₽)`), [
    cost,
    pointsRate,
  ]);
  const costString = useMemo(() => (isDonation && !marblesAuc ? donationCost : convertCost(cost)), [
    convertCost,
    cost,
    donationCost,
    isDonation,
    marblesAuc,
  ]);
  const bidTitle = useMemo(
    () =>
      marblesAuc ? (
        <>
          <span>{costString}</span>
          <img src={Marble} alt="шар" width={15} height={15} style={{ marginLeft: 5, marginRight: 5 }} />
          <span>{username}</span>
        </>
      ) : (
        `${costString} ${username}`
      ),
    [costString, marblesAuc, username],
  );

  const handleAddNewSlot = useCallback(() => {
    dispatch(createSlotFromPurchase({ ...purchase, cost: convertCost(purchase.cost, true) }));
    dispatch(logPurchase({ ...purchase, status: PurchaseStatusEnum.Processed, target: id.toString() }));
    dispatch(removePurchase(id));
    dispatch(setDraggedRedemption(null));
    dispatch(updateExistBids);
  }, [convertCost, dispatch, id, purchase]);

  return (
    <Card className={purchaseClasses} style={isDragging ? undefined : cardStyles}>
      <CardContent className="purchase-content">
        <div className="purchase-header">
          <Typography variant="h6">{bidTitle}</Typography>
          <IconButton onClick={handleRemove} className="purchase-header-remove-button" title="Удалить слот">
            <CloseIcon />
          </IconButton>
        </div>
        <Typography>{message}</Typography>
        <Button variant="outlined" size="small" className="purchase-new-button" onClick={handleAddNewSlot}>
          Новый
        </Button>
      </CardContent>
    </Card>
  );
};

export default PurchaseComponent;
