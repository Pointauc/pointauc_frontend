import React, { FC, useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@material-ui/core';
import PageContainer from '../PageContainer/PageContainer';
import useWheel from '../../hooks/useWheel';
import { RootState } from '../../reducers';
import { WheelItem } from '../../models/wheel.model';
import { getTotalSize, getWheelColor } from '../../utils/common.utils';
import TwitchEmotesList from '../TwitchEmotesList/TwitchEmotesList';
import './WheelPage.scss';

const WheelPage: FC = () => {
  const { slots } = useSelector((rootReducer: RootState) => rootReducer.slots);
  const [activeEmote, setActiveEmote] = useState<string | undefined>(undefined);
  const wheelItems = useMemo(() => {
    const items = slots.map<WheelItem>(({ id, name, amount }) => ({
      id: id.toString(),
      name: name || '',
      size: Number(amount),
      color: getWheelColor(),
    }));

    if (getTotalSize(items)) {
      return items.filter(({ size }) => size);
    }

    return items;
  }, [slots]);

  const handleWin = useCallback((winner: WheelItem) => {
    console.log(winner);
  }, []);

  const { wheelComponent, spin } = useWheel(wheelItems, handleWin, activeEmote);

  return (
    <PageContainer title="Колесо">
      <div>{wheelComponent}</div>
      <div className="wheel-controls">
        <Button variant="contained" color="primary" onClick={spin}>
          Крутить
        </Button>
        <TwitchEmotesList setActiveEmote={setActiveEmote} />
      </div>
    </PageContainer>
  );
};

export default WheelPage;
