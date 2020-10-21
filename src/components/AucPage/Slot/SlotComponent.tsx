import React, { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IconButton, TextField, Typography } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import './Slot.scss';
import { useDispatch } from 'react-redux';
import { useDrop } from 'react-dnd';
import classNames from 'classnames';
import DeleteIcon from '@material-ui/icons/Delete';
import { FilledInputProps } from '@material-ui/core/FilledInput';
import { Slot } from '../../../models/slot.model';
import { addExtra, deleteSlot, setSlotAmount, setSlotExtra, setSlotName } from '../../../reducers/Slots/Slots';
import { PurchaseDragType } from '../../../models/purchase';
import { DragTypeEnum } from '../../../enums/dragType.enum';

interface SlotProps extends Slot {
  index: number;
}

const SlotComponent: React.FC<SlotProps> = ({ id, extra, amount, name, index }: SlotProps) => {
  const dispatch = useDispatch();
  const [currentAmount, setCurrentAmount] = useState(amount);
  const [currentName, setCurrentName] = useState(name);
  const [currentExtra, setCurrentExtra] = useState(extra);
  const amountInput = useRef<HTMLInputElement>(null);

  const [{ isOver, canDrop }, drops] = useDrop({
    accept: DragTypeEnum.Purchase,
    drop: ({ cost }: PurchaseDragType) => dispatch(setSlotAmount({ id, amount: Number(amount) + cost })),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const handleNameBlur: FilledInputProps['onBlur'] = (e): void => {
    dispatch(setSlotName({ id, name: e.target.value }));
  };
  const handleNameChange: FilledInputProps['onChange'] = (e): void => {
    setCurrentName(e.target.value);
  };

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>): void => setCurrentAmount(Number(e.target.value));

  const handleExtraBlur: FilledInputProps['onBlur'] = (e): void => {
    dispatch(setSlotExtra({ id, extra: Number(e.target.value) }));
  };
  const handleExtraChange: FilledInputProps['onChange'] = (e): void => {
    setCurrentExtra(Number(e.target.value));
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

  const handleKeyPress = (e: any): void => {
    if (e.key === 'Enter') {
      dispatch(setSlotExtra({ id, extra: Number(currentExtra) }));
      setCurrentExtra(null);
      handleAddExtra();
      e.preventDefault();
    }
  };

  useEffect(() => {
    if (amountInput.current) {
      amountInput.current.onchange = confirmAmount;
    }
  }, [confirmAmount]);

  useEffect(() => setCurrentAmount(amount), [amount]);
  useEffect(() => setCurrentName(name), [name]);
  useEffect(() => setCurrentExtra(extra), [extra]);

  return (
    <div className="slot-wrapper">
      <div className={slotClasses} ref={drops}>
        {/* {index === 1 && <CrownSvg className="slot-crown" />} */}
        <Typography className="slot-index">{`${index}.`}</Typography>
        <TextField
          className="slot-name slot-input"
          placeholder="Название"
          onBlur={handleNameBlur}
          onChange={handleNameChange}
          value={currentName}
          variant="outlined"
        />
        <TextField
          className="slot-money slot-input"
          placeholder="₽"
          value={currentAmount || ''}
          onChange={handleAmountChange}
          ref={amountInput}
          variant="outlined"
          type="number"
        />
        <IconButton onClick={handleAddExtra} title="Прибавить стоимость">
          <AddIcon />
        </IconButton>
        <TextField
          className="slot-money slot-input"
          placeholder="₽"
          onBlur={handleExtraBlur}
          onChange={handleExtraChange}
          value={currentExtra || ''}
          variant="outlined"
          type="number"
          onKeyPress={handleKeyPress}
        />
      </div>
      <IconButton onClick={handleDelete} className="delete-button" title="Удалить слот">
        <DeleteIcon />
      </IconButton>
    </div>
  );
};

export default SlotComponent;
