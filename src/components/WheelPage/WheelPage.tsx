import React, { ChangeEvent, FC, Key, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Checkbox, FormControlLabel, Slider, Switch, TextField, Typography } from '@material-ui/core';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { MapInteractionCSS } from 'react-map-interaction';
import classNames from 'classnames';
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
import { PACE_PRESETS, WHEEL_OPTIONS, WheelFormat } from '../../constants/wheel';
import RadioButtonGroup from '../RadioButtonGroup/RadioButtonGroup';
import SlotsBracket from '../SlotsBracket/SlotsBracket';
import { Game, Side } from '../Bracket/components/model';

const WheelPage: FC = () => {
  const { slots } = useSelector((rootReducer: RootState) => rootReducer.slots);
  const [activeEmote, setActiveEmote] = useState<string | undefined | null>(localStorage.getItem('wheelEmote'));
  const [spinTime, setSpinTime] = useState<number>(20);
  const [rawItemsBase, setRawItems] = useState<Slot[]>(slots);
  const [dropoutRate, setDropoutRate] = useState<number>(1);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [isLoadingSeed, setIsLoadingSeed] = useState<boolean>(false);
  const [useRandomOrg, setUseRandomOrg] = useState<boolean>(true);
  const [isRandomPace, setIsRandomPace] = useState<boolean>(false);
  const [isFullscreenBracket, setIsFullscreenBracket] = useState<boolean>(false);
  const [wheelFormat, setWheelFormat] = useState<Key>(WheelFormat.Default);
  const [paceConfig, setPaceConfig] = useState<RandomPaceConfig>(PACE_PRESETS.suddenFinal);
  const bracketWrapper = useRef<HTMLDivElement>(null);
  const [gamesOrder, setGamesOrder] = useState<Game[]>([]);
  const [nextWinner, setNextWinner] = useState<WheelItem | null>(null);
  const [selectedGame, setSelectedGame] = useState<Key>('');

  const currentDuel = useMemo(() => {
    if (!gamesOrder.length) {
      return [];
    }
    const { home, visitor } = gamesOrder[0];

    return [home, visitor] as any[];
  }, [gamesOrder]);

  const rawItems = useMemo(() => (wheelFormat === WheelFormat.BattleRoyal ? currentDuel : rawItemsBase), [
    currentDuel,
    rawItemsBase,
    wheelFormat,
  ]);
  const totalSize = useMemo(() => rawItems.reduce((acc, { amount }) => acc + (amount || 1), 0), [rawItems]);

  const handleEmoteChange = useCallback((emote: string) => {
    localStorage.setItem('wheelEmote', emote);
    setActiveEmote(emote);
  }, []);

  const maxSize = useMemo(
    () =>
      Math.max(
        ...rawItems.map<number>(({ amount }) => Number(amount)),
      ),
    [rawItems],
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
  }, [splitedItems.length, rawItems, currentDuel, wheelFormat]);

  const handleWin = useCallback(
    (winner: WheelItem) => {
      setIsSpinning(false);
      setNextWinner(winner);

      if (wheelFormat === WheelFormat.Dropout) {
        setRawItems((items) => items.filter(({ id }) => id !== winner.id));
      }

      if (wheelFormat === WheelFormat.BattleRoyal) {
        const game = gamesOrder[0];
        game.winner = game.home.id === winner.id ? Side.HOME : Side.VISITOR;
        if (game.parentSide) {
          game.parentSide.id = winner.id;
          game.parentSide.name = winner.name;
        }
        const parentTitle = document.getElementById(`${game.parentSide?.gameId}${game.parentSide?.side}`);

        if (parentTitle) {
          parentTitle.innerHTML = winner.name;
        }
        setSelectedGame('');
      }
    },
    [gamesOrder, wheelFormat],
  );

  const handleCustomWheel = useCallback((customSlots: Slot[]) => {
    setRawItems(customSlots);
  }, []);

  const { wheelComponent, spin, clearWinner } = useWheel({
    rawItems: wheelItems,
    onWin: handleWin,
    background: activeEmote,
    spinTime,
    dropout: wheelFormat === WheelFormat.Dropout,
    dropoutRate,
  });

  const nextTurn = useCallback(() => {
    clearWinner();
    setNextWinner(null);
    setGamesOrder((prev) => prev.slice(1));
    setSelectedGame(gamesOrder && gamesOrder[0] ? gamesOrder[0].id : '');
  }, [clearWinner, gamesOrder]);

  const handleSpin = useCallback(async () => {
    let seed: number | undefined;
    const size = totalSize > 5000 ? totalSize : totalSize + 10000;

    if (useRandomOrg) {
      try {
        seed = await withLoading(setIsLoadingSeed, getRandomNumber)(1, size);
      } catch (e) {
        seed = undefined;
      }
    }

    setIsSpinning(true);

    spin(seed && seed / size, isRandomPace ? paceConfig : undefined);
  }, [isRandomPace, paceConfig, spin, totalSize, useRandomOrg]);

  const handleSpinTimeChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSpinTime(Number(e.target.value));
  }, []);

  const handleDropoutRateChange = useCallback((e: ChangeEvent<{}>, value: number | number[]) => {
    setDropoutRate(Number(value));
  }, []);

  const handleMaxValueChange = useCallback((e: ChangeEvent<{}>, value: number | number[]) => {
    setMaxValidValue(Number(value));
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

  const handleChangeFullscreen = useCallback(() => {
    setIsFullscreenBracket((prev) => !prev);
  }, []);

  useEffect(() => {
    if (wheelFormat === WheelFormat.BattleRoyal) {
      setSelectedGame(gamesOrder && gamesOrder[0] ? gamesOrder[0].id : '');
    }
  }, [gamesOrder, wheelFormat]);

  return (
    <PageContainer className="wheel-wrapper" title="Колесо">
      <div className="content">
        {/* <div hidden={isFullscreenBracket} style={{ width: '0', height: '100%', display: 'inline-block' }}> */}
        {wheelComponent}
        {/* </div> */}
        <div className="wheel-info-wrapper">
          <div
            style={{ maxHeight: wheelFormat === WheelFormat.BattleRoyal ? '50%' : '100%' }}
            className="wheel-controls"
          >
            <div className="settings">
              <div className="wheel-controls-row">
                {wheelFormat === WheelFormat.BattleRoyal && nextWinner ? (
                  <Button className="wheel-controls-button" variant="contained" color="primary" onClick={nextTurn}>
                    следующая дуэль
                  </Button>
                ) : (
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
                )}
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
              <RadioButtonGroup
                style={{ marginTop: 10 }}
                options={WHEEL_OPTIONS}
                activeKey={wheelFormat}
                onChangeActive={setWheelFormat}
              />
              {wheelFormat === WheelFormat.BattleRoyal && (
                <Typography className="wheel-controls-tip hint">Аторы оригинальной идеи - Browjey и Вирал</Typography>
              )}
              {wheelFormat === WheelFormat.Dropout && (
                <Typography style={{ marginTop: 10 }}>{`Осталось: ${wheelItems.length}`}</Typography>
              )}
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
                <Typography>Финал с перчинкой</Typography>
                <Switch onChange={handleIsRandomPaceChange} />
              </div>
              <Typography className="wheel-controls-tip hint">ТЕПЕРЬ ЭТО АБСОЛЮТНО ТОЧНО РАБОТАЕТ</Typography>
              {isRandomPace && (
                <PaceSettings paceConfig={paceConfig} setPaceConfig={setPaceConfig} spinTime={spinTime} />
              )}

              {/* <div className="wheel-controls-row"> */}
              {/*  <Button onClick={handlePredictChances}>Рассчитать итоговые шансы на выбывание</Button> */}
              {/* </div> */}
              <div className="wheel-controls-row" style={{ marginTop: 20 }}>
                <SlotsPresetInput buttonTitle="Импорт в колесо" onChange={handleCustomWheel} hint={presetHint} />
              </div>
            </div>
            <div className="settings">
              <TwitchEmotesList setActiveEmote={handleEmoteChange} />
            </div>
          </div>
          {wheelFormat === WheelFormat.BattleRoyal && (
            <div className="bracket-wrapper">
              <div
                className={classNames('bracket-sub-wrapper', { fullscreen: isFullscreenBracket })}
                ref={bracketWrapper}
              >
                <Button
                  color="primary"
                  variant="outlined"
                  onClick={handleChangeFullscreen}
                  className="fullscreen-button"
                >
                  {isFullscreenBracket ? 'Свернуть' : 'На весь экран'}
                </Button>
                <Typography className="hint">можно перемежать и масштабировать</Typography>
                {/* <TransformWrapper> */}
                {/*  <TransformComponent> */}
                {/*    <div style={{ scale: minBracketScale }}> */}
                <MapInteractionCSS>
                  <SlotsBracket onGamesOrder={setGamesOrder} currentGame={selectedGame} slots={rawItemsBase} />
                </MapInteractionCSS>
                {/* </div> */}
                {/*  </TransformComponent> */}
                {/* </TransformWrapper> */}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default WheelPage;
