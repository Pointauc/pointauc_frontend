import React, { DragEvent, useCallback, useMemo, useRef, useState } from 'react';
import './Slot.scss';
import { IconButton, Typography, MenuItem, Menu } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import SlotComponent from './SlotComponent';
import { deleteSlot, setSlotAmount, setSlotName } from '../../../reducers/Slots/Slots';
import { Slot } from '../../../models/slot.model';
import { RootState } from '../../../reducers';
import { handleDragOver } from '../../../utils/common.utils';
import {
  logPurchase,
  Purchase,
  PurchaseStatusEnum,
  removePurchase,
  setDraggedRedemption,
  updateExistBids,
} from '../../../reducers/Purchases/Purchases';
import slotNamesMap from '../../../services/SlotNamesMap';
import { useCostConvert } from '../../../hooks/useCostConvert';
import { openTrailer } from '../../../reducers/ExtraWindows/ExtraWindows';

interface DroppableSlotProps extends Slot {
  index: number;
}

const DroppableSlot: React.FC<DroppableSlotProps> = ({ index, ...slotProps }) => {
  const dispatch = useDispatch();
  const { background } = useSelector((root: RootState) => root.aucSettings.settings);
  const {
    da: { pointsRate },
  } = useSelector((root: RootState) => root.aucSettings.integration);
  const [enterCounter, setEnterCounter] = useState<number>(0);
  const [isRemoveCost, setIsRemoveCost] = useState<boolean>(false);
  const [isExtraOpen, setIsExtraOpen] = useState<boolean>(false);
  const extraIcon = useRef<HTMLButtonElement>(null);
  const { id, amount, name } = slotProps;
  const isOver = useMemo(() => !!enterCounter, [enterCounter]);

  const convertCost = useCostConvert();

  const slotClasses = useMemo(() => classNames('slot', { 'drag-over': isOver, 'remove-cost': isRemoveCost }), [
    isOver,
    isRemoveCost,
  ]);

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
      dispatch(setSlotAmount({ id, amount: Number(amount) + convertCost(addedCost, !amount) }));
      dispatch(logPurchase({ ...redemption, status: PurchaseStatusEnum.Processed, target: id.toString() }));
      dispatch(removePurchase(redemptionId));
      dispatch(setDraggedRedemption(null));
      dispatch(updateExistBids);

      if (!name) {
        dispatch(setSlotName({ id, name: message }));
      }
      setEnterCounter(0);
    },
    [amount, convertCost, dispatch, id, name, pointsRate],
  );

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    setEnterCounter((prevState) => prevState + 1);
    setIsRemoveCost(e.dataTransfer.types.includes('remove'));
  }, []);

  const handleDragLeave = useCallback(() => {
    setEnterCounter((prevState) => prevState - 1);
  }, []);

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
      <div className={slotClasses}>
        <Typography className="slot-index">{`${index}. (#${slotProps.fastId})`}</Typography>
        <SlotComponent {...slotProps} />
      </div>
      <IconButton onClick={handleDelete} className="delete-button" title="Удалить слот">
        <DeleteIcon />
      </IconButton>
      <IconButton
        onClick={openExtra}
        onMouseEnter={openExtra}
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
        PaperProps={{ style: { width: '20ch' }, onMouseLeave: closeExtra }}
      >
        <MenuItem onClick={handleOpenTrailer}>Трейлер</MenuItem>
      </Menu>
    </div>
  );
};

export default DroppableSlot;
