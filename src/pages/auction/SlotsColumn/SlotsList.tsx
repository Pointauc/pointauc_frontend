import React, { FC, memo } from 'react';
import { Grid } from '@material-ui/core';
import FlipMove from 'react-flip-move';
import { useSelector } from 'react-redux';
import DroppableSlot from '../Slot/DroppableSlot';
import { Slot } from '../../../models/slot.model';
import { RootState } from '../../../reducers';

interface SlotsListProps {
  slots: Slot[];
}

const SlotsList: FC<SlotsListProps> = ({ slots }) => {
  const { compact } = useSelector((root: RootState) => root.aucSettings.view);
  return (
    <Grid container className="slots-column-list" spacing={1}>
      {compact ? (
        <div className="compact-view">
          {slots.map((slot, index) => (
            <Grid key={slot.id} item xs={12}>
              <DroppableSlot index={index + 1} {...slot} />
            </Grid>
          ))}
        </div>
      ) : (
        <FlipMove typeName={null} enterAnimation="fade" leaveAnimation="fade" maintainContainerHeight>
          {slots.map((slot, index) => (
            <Grid className="slot-grid-wrapper" key={slot.id} item xs={12}>
              <DroppableSlot index={index + 1} {...slot} />
            </Grid>
          ))}
        </FlipMove>
      )}
    </Grid>
  );
};

export default memo(SlotsList);
