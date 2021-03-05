import React, { ChangeEvent, FC, useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Switch, TextField, Typography } from '@material-ui/core';
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
  const [spinTime, setSpinTime] = useState<number>(20);
  const [dropout, setDropout] = useState<boolean>(false);
  const [rawItems, setRawItems] = useState(slots);

  const wheelItems = useMemo(() => {
    const items = rawItems.map<WheelItem>(({ id, name, amount }) => ({
      id: id.toString(),
      name: name || '',
      size: Number(amount),
      color: getWheelColor(),
    }));

    if (getTotalSize(items)) {
      return items.filter(({ size }) => size);
    }

    return items;
  }, [rawItems]);

  const handleWin = useCallback(
    (winner: WheelItem) => {
      if (dropout) {
        setRawItems((items) => items.filter(({ id }) => id !== winner.id));
      }
    },
    [dropout],
  );

  const { wheelComponent, spin } = useWheel({
    rawItems: wheelItems,
    onWin: handleWin,
    background: activeEmote,
    spinTime,
    dropout,
  });

  const handleSpinTimeChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSpinTime(Number(e.target.value));
  }, []);

  const handleDropoutChange = useCallback((e: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setDropout(checked);
  }, []);

  return (
    <PageContainer title="Колесо">
      <div>{wheelComponent}</div>
      <div className="wheel-controls">
        <div className="wheel-controls-row">
          <Button className="wheel-controls-button" variant="contained" color="primary" onClick={spin}>
            Крутить
          </Button>
          <TextField
            className="wheel-controls-input"
            variant="outlined"
            margin="dense"
            label="Длительность"
            type="number"
            onChange={handleSpinTimeChange}
            value={spinTime}
          />
          <Typography className="wheel-controls-tip">с.</Typography>
        </div>
        <div className="wheel-controls-row">
          <Typography>Колесо на выбывание</Typography>
          <Switch onChange={handleDropoutChange} />
        </div>
        <TwitchEmotesList setActiveEmote={setActiveEmote} />
      </div>
    </PageContainer>
  );
};

export default WheelPage;
