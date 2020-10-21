import React, { ChangeEvent, memo, useCallback, useEffect, useRef, useState } from 'react';
import { IconButton, OutlinedInput } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import './Slot.scss';
import { useDispatch } from 'react-redux';
import { FilledInputProps } from '@material-ui/core/FilledInput';
import { Slot } from '../../../models/slot.model';
import { addExtra, setSlotAmount, setSlotExtra, setSlotName } from '../../../reducers/Slots/Slots';

const SlotComponent: React.FC<Slot> = ({ id, extra, amount, name }) => {
  const dispatch = useDispatch();
  const [currentAmount, setCurrentAmount] = useState(amount);
  const [currentName, setCurrentName] = useState(name);
  const [currentExtra, setCurrentExtra] = useState(extra);
  const amountInput = useRef<HTMLInputElement>(null);

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
    <>
      <OutlinedInput
        className="slot-name slot-input"
        placeholder="Название"
        onBlur={handleNameBlur}
        onChange={handleNameChange}
        value={currentName}
      />
      <OutlinedInput
        className="slot-money slot-input"
        placeholder="₽"
        value={currentAmount || ''}
        onChange={handleAmountChange}
        ref={amountInput}
        type="number"
      />
      <IconButton onClick={handleAddExtra} title="Прибавить стоимость">
        <AddIcon />
      </IconButton>
      <OutlinedInput
        className="slot-money slot-input"
        placeholder="₽"
        onBlur={handleExtraBlur}
        onChange={handleExtraChange}
        value={currentExtra || ''}
        type="number"
        onKeyPress={handleKeyPress}
      />
    </>
  );
};

export default memo(SlotComponent);
