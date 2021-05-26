import React, { ChangeEvent, FC, useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Slider, Switch, TextField, Typography } from '@material-ui/core';
import PageContainer from '../PageContainer/PageContainer';
import useWheel from '../../hooks/useWheel';
import { RootState } from '../../reducers';
import { WheelItem } from '../../models/wheel.model';
import { getTotalSize, getWheelColor } from '../../utils/common.utils';
import TwitchEmotesList from '../TwitchEmotesList/TwitchEmotesList';
import './WheelPage.scss';
import SlotsPresetInput from '../Form/SlotsPresetInput/SlotsPresetInput';
import { Slot } from '../../models/slot.model';

const WheelPage: FC = () => {
  const { slots } = useSelector((rootReducer: RootState) => rootReducer.slots);
  const [activeEmote, setActiveEmote] = useState<string | undefined>(undefined);
  const [spinTime, setSpinTime] = useState<number>(20);
  const [dropout, setDropout] = useState<boolean>(false);
  const [rawItems, setRawItems] = useState<Slot[]>(slots);
  const [dropoutRate, setDropoutRate] = useState<number>(1);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

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
      setIsSpinning(false);

      if (dropout) {
        setRawItems((items) => items.filter(({ id }) => id !== winner.id));
      }
    },
    [dropout],
  );

  const handleCustomWheel = useCallback((customSlots: Slot[]) => {
    setRawItems(customSlots);
  }, []);

  const { wheelComponent, spin } = useWheel({
    rawItems: wheelItems,
    onWin: handleWin,
    background: activeEmote,
    spinTime,
    dropout,
    dropoutRate,
  });

  const handleSpin = useCallback(() => {
    setIsSpinning(true);
    spin();
  }, [spin]);

  const handleSpinTimeChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSpinTime(Number(e.target.value));
  }, []);

  const handleDropoutRateChange = useCallback((e: ChangeEvent<{}>, value: number | number[]) => {
    setDropoutRate(Number(value));
  }, []);

  const handleDropoutChange = useCallback((e: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setDropout(checked);
  }, []);

  const presetHint = (
    <>
      <div>* Принимается простой текстовый файл, где позиции лотов разделены новой строкой *</div>
      <br />
      <div>Новые лоты появятся в колесе, но не будут влиять на аукцион</div>
    </>
  );

  return (
    <PageContainer title="Колесо">
      <div>{wheelComponent}</div>
      <div className="wheel-controls">
        <div className="wheel-controls-row">
          <Button
            disabled={isSpinning}
            className="wheel-controls-button"
            variant="contained"
            color="primary"
            onClick={handleSpin}
          >
            {isSpinning ? 'Крутимся...' : 'Крутить'}
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
        <div className="wheel-controls-row" style={{ marginTop: 15 }}>
          <Typography className="wheel-controls-tip md">Коэф. наеба</Typography>
          <Slider
            defaultValue={1}
            step={0.1}
            min={0.1}
            max={2}
            valueLabelDisplay="auto"
            onChange={handleDropoutRateChange}
            marks={[
              { value: 0.1, label: '0.1' },
              { value: 1, label: '1' },
              { value: 2, label: '2' },
            ]}
          />
        </div>
        <div className="wheel-controls-row">
          <Typography>Колесо на выбывание</Typography>
          <Switch onChange={handleDropoutChange} />
        </div>
        <div className="wheel-controls-row">
          <SlotsPresetInput buttonTitle="Импорт в колесо" onChange={handleCustomWheel} hint={presetHint} />
        </div>
        <TwitchEmotesList setActiveEmote={setActiveEmote} />
      </div>
    </PageContainer>
  );
};

export default WheelPage;
