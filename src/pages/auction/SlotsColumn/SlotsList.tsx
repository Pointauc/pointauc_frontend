import { FC, memo } from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import FlipMove from 'react-flip-move';
import { useSelector } from 'react-redux';
import classNames from 'classnames';

import { Slot } from '@models/slot.model.ts';
import { RootState } from '@reducers';

import DroppableSlot from '../Slot/DroppableSlot';

interface SlotsListProps {
  slots: Slot[];
}

const SlotsList: FC<SlotsListProps> = ({ slots }) => {
  const compact = useSelector((root: RootState) => root.aucSettings.view.compact);

  return (
    <Grid container className={classNames('slots-column-list', { 'compact-view': compact })}>
      {compact ? (
        slots.map((slot, index) => (
          <div className='slot-grid-wrapper' key={slot.id}>
            <DroppableSlot index={index + 1} slot={slot} />
          </div>
        ))
      ) : (
        <FlipMove typeName={null} enterAnimation='fade' leaveAnimation='fade' maintainContainerHeight>
          {slots.map((slot, index) => (
            <div className='slot-grid-wrapper' key={slot.id}>
              <DroppableSlot index={index + 1} slot={slot} />
            </div>
          ))}
        </FlipMove>
      )}
    </Grid>
  );
};

export default memo(SlotsList);
