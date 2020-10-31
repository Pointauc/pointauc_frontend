import React, { useMemo } from 'react';
import './Slot.scss';
import { IconButton, Typography } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import { useDispatch } from 'react-redux';
import { useDrop } from 'react-dnd';
import classNames from 'classnames';
import SlotComponent from './SlotComponent';
import { deleteSlot, setSlotAmount, setSlotName } from '../../../reducers/Slots/Slots';
import { Slot } from '../../../models/slot.model';
import { DragTypeEnum } from '../../../enums/dragType.enum';
import { PurchaseDragType } from '../../../models/purchase';

interface DroppableSlotProps extends Slot {
  index: number;
}

const DroppableSlot: React.FC<DroppableSlotProps> = ({ index, ...slotProps }) => {
  const dispatch = useDispatch();
  const { id, amount, name } = slotProps;

  const [{ isOver, canDrop }, drops] = useDrop({
    accept: DragTypeEnum.Purchase,
    drop: ({ cost, message }: PurchaseDragType) => {
      dispatch(setSlotAmount({ id, amount: Number(amount) + cost }));

      if (!name) {
        dispatch(setSlotName({ id, name: message }));
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const slotClasses = useMemo(() => classNames('slot', { 'drop-help': canDrop && !isOver }, { 'drag-over': isOver }), [
    canDrop,
    isOver,
  ]);

  const handleDelete = (): void => {
    dispatch(deleteSlot(id));
  };

  return (
    <div className="slot-wrapper">
      <div className={slotClasses} ref={drops}>
        <Typography className="slot-index">{`${index}.`}</Typography>
        <SlotComponent {...slotProps} />
      </div>
      <IconButton onClick={handleDelete} className="delete-button" title="Удалить слот">
        <DeleteIcon />
      </IconButton>
    </div>
  );
};

export default DroppableSlot;
