import React from 'react';
import './SlotsColumn.scss';
import { useDispatch, useSelector } from 'react-redux';
import { IconButton } from '@material-ui/core';
import AddBoxIcon from '@material-ui/icons/AddBox';
import { RootState } from '../../reducers';
import SlotComponent from '../Slot/SlotComponent';
import { addSlot } from '../../reducers/Slots/Slots';

const SlotsColumn: React.FC = () => {
  const dispatch = useDispatch();
  const { slots } = useSelector((rootReducer: RootState) => rootReducer.slots);
  const handleAddSlot = (): void => {
    dispatch(addSlot());
  };

  return (
    <div className="slots-column">
      {slots.map((slot) => (
        <SlotComponent key={slot.id} {...slot} />
      ))}
      <IconButton onClick={handleAddSlot}>
        <AddBoxIcon fontSize="large" />
      </IconButton>
    </div>
  );
};

export default SlotsColumn;
