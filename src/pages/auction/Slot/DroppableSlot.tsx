import React, { DragEvent, useCallback, useRef, useState } from 'react';
import './Slot.scss';
import { IconButton, Menu, MenuItem, Typography } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import SlotComponent from './SlotComponent';
import { deleteSlot, setSlotAmount, setSlotName } from '../../../reducers/Slots/Slots';
import { Slot } from '../../../models/slot.model';
import { RootState } from '../../../reducers';
import {
  logPurchase,
  Purchase,
  removePurchase,
  setDraggedRedemption,
  updateExistBids,
} from '../../../reducers/Purchases/Purchases';
import slotNamesMap from '../../../services/SlotNamesMap';
import { useCostConvert } from '../../../hooks/useCostConvert';
import { openTrailer } from '../../../reducers/ExtraWindows/ExtraWindows';
import { handleDragOver } from '../../../utils/common.utils';
import { PurchaseStatusEnum } from '../../../models/purchase';

interface DroppableSlotProps extends Slot {
  index: number;
}

const DroppableSlot: React.FC<DroppableSlotProps> = ({ index, ...slotProps }) => {
  const dispatch = useDispatch();
  const { background } = useSelector((root: RootState) => root.aucSettings.settings);
  const {
    da: { pointsRate },
  } = useSelector((root: RootState) => root.aucSettings.integration);
  const [isExtraOpen, setIsExtraOpen] = useState<boolean>(false);
  const extraIcon = useRef<HTMLButtonElement>(null);
  const { id, amount, name } = slotProps;
  const slotElement = useRef<HTMLDivElement>(null);
  const enterCounter = useRef<number>(0);

  const { getMarblesAmount } = useCostConvert();

  const resetOverStyle = useCallback(() => {
    enterCounter.current = 0;

    requestAnimationFrame(() => {
      if (slotElement.current) {
        slotElement.current.classList.remove('drag-over');
        slotElement.current.classList.remove('remove-cost');
      }
    });
  }, []);

  const updateOverStyle = useCallback(
    (enterCounterChange: number, isRemove?: boolean) => {
      enterCounter.current += enterCounterChange;

      if (enterCounter.current > 0) {
        requestAnimationFrame(() => {
          if (slotElement.current) {
            slotElement.current.classList.add('drag-over');

            if (isRemove) {
              slotElement.current.classList.add('remove-cost');
            }
          }
        });
      } else {
        resetOverStyle();
      }
    },
    [resetOverStyle],
  );

  const handleDelete = (): void => {
    dispatch(deleteSlot(id));
  };

  const slotWrapperClasses = classNames('slot-wrapper', { 'custom-background': background });

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      const redemption: Purchase = JSON.parse(e.dataTransfer.getData('redemption'));
      const { cost, message, isDonation, id: redemptionId } = redemption;
      const addedCost = isDonation ? cost * pointsRate : cost;

      slotNamesMap.set(message, id);
      dispatch(setSlotAmount({ id, amount: Number(amount) + getMarblesAmount(addedCost, !amount) }));
      dispatch(logPurchase({ ...redemption, status: PurchaseStatusEnum.Processed, target: id.toString() }));
      dispatch(removePurchase(redemptionId));
      dispatch(setDraggedRedemption(null));
      dispatch(updateExistBids);

      if (!name) {
        dispatch(setSlotName({ id, name: message }));
      }
      resetOverStyle();
    },
    [amount, getMarblesAmount, dispatch, id, name, pointsRate, resetOverStyle],
  );

  const handleDragEnter = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      updateOverStyle(1, e.dataTransfer.types.includes('remove'));
    },
    [updateOverStyle],
  );

  const handleDragLeave = useCallback(() => {
    updateOverStyle(-1);
  }, [updateOverStyle]);

  const openExtra = useCallback(() => setIsExtraOpen(true), []);
  const closeExtra = useCallback(() => setIsExtraOpen(false), []);

  const handleOpenTrailer = useCallback(() => {
    closeExtra();
    dispatch(openTrailer(name || ''));
  }, [closeExtra, dispatch, name]);

  return (
    <div
      className={slotWrapperClasses}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      <div className="slot" ref={slotElement}>
        <Typography className="slot-index">{`${index}.`}</Typography>
        <Typography className="slot-fast-index">{`#${slotProps.fastId}`}</Typography>
        <SlotComponent {...slotProps} />
      </div>
      <IconButton onClick={handleDelete} className="delete-button" title="Удалить слот">
        <DeleteIcon />
      </IconButton>
      <IconButton
        onClick={openExtra}
        className="delete-button"
        title="Дополнительно"
        aria-controls="extra"
        ref={extraIcon}
      >
        <MoreHorizIcon />
      </IconButton>
      <Menu
        id="extra"
        open={isExtraOpen}
        onClose={closeExtra}
        anchorEl={extraIcon.current}
        PaperProps={{ style: { width: '20ch' } }}
        TransitionProps={{ timeout: 100 }}
      >
        <MenuItem onClick={handleOpenTrailer}>Трейлер</MenuItem>
      </Menu>
    </div>
  );
};

export default DroppableSlot;
