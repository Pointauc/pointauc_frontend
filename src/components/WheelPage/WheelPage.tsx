import React, { ChangeEvent, FC, useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Checkbox, FormControlLabel, Slider, Switch, Tab, TextField, Typography } from '@material-ui/core';
import PageContainer from '../PageContainer/PageContainer';
import useWheel from '../../hooks/useWheel';
import { RootState } from '../../reducers';
import { WheelItem } from '../../models/wheel.model';
import { getTotalSize, getWheelColor } from '../../utils/common.utils';
import TwitchEmotesList from '../TwitchEmotesList/TwitchEmotesList';
import './WheelPage.scss';
import SlotsPresetInput from '../Form/SlotsPresetInput/SlotsPresetInput';
import { Slot } from '../../models/slot.model';
import { getRandomNumber } from '../../api/randomApi';
import LoadingButton from '../LoadingButton/LoadingButton';
import withLoading from '../../decorators/withLoading';

const WheelPage: FC = () => {
  const { slots } = useSelector((rootReducer: RootState) => rootReducer.slots);
  const [activeEmote, setActiveEmote] = useState<string | undefined | null>(localStorage.getItem('wheelEmote'));
  const [spinTime, setSpinTime] = useState<number>(20);
  const [dropout, setDropout] = useState<boolean>(false);
  const [rawItems, setRawItems] = useState<Slot[]>(slots);
  const [dropoutRate, setDropoutRate] = useState<number>(1);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [isLoadingSeed, setIsLoadingSeed] = useState<boolean>(false);
  const [useRandomOrg, setUseRandomOrg] = useState<boolean>(true);
  const totalSize = useMemo(() => rawItems.reduce((acc, { amount }) => acc + (amount || 1), 0), [rawItems]);

  const handleEmoteChange = useCallback((emote: string) => {
    localStorage.setItem('wheelEmote', emote);
    setActiveEmote(emote);
  }, []);

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

  const handleSpin = useCallback(async () => {
    let seed: number | undefined;

    if (useRandomOrg) {
      seed = await withLoading(setIsLoadingSeed, getRandomNumber)(1, totalSize);
    }

    setIsSpinning(true);
    spin(seed);
  }, [spin, totalSize, useRandomOrg]);

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

  const handleUseRandomOrg = useCallback((e, checked: boolean) => {
    setUseRandomOrg(checked);
  }, []);

  return (
    <PageContainer title="Колесо">
      <Tab />
      <div>{wheelComponent}</div>
      <div className="wheel-controls">
        <div className="wheel-controls-row">
          <LoadingButton
            isLoading={isLoadingSeed}
            disabled={isSpinning || isLoadingSeed}
            className="wheel-controls-button"
            variant="contained"
            color="primary"
            onClick={handleSpin}
          >
            {isSpinning ? 'Крутимся...' : 'Крутить'}
          </LoadingButton>
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
        <FormControlLabel
          control={<Checkbox checked={useRandomOrg} onChange={handleUseRandomOrg} color="primary" />}
          label="Использовать сервис random.org"
          className="wheel-controls-checkbox"
        />
        <div className="wheel-controls-row">
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
        <TwitchEmotesList setActiveEmote={handleEmoteChange} />
      </div>
    </PageContainer>
  );
};

export default WheelPage;
