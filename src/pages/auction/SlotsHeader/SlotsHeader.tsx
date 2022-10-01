import React, { FC } from 'react';
import NewSlotForm from './NewSlotForm/NewSlotForm';
import SlotSearch from './SlotSearch/SlotSearch';
import './SlotsHeader.scss';

const SlotsHeader: FC = () => {
  return (
    <div className="slots-header item">
      <div className="new-slot-wrapper item">
        <NewSlotForm />
      </div>
      {/* <Divider orientation="vertical" /> */}
      <div className="vertical-divider item" />
      <div className="slot-search-wrapper item">
        <SlotSearch />
      </div>
    </div>
  );
};

export default SlotsHeader;
