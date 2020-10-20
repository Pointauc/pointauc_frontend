import React, { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IconButton, TextField, Typography } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import './Slot.scss';
import { useDispatch } from 'react-redux';
import { useDrop } from 'react-dnd';
import classNames from 'classnames';
import DeleteIcon from '@material-ui/icons/Delete';
import { Slot } from '../../../models/slot.model';
import { addExtra, deleteSlot, setSlotAmount, setSlotExtra, setSlotName } from '../../../reducers/Slots/Slots';
import { PurchaseDragType } from '../../../models/purchase';
import { DragTypeEnum } from '../../../enums/dragType.enum';
import { ReactComponent as CrownSvg } from '../../../assets/icons/crown.svg';

interface SlotProps extends Slot {
  index: number;
}

const SlotComponent: React.FC<SlotProps> = ({ id, extra, amount, name, index }: SlotProps) => {
  const dispatch = useDispatch();
  const [currentAmount, setCurrentAmount] = useState(amount);
  const amountInput = useRef<HTMLInputElement>(null);

  const [{ isOver, canDrop }, drops] = useDrop({
    accept: DragTypeEnum.Purchase,
    drop: ({ cost }: PurchaseDragType) => dispatch(setSlotAmount({ id, amount: Number(amount) + cost })),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    dispatch(setSlotName({ id, name: e.target.value }));
  };
  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>): void => setCurrentAmount(Number(e.target.value));
  const handleExtraChange = (e: ChangeEvent<HTMLInputElement>): void => {
    dispatch(setSlotExtra({ id, extra: Number(e.target.value) }));
  };

  const handleAddExtra = (): void => {
    dispatch(addExtra(id));
  };

  const handleDelete = (): void => {
    dispatch(deleteSlot(id));
  };

  const slotClasses = useMemo(() => classNames('slot', { 'drop-help': canDrop && !isOver }, { 'drag-over': isOver }), [
    canDrop,
    isOver,
  ]);

  const confirmAmount = useCallback(() => {
    dispatch(setSlotAmount({ id, amount: Number(currentAmount) }));
  }, [currentAmount, dispatch, id]);

  useEffect(() => {
    if (amountInput.current) {
      amountInput.current.onchange = confirmAmount;
    }
  }, [confirmAmount]);

  useEffect(() => setCurrentAmount(amount), [amount]);

  return (
    <div className="slot-wrapper">
      <div className={slotClasses} ref={drops}>
        {index === 1 && <CrownSvg className="slot-crown" />}
        <Typography className="slot-index">{`${index}.`}</Typography>
        <TextField
          className="slot-name slot-input"
          placeholder="Название"
          onChange={handleNameChange}
          value={name}
          variant="outlined"
        />
        <TextField
          className="slot-money slot-input"
          placeholder="₽"
          value={currentAmount || ''}
          onChange={handleAmountChange}
          ref={amountInput}
          variant="outlined"
        />
        <IconButton onClick={handleAddExtra} title="Прибавить стоимость">
          <AddIcon />
        </IconButton>
        <TextField
          className="slot-money slot-input"
          placeholder="₽"
          onChange={handleExtraChange}
          value={extra || ''}
          variant="outlined"
        />
      </div>
      <IconButton onClick={handleDelete} className="delete-button" title="Удалить слот">
        <DeleteIcon />
      </IconButton>
    </div>
  );
};

export default SlotComponent;
