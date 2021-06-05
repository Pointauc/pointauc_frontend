import React, { ChangeEvent, FC, useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Checkbox, FormControlLabel, Slider, Switch, TextField, Typography } from '@material-ui/core';
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
import PaceSettings from './PaceSettings/PaceSettings';
import { RandomPaceConfig } from '../../services/SpinPaceService';
import { PACE_PRESETS } from '../../constants/wheel';

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
  const [isRandomPace, setIsRandomPace] = useState<boolean>(false);
  const [paceConfig, setPaceConfig] = useState<RandomPaceConfig>(PACE_PRESETS.suddenFinal);
  const totalSize = useMemo(() => rawItems.reduce((acc, { amount }) => acc + (amount || 1), 0), [rawItems]);

  const handleEmoteChange = useCallback((emote: string) => {
    localStorage.setItem('wheelEmote', emote);
    setActiveEmote(emote);
  }, []);

  const maxSize = useMemo(
    () =>
      Math.max(
        ...slots.map<number>(({ amount }) => Number(amount)),
      ),
    [slots],
  );
  const [maxValidValue, setMaxValidValue] = useState<number>(maxSize);

  const splitedItems = useMemo(
    () =>
      rawItems.reduce<any[]>((acc, { amount, ...slot }) => {
        const part = Number(amount) / maxValidValue;

        if (part > 1) {
          return [...acc, ...new Array(Math.ceil(part)).fill({ ...slot, amount: Number(amount) / Math.ceil(part) })];
        }

        return [...acc, { ...slot, amount }];
      }, []),
    [maxValidValue, rawItems],
  );

  const wheelItems = useMemo(() => {
    const items = splitedItems.map<WheelItem>(({ id, name, amount }) => ({
      id: id.toString(),
      name: name || '',
      size: Number(amount),
      color: getWheelColor(),
    }));

    if (getTotalSize(items)) {
      return items.filter(({ size }) => size);
    }

    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [splitedItems.length, rawItems]);

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
    randomPaceConfig: isRandomPace ? paceConfig : undefined,
  });

  const handleSpin = useCallback(async () => {
    let seed: number | undefined;
    const size = totalSize > 720 ? totalSize : totalSize * 720;

    if (useRandomOrg) {
      seed = await withLoading(setIsLoadingSeed, getRandomNumber)(1, size);
    }

    setIsSpinning(true);

    spin(seed && seed / size);
  }, [spin, totalSize, useRandomOrg]);

  const handleSpinTimeChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSpinTime(Number(e.target.value));
  }, []);

  const handleDropoutRateChange = useCallback((e: ChangeEvent<{}>, value: number | number[]) => {
    setDropoutRate(Number(value));
  }, []);

  const handleMaxValueChange = useCallback((e: ChangeEvent<{}>, value: number | number[]) => {
    setMaxValidValue(Number(value));
  }, []);

  const handleDropoutChange = useCallback((e: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setDropout(checked);
  }, []);

  const handleIsRandomPaceChange = useCallback((e: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setIsRandomPace(checked);
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

  // const handlePredictChances = useCallback(() => {
  //   const count = 10000;
  //   const predictionService = new PredictionService(slots, dropoutRate);
  //
  //   console.log(sortSlots(predictionService.correctAmount(5, count)));
  // }, [dropoutRate, slots]);

  return (
    <PageContainer title="Колесо">
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
          <Typography className="wheel-controls-tip md">Разделить</Typography>
          <Slider
            defaultValue={maxValidValue}
            step={1}
            min={maxSize / 10}
            max={maxSize}
            valueLabelDisplay="auto"
            onChange={handleMaxValueChange}
            marks={[
              { value: maxSize / 10, label: 'макс / 10' },
              { value: maxSize, label: 'макс' },
            ]}
          />
        </div>
        <Typography className="wheel-controls-tip hint">
          делит дорогие лоты на несколько позиций.
          <br />
          НЕ ИСПОЛЬЗУЙТЕ ПРИ КОЛЕСЕ НА ВЫБЫВАНИЕ
        </Typography>
        <div className="wheel-controls-row">
          <Typography>Колесо на выбывание</Typography>
          <Switch onChange={handleDropoutChange} />
        </div>
        {dropout && <Typography>{`Осталось: ${wheelItems.length}`}</Typography>}
        <div className="wheel-controls-row">
          <Typography>Рандомный докрут</Typography>
          <Switch onChange={handleIsRandomPaceChange} />
        </div>
        <Typography className="wheel-controls-tip hint">ТЕПЕРЬ ЭТО АБСОЛЮТНО ТОЧНО РАБОТАЕТ</Typography>
        {isRandomPace && <PaceSettings paceConfig={paceConfig} setPaceConfig={setPaceConfig} spinTime={spinTime} />}

        {/* <div className="wheel-controls-row"> */}
        {/*  <Button onClick={handlePredictChances}>Рассчитать итоговые шансы на выбывание</Button> */}
        {/* </div> */}
        <div className="wheel-controls-row">
          <SlotsPresetInput buttonTitle="Импорт в колесо" onChange={handleCustomWheel} hint={presetHint} />
        </div>
        <TwitchEmotesList setActiveEmote={handleEmoteChange} />
      </div>
    </PageContainer>
  );
};

export default WheelPage;
