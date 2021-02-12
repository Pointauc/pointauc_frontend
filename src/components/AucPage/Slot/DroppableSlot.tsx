import React, { DragEvent, useCallback, useMemo, useState } from 'react';
import './Slot.scss';
import { IconButton, Typography } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
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
  const { id, amount, name } = slotProps;
  const isOver = useMemo(() => !!enterCounter, [enterCounter]);

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
      dispatch(setSlotAmount({ id, amount: Number(amount) + addedCost }));
      dispatch(logPurchase({ ...redemption, status: PurchaseStatusEnum.Processed, target: id.toString() }));
      dispatch(removePurchase(redemptionId));
      dispatch(setDraggedRedemption(null));
      dispatch(updateExistBids);

      if (!name) {
        dispatch(setSlotName({ id, name: message }));
      }
      setEnterCounter(0);
    },
    [amount, dispatch, id, name, pointsRate],
  );

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    setEnterCounter((prevState) => prevState + 1);
    setIsRemoveCost(e.dataTransfer.types.includes('remove'));
  }, []);

  const handleDragLeave = useCallback(() => {
    setEnterCounter((prevState) => prevState - 1);
  }, []);

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
    </div>
  );
};

export default DroppableSlot;
