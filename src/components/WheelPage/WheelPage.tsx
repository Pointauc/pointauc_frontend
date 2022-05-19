import React, { FC, Key, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageContainer from '../PageContainer/PageContainer';
import { RootState } from '../../reducers';
import { WheelItem } from '../../models/wheel.model';
import RandomWheel from '../RandomWheel/RandomWheel';
import { deleteSlot } from '../../reducers/Slots/Slots';
import { slotToWheel } from '../../utils/slots.utils';

const WheelPage: FC = () => {
  const dispatch = useDispatch();
  const { slots } = useSelector((rootReducer: RootState) => rootReducer.slots);

  const wheelItems = useMemo(() => slots.map<WheelItem>(slotToWheel), [slots]);

  const deleteItem = (id: Key) => {
    dispatch(deleteSlot(id.toString()));
  };

  return (
    <PageContainer className="wheel-wrapper padding" title="Колесо">
      <RandomWheel items={wheelItems} deleteItem={deleteItem} />
    </PageContainer>
  );
};

export default WheelPage;
