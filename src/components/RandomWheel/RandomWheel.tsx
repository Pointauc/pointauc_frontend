import { ChangeEvent, Key, ReactElement, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Slider,
  TextField,
  Typography,
} from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import { useDispatch } from 'react-redux';
// @ts-ignore
import { Emote } from '@kozjar/twitch-emoticons';
import { useTranslation } from 'react-i18next';

import { PACE_PRESETS, WheelFormat } from '@constants/wheel.ts';
import { RandomPaceConfig } from '@services/SpinPaceService.ts';
import { WheelItem } from '@models/wheel.model.ts';
import { getCookie, getRandomIntInclusive, getTotalSize, getWheelColor } from '@utils/common.utils.ts';
import { getRandomNumber } from '@api/randomApi.ts';
import { slotToWheel } from '@utils/slots.utils.ts';
import { Slot } from '@models/slot.model.ts';
import { setSlots } from '@reducers/Slots/Slots.ts';
import { Game } from '@components/Bracket/components/model';
import withLoading from '@decorators/withLoading';
import LoadingButton from '@components/LoadingButton/LoadingButton';
import RadioButtonGroup, { Option } from '@components/RadioButtonGroup/RadioButtonGroup';
import SlotsPresetInput from '@components/Form/SlotsPresetInput/SlotsPresetInput';
import TwitchEmotesList from '@components/TwitchEmotesList/TwitchEmotesList';
import ImageLinkInput from '@components/Form/ImageLinkInput/ImageLinkInput';
import PredictionService, { getSlotFromDistance } from '@services/PredictionService.ts';
import BaseWheel, { DropoutVariant, WheelController } from '@components/BaseWheel/BaseWheel.tsx';
import NewDropoutDescription from '@components/RandomWheel/NewDropoutDescription/NewDropoutDescription.tsx';

import DropoutWheelProof from './DropoutWheelProof/DropoutWheelProof';
import ResizableBracket from './ResizableBracket/ResizableBracket';
import DuelWheelProof from './DuelWheelProof/DuelWheelProof';

import './RandomWheel.scss';

export interface SettingElements {
  mode: boolean;
  split: boolean;
  randomPace: boolean;
  randomOrg: boolean;
  import: boolean;
}

const initialAvailableSettings: SettingElements = {
  mode: true,
  split: true,
  randomPace: true,
  randomOrg: true,
  import: true,
};

interface RandomWheelProps<TWheelItem extends WheelItem = WheelItem> {
  items: TWheelItem[];
  deleteItem?: (id: Key) => void;
  initialSpinTime?: number;
  onWin?: (winner: TWheelItem) => void;
  isShuffle?: boolean;
  elements?: Partial<SettingElements>;
  children?: ReactNode;
  hideDeleteItem?: boolean;
}

// ToDo: refactor
const RandomWheel = <TWheelItem extends WheelItem = WheelItem>({
  items,
  deleteItem,
  onWin,
  initialSpinTime = 20,
  isShuffle = true,
  elements: elementsFromProps,
  children,
  hideDeleteItem,
}: RandomWheelProps<TWheelItem>): ReactElement => {
  const elements = useMemo(() => ({ ...initialAvailableSettings, ...elementsFromProps }), [elementsFromProps]);

  const [activeEmote, setActiveEmote] = useState<string | undefined | null>(localStorage.getItem('wheelEmote'));
  const [spinTime, setSpinTime] = useState<number>(initialSpinTime);
  const [rawItems, setRawItems] = useState<TWheelItem[]>(items);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [isLoadingSeed, setIsLoadingSeed] = useState<boolean>(false);
  const [useRandomOrg, setUseRandomOrg] = useState<boolean>(false);
  const [isRandomPace, setIsRandomPace] = useState<boolean>(false);
  const [wheelFormat, setWheelFormat] = useState<Key>(WheelFormat.Default);
  const [paceConfig, setPaceConfig] = useState<RandomPaceConfig>(PACE_PRESETS.suddenFinal);
  const [gamesOrder, setGamesOrder] = useState<Game[]>([]);
  const [nextWinner, setNextWinner] = useState<WheelItem | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null | undefined>(null);
  const [isDuelHelpOpen, setIsDuelHelpOpen] = useState<boolean>(false);
  const [isDropoutProofOpen, setIsDropoutProofOpen] = useState<boolean>(false);
  const [maxDepth, setMaxDepth] = useState<number>();
  const [depthRestrict, setDepthRestrict] = useState<number>();
  const [dropoutVariant, setDropoutVariant] = useState<DropoutVariant>(DropoutVariant.New);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const wheelController = useRef<WheelController | null>(null);

  const isNewDropout = useMemo(
    () => wheelFormat === WheelFormat.Dropout && dropoutVariant === DropoutVariant.New,
    [wheelFormat, dropoutVariant],
  );

  const isClassicDropout = useMemo(
    () => wheelFormat === WheelFormat.Dropout && dropoutVariant === DropoutVariant.Classic,
    [wheelFormat, dropoutVariant],
  );

  const initBattleRoyale = useCallback((games: Game[]) => {
    setGamesOrder((prevGames) => {
      if (!prevGames.length) {
        setMaxDepth(games[0]?.level);
        setDepthRestrict(games[0]?.level);
      }
      return games;
    });
  }, []);

  const resetWheel = useCallback(() => {
    setRawItems(items);
    wheelController.current?.clearWinner();
  }, [items]);

  const handleWheelFormatChange = useCallback(
    (format: WheelFormat) => {
      resetWheel();
      setGamesOrder([]);
      setMaxDepth(undefined);
      setDepthRestrict(undefined);
      setWheelFormat(format);

      if (format === WheelFormat.Dropout && !getCookie('seenDropoutProof2')) {
        setIsDropoutProofOpen(true);
      }
    },
    [resetWheel],
  );

  const onDelete = (id: Key): void => {
    if (deleteItem) {
      deleteItem(id);
    }
    setRawItems((prevItems) => prevItems.filter(({ id: _id }) => _id !== id));
  };

  const currentDuel = useMemo(() => {
    if (!gamesOrder.length) {
      return [];
    }
    return gamesOrder[0].sides;
  }, [gamesOrder]);

  const duelItems = useMemo(
    () => currentDuel.map<TWheelItem>(({ name, amount, id }) => ({ name, amount, id, color: getWheelColor() }) as any),
    [currentDuel],
  );

  const filteredItems = useMemo(
    () =>
      getTotalSize(rawItems)
        ? rawItems.filter(({ amount }) => amount)
        : rawItems.map((item) => ({ ...item, amount: 1 })),
    [rawItems],
  );

  const currentItems = useMemo(
    () => (wheelFormat === WheelFormat.BattleRoyal ? duelItems : filteredItems),
    [duelItems, filteredItems, wheelFormat],
  );
  const totalSize = useMemo(() => getTotalSize(currentItems), [currentItems]);

  const handleEmoteChange = useCallback((emote: string) => {
    localStorage.setItem('wheelEmote', emote);
    setActiveEmote(emote);
  }, []);

  const maxSize = useMemo(() => Math.max(...currentItems.map<number>(({ amount }) => Number(amount))), [currentItems]);
  const [maxValidValue, setMaxValidValue] = useState<number>(maxSize);

  const normalizedMaxValue = useMemo(
    () => (wheelFormat === WheelFormat.Dropout ? maxSize : maxValidValue),
    [maxSize, maxValidValue, wheelFormat],
  );

  const splittedItems = useMemo(
    () =>
      currentItems.reduce<TWheelItem[]>((acc, item) => {
        const { amount } = item;
        const part = Number(amount) / normalizedMaxValue;

        if (part > 1) {
          return [
            ...acc,
            ...new Array<TWheelItem>(Math.ceil(part)).fill({ ...item, amount: Number(amount) / Math.ceil(part) }),
          ];
        }

        return [...acc, { ...item, amount }];
      }, []),
    [normalizedMaxValue, currentItems],
  );

  const finalItems = useMemo(() => {
    const invertClassic = (items: TWheelItem[]): TWheelItem[] => {
      const total = items.reduce((acc, { amount }) => acc + amount, 0);

      return items.map((item) => ({
        ...item,
        amount: PredictionService.getReverseSize(item.amount, total, items.length),
      }));
    };

    const invertNew = (items: TWheelItem[]): TWheelItem[] => {
      const total = 1 / items.reduce((acc, { amount }) => acc + 1 / amount, 0);

      return items.map((item) => ({ ...item, amount: total / item.amount }));
    };

    if (wheelFormat === WheelFormat.Dropout) {
      return dropoutVariant === DropoutVariant.New ? invertNew(splittedItems) : invertClassic(splittedItems);
    }

    return splittedItems;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [splittedItems.length, currentItems, wheelFormat, dropoutVariant]);

  const handleWin = useCallback(
    (winner: TWheelItem) => {
      setIsSpinning(false);
      setNextWinner(winner);
      setSelectedGame(null);

      if (wheelFormat === WheelFormat.Dropout) {
        setRawItems((prevItems) => {
          return prevItems.filter(({ id }) => id !== winner.id);
        });
      }

      if (wheelFormat === WheelFormat.BattleRoyal) {
        const game = gamesOrder[0];
        game.winner = game.sides.findIndex(({ id }) => winner.id === id);
        if (game.parentSide) {
          game.parentSide.id = winner.id;
          game.parentSide.name = winner.name;
        }
        const parentTitle = document.getElementById(`${game.parentSide?.gameId}${game.parentSide?.side}`);

        if (parentTitle) {
          parentTitle.innerHTML = winner.name;
        }
      }

      onWin?.(winner);
    },
    [gamesOrder, onWin, wheelFormat],
  );

  const handleCustomWheel = useCallback(
    (customItems: Slot[], saveSlots: boolean) => {
      setRawItems(customItems.map(slotToWheel) as any);

      if (saveSlots) {
        dispatch(setSlots(customItems));
      }
    },
    [dispatch],
  );

  const nextTurn = useCallback(() => {
    wheelController.current?.clearWinner();
    wheelController.current?.reset();
    setNextWinner(null);
    setGamesOrder((prev) => prev.slice(1));
    setSelectedGame(gamesOrder && gamesOrder[0]);
  }, [gamesOrder]);

  const dropoutQueueRef = useRef<Key[]>([]);
  useEffect(() => {
    if (isNewDropout) {
      const remainingSlots = getTotalSize(items)
        ? items.filter(({ amount }) => amount)
        : items.map((item) => ({ ...item, amount: 1 }));
      const dropoutQueue = [];

      while (remainingSlots.length > 0) {
        const winnerIndex = getSlotFromDistance(remainingSlots, Math.random());
        dropoutQueue.push(remainingSlots[winnerIndex].id);
        remainingSlots.splice(winnerIndex, 1);
      }

      dropoutQueueRef.current = dropoutQueue.reverse();
    }
  }, [isNewDropout, items]);

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

    seed = seed && seed / size;
    const winner = isNewDropout ? (dropoutQueueRef.current.shift() as string) : undefined;

    wheelController.current?.spin({ winner, seed, paceConfig: isRandomPace ? paceConfig : undefined });
  }, [isNewDropout, isRandomPace, paceConfig, totalSize, useRandomOrg]);

  const handleSpinTimeChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSpinTime(e.target.value.length ? Number(e.target.value) : NaN);
  }, []);

  const randomizeTimer = useCallback(() => {
    setSpinTime(Math.round(Math.random() * 200)); // 200 - max possible number
  }, []);

  const handleDepthRestrictChange = useCallback((e: any, value: number | number[]) => {
    setDepthRestrict(Number(value));
  }, []);

  const handleMaxValueChange = useCallback((e: any, value: number | number[]) => {
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

  const handleUseRandomOrg = useCallback((e: any, checked: boolean) => {
    setUseRandomOrg(checked);
  }, []);

  const toggleHelp = useCallback(() => {
    setIsDuelHelpOpen((prev) => !prev);
  }, []);

  const toggleDropoutProof = useCallback(() => {
    setIsDropoutProofOpen((prev) => !prev);
    document.cookie = 'seenDropoutProof2=true; expires=Fri, 31 Dec 9999 23:59:59 GMT';
  }, []);

  const getRandomEmote = useCallback((emotes: Emote[]): string => {
    const index = getRandomIntInclusive(0, emotes.length - 1);
    const { max = 2 } = emotes[index] as any;

    return emotes[index].toLink(max);
  }, []);

  const handleEmotesLoad = useCallback(
    (emotes: Emote[]) => {
      if (emotes.length) {
        setActiveEmote((emote) => emote || getRandomEmote(emotes));
      }
    },
    [getRandomEmote],
  );

  useEffect(() => {
    if (wheelFormat === WheelFormat.BattleRoyal) {
      setSelectedGame(gamesOrder && gamesOrder[0]);
    }
  }, [gamesOrder, wheelFormat]);

  const wheelOptions: Option<WheelFormat>[] = useMemo(
    () => [
      { key: WheelFormat.Default, label: t('wheel.format.normal') },
      { key: WheelFormat.Dropout, label: t('wheel.format.dropout') },
      { key: WheelFormat.BattleRoyal, label: t('wheel.format.battleRoyal') },
    ],
    [t],
  );

  const dropoutVariantOptions: Option<DropoutVariant>[] = useMemo(
    () => [
      { key: DropoutVariant.New, label: t('wheel.dropoutVariant.new') },
      { key: DropoutVariant.Classic, label: t('wheel.dropoutVariant.classic') },
    ],
    [t],
  );

  return (
    <div className='wheel-content'>
      <BaseWheel
        controller={wheelController}
        onWin={handleWin}
        background={activeEmote || 'https://cdn.7tv.app/emote/60db33899a9fbb6acd26b151/4x'}
        spinTime={Number.isNaN(spinTime) ? 0 : spinTime}
        deleteItem={hideDeleteItem ? undefined : onDelete}
        isShuffle={isShuffle}
        items={finalItems}
        resetWheel={wheelFormat === WheelFormat.Dropout && dropoutVariant === DropoutVariant.New}
      />
      <div className='wheel-info-wrapper'>
        <div className={classNames('wheel-controls', { shrink: wheelFormat === WheelFormat.BattleRoyal })}>
          <div className='settings'>
            <div className='wheel-controls-row'>
              {wheelFormat === WheelFormat.BattleRoyal && nextWinner ? (
                <Button className='wheel-controls-button' variant='contained' color='primary' onClick={nextTurn}>
                  {t('wheel.nextDuel')}
                </Button>
              ) : (
                <LoadingButton
                  isLoading={isLoadingSeed}
                  disabled={isSpinning || isLoadingSeed}
                  className='wheel-controls-button'
                  variant='contained'
                  color='primary'
                  onClick={handleSpin}
                >
                  {isSpinning ? t('wheel.spinning') : t('wheel.spin')}
                </LoadingButton>
              )}
              <TextField
                className='wheel-controls-input'
                variant='outlined'
                margin='dense'
                label={t('wheel.duration')}
                onChange={handleSpinTimeChange}
                value={Number.isNaN(spinTime) ? '' : spinTime}
                InputProps={{endAdornment: 
                  <IconButton color="primary" aria-label="random timer" onClick={randomizeTimer}>
                    <CasinoIcon />
                  </IconButton>}}
              />
              <Typography className='wheel-controls-tip'>с.</Typography>
            </div>
            {elements.mode && (
              <RadioButtonGroup
                style={{ marginTop: 10 }}
                fullWidth
                options={wheelOptions}
                activeKey={wheelFormat}
                onChangeActive={handleWheelFormatChange}
                disabled={isSpinning}
              />
            )}
            {wheelFormat === WheelFormat.Dropout && (
              <RadioButtonGroup
                style={{ marginTop: 10 }}
                fullWidth
                options={dropoutVariantOptions}
                activeKey={dropoutVariant}
                onChangeActive={setDropoutVariant}
                disabled={isSpinning}
              />
            )}
            {wheelFormat === WheelFormat.BattleRoyal && (
              <>
                <Dialog
                  open={isDuelHelpOpen}
                  onClose={toggleHelp}
                  className='description-dialog'
                  maxWidth='sm'
                  fullWidth
                >
                  <DialogTitle>Описание дуэльного режима</DialogTitle>
                  <DialogContent dividers className='description-dialog-content'>
                    <DuelWheelProof />
                  </DialogContent>
                </Dialog>
                <button onClick={toggleHelp} type='button' className='description-link'>
                  {t('wheel.howItWorks')}
                </button>
                <div className='wheel-controls-row'>
                  <Typography className='wheel-controls-tip md'>{t('wheel.nesting')}</Typography>
                  <Slider
                    step={1}
                    min={1}
                    max={maxDepth}
                    valueLabelDisplay='auto'
                    onChange={handleDepthRestrictChange}
                    value={depthRestrict || 1}
                    marks={[
                      { value: maxDepth || 1, label: maxDepth },
                      { value: 1, label: '1' },
                    ]}
                  />
                </div>
                <Typography className='wheel-controls-tip hint'>{t('wheel.nestingDesc')}</Typography>
              </>
            )}
            {isNewDropout && <NewDropoutDescription />}
            {isClassicDropout && (
              <>
                <Dialog
                  open={isDropoutProofOpen}
                  onClose={toggleDropoutProof}
                  className='description-dialog dropout'
                  maxWidth='md'
                  fullWidth
                >
                  <DialogTitle>{t('wheel.dropoutProof')}</DialogTitle>
                  <DialogContent dividers className='description-content-dropout'>
                    <DropoutWheelProof />
                  </DialogContent>
                </Dialog>

                <button onClick={toggleDropoutProof} type='button' className='description-link'>
                  {t('wheel.readBeforeUsage')}
                </button>
              </>
            )}
            {wheelFormat === WheelFormat.Dropout && (
              <Typography style={{ marginTop: 10 }}>{`${t('common.left')}: ${filteredItems.length}`}</Typography>
            )}
            {elements.split && (
              <>
                {!!totalSize && wheelFormat !== WheelFormat.Dropout && (
                  <div className='wheel-controls-row'>
                    <Typography className='wheel-controls-tip md'>{t('wheel.dividing')}</Typography>
                    <Slider
                      step={1}
                      min={maxSize / 10}
                      max={maxSize}
                      valueLabelDisplay='auto'
                      onChange={handleMaxValueChange}
                      value={normalizedMaxValue}
                      marks={[
                        { value: maxSize / 10, label: `${t('common.max')} / 10` },
                        { value: maxSize, label: t('common.max') },
                      ]}
                    />
                  </div>
                )}
                <Typography className='wheel-controls-tip hint'>{t('wheel.dividingDesc')}</Typography>
              </>
            )}
            {/*{elements.randomPace && (*/}
            {/*  <>*/}
            {/*    <div className='wheel-controls-row'>*/}
            {/*      <Typography>{t('wheel.spicyFinal')}</Typography>*/}
            {/*      <Switch onChange={handleIsRandomPaceChange} />*/}
            {/*    </div>*/}
            {/*    {isRandomPace && (*/}
            {/*      <PaceSettings paceConfig={paceConfig} setPaceConfig={setPaceConfig} spinTime={spinTime} />*/}
            {/*    )}*/}
            {/*  </>*/}
            {/*)}*/}
            {elements.randomOrg && (
              <FormControlLabel
                control={<Checkbox checked={useRandomOrg} onChange={handleUseRandomOrg} color='primary' />}
                label={t('wheel.useRandomOrg')}
                className='wheel-controls-checkbox'
              />
            )}
            {elements.import && (
              <div className='wheel-controls-row' style={{ marginTop: 10 }}>
                <SlotsPresetInput
                  buttonTitle={t('wheel.importToWheel')}
                  onChange={handleCustomWheel}
                  hint={presetHint}
                />
              </div>
            )}
            <div>{children}</div>
          </div>
          <div className='settings' style={{ width: 325 }}>
            <TwitchEmotesList setActiveEmote={handleEmoteChange} onEmotesLoad={handleEmotesLoad} />
            <ImageLinkInput
              buttonTitle={t('wheel.loadCustomMessage')}
              buttonClass='upload-wheel-image'
              onChange={handleEmoteChange}
            />
          </div>
        </div>
        {wheelFormat === WheelFormat.BattleRoyal && (
          <ResizableBracket
            onGamesOrder={initBattleRoyale}
            currentGame={selectedGame}
            items={filteredItems}
            maxDepth={depthRestrict}
          />
        )}
      </div>
    </div>
  );
};

export default RandomWheel;
