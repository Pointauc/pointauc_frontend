import React, { FC, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@material-ui/core';
import PageContainer from '../PageContainer/PageContainer';
import useWheel from '../../hooks/useWheel';
import { RootState } from '../../reducers';
import { WheelItem } from '../../models/wheel.model';
import { getWheelColor } from '../../utils/common.utils';

const WheelPage: FC = () => {
  const { slots } = useSelector((rootReducer: RootState) => rootReducer.slots);
  const wheelItems = useMemo(
    () =>
      slots.map<WheelItem>(({ id, name, amount }) => ({
        id: id.toString(),
        name: name || '',
        size: Number(amount),
        color: getWheelColor(),
      })),
    [slots],
  );

  const handleWin = useCallback((winner: WheelItem) => {
    console.log(winner);
  }, []);

  const { wheelComponent, spin } = useWheel(wheelItems, handleWin);

  return (
    <PageContainer title="Колесо">
      <div>{wheelComponent}</div>
      <Button variant="contained" color="primary" onClick={spin}>
        Крутить
      </Button>
    </PageContainer>
  );
};

export default WheelPage;
