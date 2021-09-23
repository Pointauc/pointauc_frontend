import React, { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import PageContainer from '../PageContainer/PageContainer';
import { RootState } from '../../reducers';
import { WheelItem } from '../../models/wheel.model';
import { getWheelColor } from '../../utils/common.utils';
import RandomWheel from '../RandomWheel/RandomWheel';

const WheelPage: FC = () => {
  const { slots } = useSelector((rootReducer: RootState) => rootReducer.slots);

  const wheelItems = useMemo(
    () =>
      slots.map<WheelItem>(({ id, name, amount }) => ({
        id: id.toString(),
        name: name || '',
        amount: Number(amount),
        color: getWheelColor(),
      })),
    [slots],
  );

  return (
    <PageContainer className="wheel-wrapper padding" title="Колесо">
      <RandomWheel items={wheelItems} />
    </PageContainer>
  );
};

export default WheelPage;
