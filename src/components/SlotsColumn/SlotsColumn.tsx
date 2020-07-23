import React, { useMemo } from 'react';
import './SlotsColumn.scss';
import { useDispatch, useSelector } from 'react-redux';
import { IconButton } from '@material-ui/core';
import AddBoxIcon from '@material-ui/icons/AddBox';
import { useDrop } from 'react-dnd';
import classNames from 'classnames';
import { RootState } from '../../reducers';
import SlotComponent from '../Slot/SlotComponent';
import { addSlot, createSlotFromPurchase } from '../../reducers/Slots/Slots';
import { Slot } from '../../models/slot.model';
import { DRAG_TYPE } from '../../constants/drag.constants';
import { PurchaseDragType } from '../../models/purchase';

const SlotsColumn: React.FC = () => {
  const dispatch = useDispatch();
  const { slots } = useSelector((rootReducer: RootState) => rootReducer.slots);
  const handleAddSlot = (): void => {
    dispatch(addSlot());
  };

  const [{ isOver, canDrop }, drops] = useDrop({
    accept: DRAG_TYPE.PURCHASE,
    drop: (purchase: PurchaseDragType) => dispatch(createSlotFromPurchase(purchase)),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const sortedSlots = useMemo(
    () => [...slots].sort((a: Slot, b: Slot) => Number(b.amount) - Number(a.amount)),
    [slots],
  );

  const addButtonClasses = useMemo(
    () => classNames('add-button', { 'drop-help': canDrop && !isOver }, { 'drag-over': isOver }),
    [canDrop, isOver],
  );

  return (
    <div className="slots-column">
      {sortedSlots.map((slot) => (
        <SlotComponent key={slot.id} {...slot} />
      ))}
      <IconButton onClick={handleAddSlot} className={addButtonClasses} ref={drops}>
        <AddBoxIcon fontSize="large" />
      </IconButton>
    </div>
  );
};

export default SlotsColumn;
