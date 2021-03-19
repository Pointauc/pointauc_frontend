import React, { FC, memo } from 'react';
import { Grid } from '@material-ui/core';
import FlipMove from 'react-flip-move';
import DroppableSlot from '../Slot/DroppableSlot';
import { Slot } from '../../../models/slot.model';

interface SlotsListProps {
  slots: Slot[];
}

const SlotsList: FC<SlotsListProps> = ({ slots }) => {
  return (
    <Grid container className="slots-column-list" spacing={1}>
      <FlipMove typeName={null} enterAnimation="fade" leaveAnimation="fade" maintainContainerHeight>
        {slots.map((slot, index) => (
          <Grid key={slot.id} item xs={12}>
            <DroppableSlot index={index + 1} {...slot} />
          </Grid>
        ))}
      </FlipMove>
    </Grid>
  );
};

export default memo(SlotsList);
