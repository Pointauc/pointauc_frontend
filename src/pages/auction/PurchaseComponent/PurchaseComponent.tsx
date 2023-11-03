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
import ButtonGroup from '@material-ui/core/ButtonGroup';
import { useTranslation } from 'react-i18next';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
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

import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import { addAlert } from '../../../reducers/notifications/notifications';
import { AlertTypeEnum } from '../../../models/alert.model';

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
    settings: { marblesAuc, luckyWheelEnabled, isRefundAvailable, pointsRate },
  } = useSelector((root: RootState) => root.aucSettings);
  const { id, message, username, cost, color, rewardId, isDonation } = purchase;
  const isRemovePurchase = useMemo(() => cost < 0, [cost]);
  const [casinoModalOpened, setCasinoModalOpened] = useState(false);
  const { t } = useTranslation();

  const [splitButtonMenuOpen, setSplitButtonMenuOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
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
    } = findBestMatch(message, slotNames);

    return rating > 0.4 ? { ...slots[bestMatchIndex], index: bestMatchIndex + 1 } : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addToRandomSlot = () => {
    const { slots } = store.getState().slots;
    const rnd = Math.floor(Math.random() * (slots.length - 1));
    dispatch(addBid(slots[rnd].id, purchase));
    const alertMessage = t('auc.addedToRandomSlot', {
      cost,
      username,
      slotName: slots[rnd].name,
      message,
    });
    dispatch(addAlert({ type: AlertTypeEnum.Success, message: alertMessage }));
    dispatch(updateExistBids);
  };

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

  const handleMenuItemClick = (event: React.MouseEvent<HTMLLIElement, MouseEvent>, index: number) => {
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
            <ButtonGroup size="small" className="purchase-new-split-button" ref={anchorRef}>
              <Button
                variant="outlined"
                size="small"
                className="purchase-new-split-button-left"
                onClick={handleAddNewSlot}
              >
                Новый
              </Button>
              <Button
                variant="outlined"
                size="small"
                className="purchase-new-split-button-right"
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
              className="purchase-new-split-button-popper"
            >
              {({ TransitionProps }) => (
                <Grow {...TransitionProps}>
                  <Paper>
                    <ClickAwayListener onClickAway={() => setSplitButtonMenuOpen(false)}>
                      <MenuList>
                        {menuOptions.map((option, index) => (
                          <MenuItem key={option} onClick={(event) => handleMenuItemClick(event, index)}>
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
