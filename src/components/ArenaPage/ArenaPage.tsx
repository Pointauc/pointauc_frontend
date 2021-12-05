import React, { FC, Key, useCallback, useEffect, useRef, useState } from 'react';
import './ArenaPage.scss';
import { useSelector } from 'react-redux';
import { Button, Typography } from '@material-ui/core';
import ResizeObserver from 'resize-observer-polyfill';
import ArenaSideBlock, { Sides } from './ArenaSideBlock/ArenaSideBlock';
import { RootState } from '../../reducers';
import ArenaSlotsChart from './ArenaSlotsChart/ArenaSlotsChart';
import matchSelectorService from '../../services/MatchSelectorService';
import { GladType } from '../../models/Arena/Glad';
import { getTotal } from '../../utils/common.utils';
import GameController from '../../services/Arena/GameController';
import GladView from '../../services/Arena/GladView';
import ArenaGladsPreview from './ArenaGladsPreview/ArenaGladsPreview';
import RadioButtonGroup, { Option } from '../RadioButtonGroup/RadioButtonGroup';

const speedOptions: Option<number>[] = [
  { key: 1, value: 'x1' },
  { key: 1.5, value: 'x1.5' },
  { key: 2, value: 'x2' },
];

const ArenaPage: FC = () => {
  const { slots } = useSelector((root: RootState) => root.slots);
  const [gameSpeed, setGameSpeed] = useState<number>(1);
  const [battleDisabled, setBattleDisabled] = useState<boolean>(false);
  const [gladsMap] = useState<Map<Key, GladType>>(new Map());

  const [restGlads, setRestGlads] = useState<GladType[]>([]);
  const [candidates, setCandidates] = useState<GladType[]>([]);
  const [selectedGlads, setSelectedGlads] = useState<GladType[]>([]);

  const pageContainerRef = useRef<HTMLDivElement>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameController = useRef<GameController | undefined>();

  const updateCandidates = useCallback((glads: GladType[]) => {
    setCandidates(matchSelectorService.selectLast(glads, 2));
  }, []);

  useEffect(() => {
    const onResize = (): void => {
      const { width = 0, height = 0 } = gameContainerRef.current?.getBoundingClientRect() || {};
      gameController.current?.resize(width, height);
    };
    const observer = new ResizeObserver(onResize);

    if (gameContainerRef.current) {
      observer.observe(gameContainerRef.current);
    }

    return (): void => {
      return observer.disconnect();
    };
  }, [gameContainerRef]);

  const setupEngine = useCallback((): void => {
    if (pageContainerRef.current && gameContainerRef.current) {
      const initialGlads = slots.map((slot) => {
        const glad = new GladView(slot);
        gladsMap.set(glad.id, glad);
        return glad;
      });

      gameController.current = new GameController(gameContainerRef.current);
      setRestGlads(initialGlads);
      updateCandidates(initialGlads);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateCandidates]);

  useEffect(() => {
    setupEngine();
  }, [setupEngine]);

  const startRound = async (): Promise<void> => {
    if (gameController.current) {
      setBattleDisabled(true);
      const winner = await gameController.current.makeBattle(candidates);
      const reward = getTotal(candidates, ({ stat }) => stat);

      candidates.forEach((glad) => {
        if (glad === winner) {
          glad.distributesStats(reward);
          glad.reset();
        } else {
          gladsMap.delete(glad.id);
        }
      });

      const updatedGlads = Array.from(gladsMap.values()).sort(({ stat: a }, { stat: b }) => Number(b) - Number(a));

      setRestGlads(updatedGlads);
      updateCandidates(updatedGlads);
      setBattleDisabled(false);
    }
  };

  const onGameSpeedChange = (speed: number): void => {
    setGameSpeed(speed);

    gameController.current?.setSpeed(speed);
  };

  return (
    <div className="arena-container" ref={pageContainerRef}>
      <div className="game-container" ref={gameContainerRef} />
      <ArenaSideBlock side={Sides.left}>
        <ArenaSlotsChart
          glads={restGlads}
          candidates={candidates}
          selectedGlads={selectedGlads}
          setSelectedGlads={setSelectedGlads}
        />
      </ArenaSideBlock>
      <div className="arena-controls">
        <Button className="start-battle-btn" onClick={startRound} disabled={battleDisabled}>
          Битва
        </Button>
        <div className="speed-controls">
          <Typography>Скорость боя: </Typography>
          <RadioButtonGroup options={speedOptions} activeKey={gameSpeed} onChangeActive={onGameSpeedChange} />
        </div>
      </div>
      <ArenaSideBlock side={Sides.right}>
        <ArenaGladsPreview allGlads={restGlads} selectedGlads={selectedGlads} candidates={candidates} />
      </ArenaSideBlock>
    </div>
  );
};

export default ArenaPage;