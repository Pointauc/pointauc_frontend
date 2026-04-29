import { Button, Card, CloseButton, Menu, Modal, Stack, Text } from '@mantine/core';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import clsx from 'clsx';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { findBestMatch } from 'string-similarity';

import { updateRedemption } from '@api/twitchApi.ts';
import { vkVideoLiveRewardsApi } from '@api/vkVideoLiveApi';
import PointsIcon from '@assets/icons/channelPoints.svg?react';
import donationBackground from '@assets/img/donationBackground.jpg';
import Marble from '@assets/img/Marble.png';
import { useCostConvert } from '@hooks/useCostConvert.ts';
import { AlertTypeEnum } from '@models/alert.model.ts';
import { PurchaseStatusEnum } from '@models/purchase.ts';
import { RedemptionStatus } from '@models/redemption.model.ts';
import { RootState } from '@reducers';
import { addAlert } from '@reducers/notifications/notifications.ts';
import {
  logPurchase,
  removePurchase,
  setDraggedRedemption,
  updateBid,
  updateExistBids,
} from '@reducers/Purchases/Purchases.ts';
import { addBid, createSlotFromPurchase } from '@reducers/Slots/Slots.ts';
import { HOTKEY_ACTION_IDS } from '@shared/lib/hotkeys/hotkeys.types';
import { useAppHotkey } from '@shared/lib/hotkeys/useAppHotkey';
import HotkeyHint from '@shared/ui/HotkeyHint/HotkeyHint';
import bidUtils from '@utils/bid.utils.ts';
import { store } from '@store';

import RouletteMenu from '../RouletteMenu/RouletteMenu';

import classes from './BidComponent.module.css';

import type { ThunkDispatch } from 'redux-thunk';

interface BidComponentProps extends Bid.Item {
  isDragging?: boolean;
  showBestMatch?: boolean;
  hideActions?: boolean;
  disabled?: boolean;
  isHotkeyTarget?: boolean;
}

const BidComponent: React.FC<BidComponentProps> = ({
  isDragging,
  showBestMatch = true,
  hideActions,
  disabled,
  isHotkeyTarget,
  ...purchase
}) => {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const { settings } = useSelector((root: RootState) => root.aucSettings);
  const { marblesAuc, luckyWheelEnabled, isRefundAvailable, pointsRate, hideAmounts, reversePointsRate } = settings;
  const { id, username, cost, color, rewardId, isDonation } = purchase;
  const isRemovePurchase = useMemo(() => cost < 0, [cost]);
  const [casinoModalOpened, setCasinoModalOpened] = useState(false);
  const { t } = useTranslation();
  const name = bidUtils.getName(purchase);

  const anchorRef = useRef<HTMLButtonElement>(null);

  const bestMatch = useMemo(() => {
    if (!showBestMatch) {
      return null;
    }

    const { slots } = (store.getState() as RootState).slots;
    const slotNames = slots.map(({ name }) => name || '');
    const {
      bestMatch: { rating },
      bestMatchIndex,
    } = findBestMatch(name, slotNames);

    return rating > 0.4 ? { ...slots[bestMatchIndex], index: bestMatchIndex + 1 } : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refundRedemption = useCallback(
    () => {
      if (!rewardId) {
        return undefined;
      }

      const requestData = {
        status: RedemptionStatus.Canceled,
        redemptionId: id,
        rewardId,
      };

      if (purchase.source === 'vkVideoLive') {
        const channelUrl = (store.getState() as RootState).user.authData.vkVideoLive?.channelUrl;
        return channelUrl ? vkVideoLiveRewardsApi.updateRedemption(requestData, channelUrl) : undefined;
      }

      return updateRedemption(requestData);
    },
    [id, purchase.source, rewardId],
  );

  const handleRemove = (): void => {
    dispatch(logPurchase({ ...purchase, status: PurchaseStatusEnum.Deleted }));
    dispatch(removePurchase(id));

    if (isRefundAvailable && !isDonation) {
      refundRedemption();
    }
  };

  const { getMarblesAmount, formatMarblesCost } = useCostConvert();

  const donationStyles = {
    backgroundImage: `url(${donationBackground})`,
    backgroundColor: 'transparent',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  };
  const backgroundStyles = isDonation ? donationStyles : { backgroundColor: color };
  const purchaseClasses = clsx(classes.purchase, {
    [classes.dragPlaceholder]: isDragging,
    [classes.removeCost]: isRemovePurchase,
    [classes.disabled]: disabled,
  });

  const actualCost = useMemo(() => bidUtils.parseCost(purchase, settings, false), [purchase, settings]);
  const actualUsername = username ?? t('bid.anonymous');

  const bidTitle = useMemo(() => {
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
  }, [actualCost, actualUsername, cost, hideAmounts, isDonation, marblesAuc, pointsRate, reversePointsRate, t]);

  const addToRandomSlot = () => {
    const { slots } = store.getState().slots;
    const rnd = Math.floor(Math.random() * (slots.length - 1));
    dispatch(addBid(slots[rnd].id, purchase));
    const alertMessage = t('auc.addedToRandomSlot', {
      cost: bidUtils.getDisplayCost(actualCost),
      username,
      slotName: slots[rnd].name,
      name,
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

  useAppHotkey(
    HOTKEY_ACTION_IDS.firstBidNew,
    (event, { setNotificationData }) => {
      event.preventDefault();
      handleAddNewSlot();
      setNotificationData({ name });
    },
    {
      enabled: Boolean(isHotkeyTarget && !hideActions && !disabled),
      preventDefault: true,
    },
  );
  useAppHotkey(
    HOTKEY_ACTION_IDS.firstBidAddToLot,
    (event, { setNotificationData }) => {
      event.preventDefault();
      handleAddToBestMatch();

      if (!bestMatch) {
        return;
      }

      setNotificationData({
        bidName: name,
        lotName: bestMatch.name ?? '',
      });
    },
    {
      enabled: Boolean(isHotkeyTarget && bestMatch && !hideActions && !disabled),
      preventDefault: true,
    },
  );

  return (
    <Card className={purchaseClasses} style={isDragging ? undefined : backgroundStyles} padding='sm'>
      <div className={classes.header}>
        <Text size='xl' className={classes.headerTitle} title={actualUsername}>
          {bidTitle}
        </Text>
        <CloseButton onClick={handleRemove} c='white' radius='xl' title={t('bid.delete')} size='lg' />
      </div>

      <Stack gap='xs'>
        <Text>{name}</Text>
        {!hideActions && (
          <>
            <Button.Group>
              <Button
                variant='outline'
                color='white'
                size='xs'
                fz='sm'
                flex={1}
                className={clsx(classes.actionButton, 'relative')}
                onClick={handleAddNewSlot}
              >
                <span className='inline-flex w-full items-center justify-center'>
                  {isHotkeyTarget && (
                    <HotkeyHint
                      actionId={HOTKEY_ACTION_IDS.firstBidNew}
                      variant='overlay'
                      className='pointer-events-none absolute top-1/2 left-2 -translate-y-1/2'
                    />
                  )}
                  <span>{t('bid.new')}</span>
                </span>
              </Button>
              <Menu position='bottom-end'>
                <Menu.Target>
                  <Button
                    ref={anchorRef}
                    variant='outline'
                    color='white'
                    size='xs'
                    fz='sm'
                    className={clsx(classes.actionButton, classes.splitButtonRight)}
                  >
                    <ArrowDropDownIcon />
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item onClick={addToRandomSlot}>{t('auc.addToRandomSlot')}</Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Button.Group>
            {bestMatch && (
              <Button
                variant='outline'
                color='white'
                size='xs'
                fz='sm'
                className={clsx(classes.actionButton, 'relative')}
                onClick={handleAddToBestMatch}
              >
                <span className='inline-flex w-full items-center justify-center'>
                  {isHotkeyTarget && (
                    <HotkeyHint
                      actionId={HOTKEY_ACTION_IDS.firstBidAddToLot}
                      variant='overlay'
                      className='pointer-events-none absolute top-1/2 left-2 -translate-y-1/2'
                    />
                  )}
                  <span>{t('bid.toLot', { name: bestMatch.name })}</span>
                </span>
              </Button>
            )}

            {luckyWheelEnabled && (
              <>
                {casinoModalOpened && (
                  <Modal
                    opened={casinoModalOpened}
                    onClose={() => setCasinoModalOpened(false)}
                    size='68%'
                    classNames={{ content: 'overflow-hidden' }}
                  >
                    <RouletteMenu onRoll={multiplySlot} bid={purchase} />
                  </Modal>
                )}
                <Button
                  variant='outline'
                  color='white'
                  size='xs'
                  fz='sm'
                  className={classes.actionButton}
                  onClick={openCasino}
                >
                  {t('bid.luckyWheel')}
                </Button>
              </>
            )}
          </>
        )}
      </Stack>
    </Card>
  );
};

export default BidComponent;
