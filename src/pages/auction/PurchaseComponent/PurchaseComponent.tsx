import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CloseIcon from '@mui/icons-material/Close';
import { ActionIcon, Button, Card, CloseButton, Menu, Modal, Stack, Text, Title } from '@mantine/core';
import clsx from 'clsx';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { findBestMatch } from 'string-similarity';

import { updateRedemption } from '@api/twitchApi.ts';
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
  Purchase,
  removePurchase,
  setDraggedRedemption,
  updateBid,
  updateExistBids,
} from '@reducers/Purchases/Purchases.ts';
import { addBid, createSlotFromPurchase } from '@reducers/Slots/Slots.ts';
import bidUtils from '@utils/bid.utils.ts';

import { store } from '../../../main.tsx';
import RouletteMenu from '../RouletteMenu/RouletteMenu';

import classes from './PurchaseComponent.module.css';

import type { ThunkDispatch } from 'redux-thunk';

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

    const { slots } = store.getState().slots;
    const slotNames = slots.map(({ name }) => name || '');
    const {
      bestMatch: { rating },
      bestMatchIndex,
    } = findBestMatch(name, slotNames);

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
                className={classes.actionButton}
                onClick={handleAddNewSlot}
              >
                {t('bid.new')}
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

            {luckyWheelEnabled && (
              <Button
                variant='outline'
                color='gray'
                size='xs'
                fz='sm'
                className={classes.actionButton}
                onClick={openCasino}
              >
                {t('bid.luckyWheel')}
              </Button>
            )}
            {bestMatch && (
              <Button
                variant='outline'
                color='white'
                size='xs'
                fz='sm'
                className={classes.actionButton}
                onClick={handleAddToBestMatch}
              >
                {t('bid.toLot', { name: bestMatch.name })}
              </Button>
            )}
          </>
        )}
      </Stack>
      {casinoModalOpened && (
        <Modal opened={casinoModalOpened} onClose={() => setCasinoModalOpened(false)} size='lg'>
          <Stack>
            <RouletteMenu onRoll={multiplySlot} bid={purchase} />
            <Button variant='outline' onClick={() => setCasinoModalOpened(false)}>
              {t('bid.close')}
            </Button>
          </Stack>
        </Modal>
      )}
    </Card>
  );
};

export default PurchaseComponent;
