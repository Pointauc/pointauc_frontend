import React, { useCallback, useMemo, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Typography,
} from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import CloseIcon from '@material-ui/icons/Close';
import classNames from 'classnames';
import { findBestMatch } from 'string-similarity';
import {
  logPurchase,
  Purchase,
  removePurchase,
  setDraggedRedemption,
  updateBid,
  updateExistBids,
} from '../../../reducers/Purchases/Purchases';
import './PurchaseComponent.scss';
import { RootState } from '../../../reducers';
import donationBackground from '../../../assets/img/donationBackground.jpg';
import { addBid, createSlotFromPurchase } from '../../../reducers/Slots/Slots';
import { useCostConvert } from '../../../hooks/useCostConvert';
import Marble from '../../../assets/img/Marble.png';
import { store } from '../../../index';
import { PurchaseStatusEnum } from '../../../models/purchase';
import { updateRedemption } from '../../../api/twitchApi';
import { RedemptionStatus } from '../../../models/redemption.model';
import RouletteMenu from '../RouletteMenu/RouletteMenu';

interface PurchaseComponentProps extends Purchase {
  isDragging?: boolean;
  showBestMatch?: boolean;
  hideActions?: boolean;
  disabled?: boolean;
}

const PurchaseComponent: React.FC<PurchaseComponentProps> = ({
  isDragging,
  showBestMatch = true,
  hideActions,
  disabled,
  ...purchase
}) => {
  const dispatch = useDispatch();
  const {
    integration: {
      twitch: { isRefundAvailable },
      da: { pointsRate },
    },
    settings: { marblesAuc, luckyWheel },
  } = useSelector((root: RootState) => root.aucSettings);
  const { id, message, username, cost, color, rewardId, isDonation } = purchase;
  const isRemovePurchase = useMemo(() => cost < 0, [cost]);
  const [casinoModalOpened, setCasinoModalOpened] = useState(false);

  const bestMatch = useMemo(() => {
    if (!showBestMatch) {
      return null;
    }

    const { slots } = store.getState().slots;
    const slotNames = slots.map(({ name }) => name || '');
    const {
      bestMatch: { rating },
      bestMatchIndex,
    } = findBestMatch(message, slotNames);

    return rating > 0.4 ? { ...slots[bestMatchIndex], index: bestMatchIndex + 1 } : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refundRedemption = useCallback(
    () =>
      rewardId &&
      updateRedemption({
        status: RedemptionStatus.Canceled,
        redemptionId: id,
        rewardId,
      }),
    [id, rewardId],
  );

  const handleRemove = (): void => {
    dispatch(logPurchase({ ...purchase, status: PurchaseStatusEnum.Deleted }));
    dispatch(removePurchase(id));

    if (isRefundAvailable && !isDonation) {
      refundRedemption();
    }
  };

  const { getMarblesAmount, formatMarblesCost } = useCostConvert();

  const redemptionStyles = { backgroundColor: color };
  const donationStyles = {
    backgroundImage: `url(${donationBackground})`,
    backgroundColor: 'transparent',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  };
  const cardStyles = isDonation ? donationStyles : redemptionStyles;
  const purchaseClasses = classNames([
    'purchase',
    { 'drag-placeholder': isDragging, 'remove-cost': isRemovePurchase, disabled },
  ]);
  const donationCost = useMemo(
    () => (pointsRate === 1 ? `${cost}₽` : `${cost * pointsRate} (${cost} ₽)`),
    [cost, pointsRate],
  );
  const costString = useMemo(
    () => (isDonation && !marblesAuc ? donationCost : formatMarblesCost(cost)),
    [formatMarblesCost, cost, donationCost, isDonation, marblesAuc],
  );
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
    dispatch(createSlotFromPurchase({ ...purchase, cost: getMarblesAmount(purchase.cost, true) }));
    dispatch(removePurchase(id));
    dispatch(setDraggedRedemption(null));
    dispatch(updateExistBids);
  }, [getMarblesAmount, dispatch, id, purchase]);

  const handleAddToBestMatch = useCallback(() => {
    if (bestMatch) {
      dispatch(addBid(bestMatch.id, purchase));
      dispatch(updateExistBids);
    }
  }, [bestMatch, dispatch, purchase]);

  const openCasino = (): void => setCasinoModalOpened(true);

  const multiplySlot = (multi: number): void => {
    dispatch(updateBid({ ...purchase, cost: purchase.cost * multi }));
  };

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
        {!hideActions && (
          <>
            <Button variant="outlined" size="small" className="purchase-new-button" onClick={handleAddNewSlot}>
              Новый
            </Button>
            {luckyWheel && (
              <Button variant="outlined" size="small" className="purchase-new-button" onClick={openCasino}>
                Испытать удачу
              </Button>
            )}
            {bestMatch && (
              <Button variant="outlined" size="small" className="purchase-new-button" onClick={handleAddToBestMatch}>
                {`К ${bestMatch.name}`}
              </Button>
            )}
          </>
        )}
      </CardContent>
      {casinoModalOpened && (
        <Dialog open={casinoModalOpened} onClose={(): void => setCasinoModalOpened(false)} maxWidth="lg">
          <DialogContent>
            <RouletteMenu onRoll={multiplySlot} bid={purchase} />
          </DialogContent>
          <DialogActions>
            <Button color="primary" variant="outlined" onClick={(): void => setCasinoModalOpened(false)}>
              Закрыть
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Card>
  );
};

export default PurchaseComponent;
