import React, { ChangeEvent } from 'react';
import { IconButton, Input } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import './Slot.scss';
import { useDispatch } from 'react-redux';
import { Slot } from '../../models/slot.model';
import { setSlotName, setSlotAmount, setSlotExtra, addExtra } from '../../reducers/Slots/Slots';

const SlotComponent: React.FC<Slot> = ({ id, extra, amount, name }: Slot) => {
  const dispatch = useDispatch();

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    dispatch(setSlotName({ id, name: e.target.value }));
  };
  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>): void => {
    dispatch(setSlotAmount({ id, amount: e.target.value }));
  };
  const handleExtraChange = (e: ChangeEvent<HTMLInputElement>): void => {
    dispatch(setSlotExtra({ id, extra: e.target.value }));
  };

  const handleAddExtra = (): void => {
    dispatch(addExtra(id));
  };

  return (
    <div className="slot">
      <Input
        className="slot-name"
        placeholder="Название"
        onChange={handleNameChange}
        value={name}
      />
      <Input className="slot-money" placeholder="₽" onChange={handleAmountChange} value={amount} />
      <IconButton onClick={handleAddExtra}>
        <AddIcon fontSize="large" />
      </IconButton>
      <Input className="slot-money" placeholder="₽" onChange={handleExtraChange} value={extra} />
    </div>
  );
};

export default SlotComponent;
