import React, { ChangeEvent, FC, Key, useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Slider,
  Switch,
  TextField,
  Typography,
} from '@material-ui/core';
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
import { Game, Side } from '../Bracket/components/model';
import ResizableBracket from './ResizableBracket/ResizableBracket';
import DropoutWheelProof from './DropoutWheelProof/DropoutWheelProof';

const WheelPage: FC = () => {
  const { slots } = useSelector((rootReducer: RootState) => rootReducer.slots);
  const [activeEmote, setActiveEmote] = useState<string | undefined | null>(localStorage.getItem('wheelEmote'));
  const [spinTime, setSpinTime] = useState<number>(20);
  const [rawItemsBase, setRawItems] = useState<Slot[]>(slots);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [isLoadingSeed, setIsLoadingSeed] = useState<boolean>(false);
  const [useRandomOrg, setUseRandomOrg] = useState<boolean>(true);
  const [isRandomPace, setIsRandomPace] = useState<boolean>(false);
  const [wheelFormat, setWheelFormat] = useState<Key>(WheelFormat.Default);
  const [paceConfig, setPaceConfig] = useState<RandomPaceConfig>(PACE_PRESETS.suddenFinal);
  const [gamesOrder, setGamesOrder] = useState<Game[]>([]);
  const [nextWinner, setNextWinner] = useState<WheelItem | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null | undefined>(null);
  const [isDuelHelpOpen, setIsDuelHelpOpen] = useState<boolean>(false);
  const [isKoefDescriptionOpen, setIsKoefDescriptionOpen] = useState<boolean>(false);
  const [isDropoutProofOpen, setIsDropoutProofOpen] = useState<boolean>(false);

  const currentDuel = useMemo(() => {
    if (!gamesOrder.length) {
      return [];
    }
    const { home, visitor } = gamesOrder[0];

    return [home, visitor] as any[];
  }, [gamesOrder]);

  const rawItems = useMemo(
    () => (wheelFormat === WheelFormat.BattleRoyal ? currentDuel : rawItemsBase),
    [currentDuel, rawItemsBase, wheelFormat],
  );
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

  const maxSize = useMemo(() => Math.max(...wheelItems.map<number>(({ size }) => Number(size))), [wheelItems]);
  const [maxValidValue, setMaxValidValue] = useState<number>(maxSize);

  const splittedItems = useMemo(
    () =>
      wheelItems.reduce<WheelItem[]>((acc, { size, ...item }) => {
        const part = Number(size) / maxValidValue;

        if (part > 1) {
          return [
            ...acc,
            ...new Array<WheelItem>(Math.ceil(part)).fill({ ...item, size: Number(size) / Math.ceil(part) }),
          ];
        }

        return [...acc, { ...item, size }];
      }, []),
    [maxValidValue, wheelItems],
  );

  const finalItems = useMemo(() => {
    return splittedItems;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [splittedItems.length, wheelItems]);

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
        setSelectedGame(null);
      }
    },
    [gamesOrder, wheelFormat],
  );

  const handleCustomWheel = useCallback((customSlots: Slot[]) => {
    setRawItems(customSlots);
  }, []);

  const { wheelComponent, spin, clearWinner } = useWheel({
    rawItems: finalItems,
    onWin: handleWin,
    background: activeEmote,
    spinTime,
    dropout: wheelFormat === WheelFormat.Dropout,
  });

  const nextTurn = useCallback(() => {
    clearWinner();
    setNextWinner(null);
    setGamesOrder((prev) => prev.slice(1));
    setSelectedGame(gamesOrder && gamesOrder[0]);
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

  const handleMaxValueChange = useCallback((e: ChangeEvent<{}>, value: number | number[]) => {
    setMaxValidValue(Number(value));
  }, []);

  const handleIsRandomPaceChange = useCallback((e: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setIsRandomPace(checked);
  }, []);

  useEffect(() => {
    setMaxValidValue(maxSize);
  }, [maxSize]);

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

  const toggleHelp = useCallback(() => {
    setIsDuelHelpOpen((prev) => !prev);
  }, []);

  const toggleKoefDescription = useCallback(() => {
    setIsKoefDescriptionOpen((prev) => !prev);
  }, []);

  const toggleDropoutProof = useCallback(() => {
    setIsDropoutProofOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    if (wheelFormat === WheelFormat.BattleRoyal) {
      setSelectedGame(gamesOrder && gamesOrder[0]);
    }
  }, [gamesOrder, wheelFormat]);

  return (
    <PageContainer className="wheel-wrapper" title="Колесо">
      <div className="content">
        {/* <div hidden={isFullscreenBracket} style={{ width: '0', height: '100%', display: 'inline-block' }}> */}
        {wheelComponent}
        {/* </div> */}
        <div className="wheel-info-wrapper">
          <div className={classNames('wheel-controls', { shrink: wheelFormat === WheelFormat.BattleRoyal })}>
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
                <>
                  <Typography className="wheel-controls-tip hint">Аторы оригинальной идеи - Browjey и Вирал</Typography>
                  <Dialog open={isDuelHelpOpen} onClose={toggleHelp} className="description" maxWidth="sm" fullWidth>
                    <DialogTitle>Описание дуэльного режима</DialogTitle>
                    <DialogContent dividers className="description-content">
                      <div style={{ color: '#e5c938' }}>Как работает этот режим?</div>
                      <div>
                        Варианты аукциона сражаются друг с другом, победивший вариант
                        <span style={{ color: '#ff5c36' }}> забирает себе стоимость </span>
                        проигравшего и продвигается дальше в турнирной сетке.
                        <br />
                        (порядок ходов выстроен так, что сначала играется нижняя сетка, затем верхняя)
                      </div>
                      <div>
                        Просто жмите крутить, а дальше разберетесь. Также вы можете поизучать турнирную сетку, нажмите
                        на позицию, чтобы проследить весь путь лота.
                      </div>
                      <div style={{ color: '#e5c938' }}>Сохраняются ли шансы при таком формате?</div>
                      <div>
                        <span style={{ color: '#59ce4b' }}> Абсолютно точно ДА! </span>
                        Шанс лота выграть в этом формате точно такой же как и в обычном колесе, а что самое интересное,
                        нет никакой разницы в каком порядке проводятся дуэли, шансы остаются теми же.
                      </div>
                      <div>У меня пока не было времени оформить пруфы, но скоро я их добавлю.</div>
                    </DialogContent>
                  </Dialog>
                  <button onClick={toggleHelp} type="button" className="description-link">
                    Как это работает?
                  </button>
                </>
              )}
              <Dialog
                open={isKoefDescriptionOpen}
                onClose={toggleKoefDescription}
                className="description"
                maxWidth="sm"
                fullWidth
              >
                <DialogTitle>Эквивалентность форматов колеса</DialogTitle>
                <DialogContent dividers className="description-content">
                  <div>
                    Недавно я смог на 100% доказать, что
                    <span style={{ color: '#59ce4b' }}> ВСЕ ФОРМАТЫ КОЛЕСА АБСОЛЮТНО ИДЕНТИЧНЫ ПО ШАНСАМ. </span>
                  </div>
                  <div>
                    Нет никакой разницы крутите вы обычное колесо, колесо на выбывание или колесо батл рояль, шансы на
                    победу по итогу во всех колесах будут идентичны.
                  </div>
                  <div>
                    Пруфы всего этого вы найдете при выборе отдельного режима. (пока еще не успел оформить, но скоро
                    добавлю). Даже если кому-то интуитивно может показаться обратное, то это заключение неверно и тому
                    есть доказательство.
                  </div>
                  <div>
                    Огромная благодарность
                    <span style={{ color: '#c669ff' }}> dzyaka </span>
                    за оказание помощи в математической экспертизе)
                  </div>
                  <div>
                    Раньше кэф использовался чтобы более правильно откалибровать выбывание, но теперь в этом нет
                    необходимости. Возможно в будущем он вернется, но на какое-то время я его удалю, чтобы привлечь
                    внимание.
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog
                open={isDropoutProofOpen}
                onClose={toggleDropoutProof}
                className="description dropout"
                maxWidth="md"
                fullWidth
              >
                <DialogTitle>ДОКАЗАТЕЛЬСТВО, что выбывание не отличается от обычного колеса!</DialogTitle>
                <DialogContent dividers className="description-content-dropout">
                  <DropoutWheelProof />
                </DialogContent>
              </Dialog>
              {(wheelFormat === WheelFormat.Default || wheelFormat === WheelFormat.Dropout) && (
                <button onClick={toggleDropoutProof} type="button" className="description-link">
                  ДОКАЗАТЕЛЬСТВО, что выбывание не отличается от обычного колеса!
                </button>
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
                <Typography className="wheel-controls-tip md">Разделить</Typography>
                <Slider
                  step={1}
                  min={maxSize / 10}
                  max={maxSize}
                  valueLabelDisplay="auto"
                  onChange={handleMaxValueChange}
                  value={maxValidValue}
                  marks={[
                    { value: maxSize / 10, label: 'макс / 10' },
                    { value: maxSize, label: 'макс' },
                  ]}
                />
              </div>
              <Typography className="wheel-controls-tip hint">делит дорогие лоты на несколько позиций.</Typography>
              <div className="wheel-controls-row">
                <Typography>Финал с перчинкой</Typography>
                <Switch onChange={handleIsRandomPaceChange} />
              </div>
              {isRandomPace && (
                <PaceSettings paceConfig={paceConfig} setPaceConfig={setPaceConfig} spinTime={spinTime} />
              )}
              <div className="wheel-controls-row" style={{ marginTop: 10 }}>
                <SlotsPresetInput buttonTitle="Импорт в колесо" onChange={handleCustomWheel} hint={presetHint} />
              </div>
            </div>
            <div className="settings">
              <TwitchEmotesList setActiveEmote={handleEmoteChange} />
            </div>
          </div>
          {wheelFormat === WheelFormat.BattleRoyal && (
            <ResizableBracket onGamesOrder={setGamesOrder} currentGame={selectedGame} slots={rawItemsBase} />
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default WheelPage;
