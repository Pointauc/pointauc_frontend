import React, { FC, memo } from 'react';
import { Grid } from '@material-ui/core';
import FlipMove from 'react-flip-move';
import DroppableSlot from '../Slot/DroppableSlot';
import { Slot } from '../../../models/slot.model';

interface SlotsListProps {
  slots: Slot[];
  slotWidth: 6 | 12;
}

const SlotsList: FC<SlotsListProps> = ({ slots, slotWidth }) => {
  return (
    <Grid container className="slots-column-list" spacing={1}>
      <FlipMove typeName={null} enterAnimation="fade" leaveAnimation="fade" maintainContainerHeight>
        {slots.map((slot, index) => (
          <Grid key={slot.id} item xs={slotWidth}>
            <DroppableSlot index={index + 1} {...slot} />
          </Grid>
        ))}
      </FlipMove>
    </Grid>
  );
};

export default memo(SlotsList);
