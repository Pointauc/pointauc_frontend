import React, { useCallback, useMemo, useState, useRef } from 'react';
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Typography,
  ButtonGroup,
  Popper,
  Grow,
  Paper,
  ClickAwayListener,
  MenuList,
  MenuItem,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import CloseIcon from '@mui/icons-material/Close';
import classNames from 'classnames';
import { findBestMatch } from 'string-similarity';
import { Trans, useTranslation } from 'react-i18next';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import {
  logPurchase,
  Purchase,
  removePurchase,
  setDraggedRedemption,
  updateBid,
  updateExistBids,
} from '@reducers/Purchases/Purchases.ts';
import { RootState } from '@reducers';
import donationBackground from '@assets/img/donationBackground.jpg';
import { addBid, createSlotFromPurchase } from '@reducers/Slots/Slots.ts';
import { useCostConvert } from '@hooks/useCostConvert.ts';
import Marble from '@assets/img/Marble.png';
import { PurchaseStatusEnum } from '@models/purchase.ts';
import { updateRedemption } from '@api/twitchApi.ts';
import { RedemptionStatus } from '@models/redemption.model.ts';
import { addAlert } from '@reducers/notifications/notifications.ts';
import { AlertTypeEnum } from '@models/alert.model.ts';
import bidUtils from '@utils/bid.utils.ts';
import PointsIcon from '@assets/icons/channelPoints.svg?react';
import { numberUtils } from '@utils/common/number.ts';

import RouletteMenu from '../RouletteMenu/RouletteMenu';
import { store } from '../../../main.tsx';

import type { ThunkDispatch } from 'redux-thunk';

import './PurchaseComponent.scss';

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
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const { settings } = useSelector((root: RootState) => root.aucSettings);
  const { marblesAuc, luckyWheelEnabled, isRefundAvailable, pointsRate, hideAmounts, reversePointsRate } = settings;
  const { id, message, username, cost, color, rewardId, isDonation } = purchase;
  const isRemovePurchase = useMemo(() => cost < 0, [cost]);
  const [casinoModalOpened, setCasinoModalOpened] = useState(false);
  const { t } = useTranslation();

  const [splitButtonMenuOpen, setSplitButtonMenuOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const menuOptions = [t('auc.addToRandomSlot')];

  const bestMatch = useMemo(() => {
    if (!showBestMatch) {
      return null;
    }

    const { slots } = store.getState().slots;
    const slotNames = slots.map(({ name }) => name || '');
    const {
      bestMatch: { rating },
      bestMatchIndex,
    } = findBestMatch(message || '', slotNames);

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

  const actualCost = useMemo(() => bidUtils.parseCost(purchase, settings, false), [purchase, settings]);

  const bidTitle = useMemo(() => {
    const actualUsername = username ?? t('bid.anonymous');

    if (hideAmounts) return bidUtils.getDisplayCost(actualCost);

    if (marblesAuc) {
      return (
        <>
          <span>{actualCost}</span>
          <img src={Marble} alt='marble' width={15} height={15} style={{ marginLeft: 5, marginRight: 5 }} />
          <span>{actualUsername}</span>
        </>
      );
    }

    if (isDonation && pointsRate > 1 && !reversePointsRate) {
      return t('bid.convertedTitle.donation', { actualCost, cost, user: actualUsername });
    }

    if (!isDonation && pointsRate > 1 && reversePointsRate) {
      return (
        <Trans
          i18nKey='bid.convertedTitle.points'
          values={{ actualCost, cost, user: actualUsername }}
          components={{
            icon: <PointsIcon style={{ width: 14, height: 14, marginRight: 2, position: 'relative', top: -2 }} />,
          }}
        />
      );
    }

    return `${actualCost} ${actualUsername}`;
  }, [actualCost, cost, hideAmounts, isDonation, marblesAuc, pointsRate, reversePointsRate, t, username]);

  const addToRandomSlot = () => {
    const { slots } = store.getState().slots;
    const rnd = Math.floor(Math.random() * (slots.length - 1));
    dispatch(addBid(slots[rnd].id, purchase));
    const alertMessage = t('auc.addedToRandomSlot', {
      cost: bidUtils.getDisplayCost(actualCost),
      username,
      slotName: slots[rnd].name,
      message,
    });
    dispatch(addAlert({ type: AlertTypeEnum.Success, message: alertMessage }));
    dispatch(updateExistBids);
  };

  const handleAddNewSlot = useCallback(() => {
    dispatch(createSlotFromPurchase(purchase));
    dispatch(removePurchase(id));
    dispatch(setDraggedRedemption(null));
    dispatch(updateExistBids);
  }, [dispatch, id, purchase]);

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

  const handleMenuItemClick = () => {
    setSplitButtonMenuOpen(false);

    /* Currently, only one item in the dropdown menu, no need to check
     the index. If more options added, implement index checking */
    addToRandomSlot();
  };

  const handleToggle = () => {
    setSplitButtonMenuOpen((prevOpen) => !prevOpen);
  };

  return (
    <Card className={purchaseClasses} style={isDragging ? undefined : cardStyles}>
      <CardContent className='purchase-content'>
        <div className='purchase-header'>
          <Typography variant='h6'>{bidTitle}</Typography>
          <IconButton
            onClick={handleRemove}
            className='purchase-header-remove-button'
            title={t('bid.delete')}
            size='large'
          >
            <CloseIcon />
          </IconButton>
        </div>
        <Typography>{message}</Typography>
        {!hideActions && (
          <>
            <ButtonGroup size='small' className='purchase-new-split-button' ref={anchorRef}>
              <Button
                color='blank'
                variant='outlined'
                size='small'
                className='purchase-new-split-button-left'
                onClick={handleAddNewSlot}
              >
                {t('bid.new')}
              </Button>
              <Button
                color='blank'
                variant='outlined'
                size='small'
                className='purchase-new-split-button-right'
                onClick={handleToggle}
              >
                <ArrowDropDownIcon />
              </Button>
            </ButtonGroup>
            <Popper
              open={splitButtonMenuOpen}
              anchorEl={anchorRef.current}
              role={undefined}
              transition
              disablePortal
              className='purchase-new-split-button-popper'
            >
              {({ TransitionProps }) => (
                <Grow {...TransitionProps}>
                  <Paper>
                    <ClickAwayListener onClickAway={() => setSplitButtonMenuOpen(false)}>
                      <MenuList>
                        {menuOptions.map((option) => (
                          <MenuItem key={option} onClick={handleMenuItemClick}>
                            {option}
                          </MenuItem>
                        ))}
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Grow>
              )}
            </Popper>

            {luckyWheelEnabled && (
              <Button
                color='blank'
                variant='outlined'
                size='small'
                className='purchase-new-button'
                onClick={openCasino}
              >
                {t('bid.luckyWheel')}
              </Button>
            )}
            {bestMatch && (
              <Button
                color='blank'
                variant='outlined'
                size='small'
                className='purchase-new-button'
                onClick={handleAddToBestMatch}
              >
                {t('bid.toLot', { name: bestMatch.name })}
              </Button>
            )}
          </>
        )}
      </CardContent>
      {casinoModalOpened && (
        <Dialog open={casinoModalOpened} onClose={(): void => setCasinoModalOpened(false)} maxWidth='lg'>
          <DialogContent>
            <RouletteMenu onRoll={multiplySlot} bid={purchase} />
          </DialogContent>
          <DialogActions>
            <Button color='primary' variant='outlined' onClick={(): void => setCasinoModalOpened(false)}>
              {t('bid.close')}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Card>
  );
};

export default PurchaseComponent;
