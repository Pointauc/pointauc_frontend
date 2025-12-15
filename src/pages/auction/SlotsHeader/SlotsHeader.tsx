import { FC } from 'react';

import NewSlotForm from './NewSlotForm/NewSlotForm';
import SlotSearch from './SlotSearch/SlotSearch';
import classes from './SlotsHeader.module.css';

const SlotsHeader: FC = () => {
  return (
    <div className={`${classes.slotsHeader} item`}>
      <div className={`${classes.newSlotWrapper} item`}>
        <NewSlotForm />
      </div>
      {/* <Divider orientation="vertical" /> */}
      <div className={`${classes.verticalDivider} item`} />
      <div className={`${classes.slotSearchWrapper} item`}>
        <SlotSearch />
      </div>
    </div>
  );
};

export default SlotsHeader;
