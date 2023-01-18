import React, { ChangeEvent, Key, ReactElement, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
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
import { useDispatch } from 'react-redux';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { Emote } from '@kozjar/twitch-emoticons';
import { useTranslation } from 'react-i18next';
import { PACE_PRESETS, WHEEL_OPTIONS, WheelFormat } from '../../constants/wheel';
import { RandomPaceConfig } from '../../services/SpinPaceService';
import { Game } from '../Bracket/components/model';
import { WheelItem } from '../../models/wheel.model';
import { getCookie, getRandomIntInclusive, getTotalSize, getWheelColor } from '../../utils/common.utils';
import useWheel from '../../hooks/useWheel';
import withLoading from '../../decorators/withLoading';
import { getRandomNumber } from '../../api/randomApi';
import LoadingButton from '../LoadingButton/LoadingButton';
import RadioButtonGroup from '../RadioButtonGroup/RadioButtonGroup';
import DropoutWheelProof from './DropoutWheelProof/DropoutWheelProof';
import PaceSettings from './PaceSettings/PaceSettings';
import SlotsPresetInput from '../Form/SlotsPresetInput/SlotsPresetInput';
import TwitchEmotesList from '../TwitchEmotesList/TwitchEmotesList';
import ResizableBracket from './ResizableBracket/ResizableBracket';
import DuelWheelProof from './DuelWheelProof/DuelWheelProof';
import './RandomWheel.scss';
import ImageLinkInput from '../Form/ImageLinkInput/ImageLinkInput';
import { slotToWheel } from '../../utils/slots.utils';
import { Slot } from '../../models/slot.model';
import { setSlots } from '../../reducers/Slots/Slots';

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

interface RandomWheelProps<TWheelItem extends WheelItem> {
  items: TWheelItem[];
  deleteItem?: (id: Key) => void;
  initialSpinTime?: number;
  onWin?: (winner: TWheelItem) => void;
  isShuffle?: boolean;
  elements?: Partial<SettingElements>;
  children?: ReactNode;
  hideDeleteItem?: boolean;
}

const RandomWheel = <TWheelItem extends WheelItem>({
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
  const [rawItems, setRawItems] = useState<WheelItem[]>(items);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [isLoadingSeed, setIsLoadingSeed] = useState<boolean>(false);
  const [useRandomOrg, setUseRandomOrg] = useState<boolean>(elements.randomOrg);
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
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const initBattleRoyale = useCallback((games: Game[]) => {
    setGamesOrder((prevGames) => {
      if (!prevGames.length) {
        setMaxDepth(games[0]?.level);
        setDepthRestrict(games[0]?.level);
      }
      return games;
    });
  }, []);

  const handleWheelFormatChange = useCallback((format: WheelFormat) => {
    setGamesOrder([]);
    setMaxDepth(undefined);
    setDepthRestrict(undefined);
    setWheelFormat(format);

    if (format === WheelFormat.Dropout && !getCookie('seenDropoutProof')) {
      setIsDropoutProofOpen(true);
    }
  }, []);

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
    () => currentDuel.map<WheelItem>(({ name, amount, id }) => ({ name, amount, id, color: getWheelColor() })),
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

  const splittedItems = useMemo(
    () =>
      currentItems.reduce<WheelItem[]>((acc, { amount, ...item }) => {
        const part = Number(amount) / maxValidValue;

        if (part > 1) {
          return [
            ...acc,
            ...new Array<WheelItem>(Math.ceil(part)).fill({ ...item, amount: Number(amount) / Math.ceil(part) }),
          ];
        }

        return [...acc, { ...item, amount }];
      }, []),
    [maxValidValue, currentItems],
  );

  const finalItems = useMemo(() => {
    return splittedItems;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [splittedItems.length, currentItems]);

  const handleWin = useCallback(
    (winner: TWheelItem) => {
      setIsSpinning(false);
      setNextWinner(winner);

      if (wheelFormat === WheelFormat.Dropout) {
        setRawItems((prevItems) => prevItems.filter(({ id }) => id !== winner.id));
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
        setSelectedGame(null);
      }

      onWin?.(winner);
    },
    [gamesOrder, onWin, wheelFormat],
  );

  const handleCustomWheel = useCallback(
    (customItems: Slot[], saveSlots: boolean) => {
      setRawItems(customItems.map(slotToWheel));

      if (saveSlots) {
        dispatch(setSlots(customItems));
      }
    },
    [dispatch],
  );

  const { wheelComponent, spin, clearWinner } = useWheel({
    rawItems: finalItems,
    onWin: handleWin as any,
    background: activeEmote || 'https://cdn.7tv.app/emote/60db33899a9fbb6acd26b151/4x',
    spinTime,
    dropout: wheelFormat === WheelFormat.Dropout,
    deleteItem: hideDeleteItem ? undefined : onDelete,
    isShuffle,
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

  const handleDepthRestrictChange = useCallback((e: ChangeEvent<{}>, value: number | number[]) => {
    setDepthRestrict(Number(value));
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

  const toggleDropoutProof = useCallback(() => {
    setIsDropoutProofOpen((prev) => !prev);
    document.cookie = 'seenDropoutProof=true; expires=Fri, 31 Dec 9999 23:59:59 GMT';
  }, []);

  const getRandomEmote = useCallback((emotes: Emote[]): string => {
    const index = getRandomIntInclusive(0, emotes.length - 1);
    const { max = 2 } = emotes[index] as any;

    return emotes[index].toLink(max);
  }, []);

  const handleEmotesLoad = useCallback(
    (emotes: Emote[]) => {
      setActiveEmote((emote) => emote || getRandomEmote(emotes));
    },
    [getRandomEmote],
  );

  useEffect(() => {
    if (wheelFormat === WheelFormat.BattleRoyal) {
      setSelectedGame(gamesOrder && gamesOrder[0]);
    }
  }, [gamesOrder, wheelFormat]);

  return (
    <div className="wheel-content">
      {wheelComponent}
      <div className="wheel-info-wrapper">
        <div className={classNames('wheel-controls', { shrink: wheelFormat === WheelFormat.BattleRoyal })}>
          <div className="settings">
            <div className="wheel-controls-row">
              {wheelFormat === WheelFormat.BattleRoyal && nextWinner ? (
                <Button className="wheel-controls-button" variant="contained" color="primary" onClick={nextTurn}>
                  {t('wheel.nextDuel')}
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
                  {isSpinning ? t('wheel.spinning') : t('wheel.spin')}
                </LoadingButton>
              )}
              <TextField
                className="wheel-controls-input"
                variant="outlined"
                margin="dense"
                label={t('wheel.duration')}
                onChange={handleSpinTimeChange}
                value={spinTime || ''}
              />
              <Typography className="wheel-controls-tip">с.</Typography>
            </div>
            {elements.mode && (
              <RadioButtonGroup
                style={{ marginTop: 10 }}
                options={WHEEL_OPTIONS}
                activeKey={wheelFormat}
                onChangeActive={handleWheelFormatChange}
              />
            )}
            {wheelFormat === WheelFormat.BattleRoyal && (
              <>
                <Dialog
                  open={isDuelHelpOpen}
                  onClose={toggleHelp}
                  className="description-dialog"
                  maxWidth="sm"
                  fullWidth
                >
                  <DialogTitle>Описание дуэльного режима</DialogTitle>
                  <DialogContent dividers className="description-dialog-content">
                    <DuelWheelProof />
                  </DialogContent>
                </Dialog>
                <button onClick={toggleHelp} type="button" className="description-link">
                  {t('wheel.howItWorks')}
                </button>
                <div className="wheel-controls-row">
                  <Typography className="wheel-controls-tip md">{t('wheel.nesting')}</Typography>
                  <Slider
                    step={1}
                    min={1}
                    max={maxDepth}
                    valueLabelDisplay="auto"
                    onChange={handleDepthRestrictChange}
                    value={depthRestrict || 1}
                    marks={[
                      { value: maxDepth || 1, label: maxDepth },
                      { value: 1, label: '1' },
                    ]}
                  />
                </div>
                <Typography className="wheel-controls-tip hint">{t('wheel.nestingDesc')}</Typography>
              </>
            )}
            <Dialog
              open={isDropoutProofOpen}
              onClose={toggleDropoutProof}
              className="description-dialog dropout"
              maxWidth="md"
              fullWidth
            >
              <DialogTitle>{t('wheel.dropoutProof')}</DialogTitle>
              <DialogContent dividers className="description-content-dropout">
                <DropoutWheelProof />
              </DialogContent>
            </Dialog>
            {wheelFormat === WheelFormat.Dropout && (
              <button onClick={toggleDropoutProof} type="button" className="description-link">
                {t('wheel.readBeforeUsage')}
              </button>
            )}
            {wheelFormat === WheelFormat.Dropout && (
              <Typography style={{ marginTop: 10 }}>{`${t('common.left')}: ${filteredItems.length}`}</Typography>
            )}
            {elements.split && (
              <>
                {!!totalSize && (
                  <div className="wheel-controls-row">
                    <Typography className="wheel-controls-tip md">{t('wheel.dividing')}</Typography>
                    <Slider
                      step={1}
                      min={maxSize / 10}
                      max={maxSize}
                      valueLabelDisplay="auto"
                      onChange={handleMaxValueChange}
                      value={maxValidValue}
                      marks={[
                        { value: maxSize / 10, label: `${t('common.max')} / 10` },
                        { value: maxSize, label: t('common.max') },
                      ]}
                    />
                  </div>
                )}
                <Typography className="wheel-controls-tip hint">{t('wheel.dividingDesc')}</Typography>
              </>
            )}
            {elements.randomPace && (
              <>
                <div className="wheel-controls-row">
                  <Typography>Финал с перчинкой</Typography>
                  <Switch onChange={handleIsRandomPaceChange} />
                </div>
                {isRandomPace && (
                  <PaceSettings paceConfig={paceConfig} setPaceConfig={setPaceConfig} spinTime={spinTime} />
                )}
              </>
            )}
            {elements.randomOrg && (
              <FormControlLabel
                control={<Checkbox checked={useRandomOrg} onChange={handleUseRandomOrg} color="primary" />}
                label={t('wheel.useRandomOrg')}
                className="wheel-controls-checkbox"
              />
            )}
            {elements.import && (
              <div className="wheel-controls-row" style={{ marginTop: 10 }}>
                <SlotsPresetInput
                  buttonTitle={t('wheel.importToWheel')}
                  onChange={handleCustomWheel}
                  hint={presetHint}
                />
              </div>
            )}
            <div>{children}</div>
          </div>
          <div className="settings" style={{ width: 325 }}>
            <TwitchEmotesList setActiveEmote={handleEmoteChange} onEmotesLoad={handleEmotesLoad} />
            <ImageLinkInput
              buttonTitle={t('wheel.loadCustomMessage')}
              buttonClass="upload-wheel-image"
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
