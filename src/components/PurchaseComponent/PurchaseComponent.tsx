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
} from '../../reducers/Purchases/Purchases';
import './PurchaseComponent.scss';
import { RootState } from '../../reducers';
import { MESSAGE_TYPES } from '../../constants/webSocket.constants';
import donationBackground from '../../assets/img/donationBackground.jpg';
import { createSlotFromPurchase } from '../../reducers/Slots/Slots';

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
    dispatch(logPurchase({ purchase, status: PurchaseStatusEnum.Deleted }));
    dispatch(removePurchase(id));

    if (isRefundAvailable && !isDonation) {
      refundRedemption();
    }
  };

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

  const costString = useMemo(() => (isDonation ? `${cost * pointsRate} (${cost} ₽)` : cost), [
    cost,
    isDonation,
    pointsRate,
  ]);

  const handleAddNewSlot = useCallback(() => {
    dispatch(createSlotFromPurchase(purchase));
    dispatch(logPurchase({ purchase, status: PurchaseStatusEnum.Processed, target: id.toString() }));
    dispatch(removePurchase(id));
    dispatch(setDraggedRedemption(null));
  }, [dispatch, id, purchase]);

  return (
    <Card className={purchaseClasses} style={isDragging ? undefined : cardStyles}>
      <CardContent className="purchase-content">
        <div className="purchase-header">
          <Typography variant="h6">{`${costString} ${username}`}</Typography>
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
