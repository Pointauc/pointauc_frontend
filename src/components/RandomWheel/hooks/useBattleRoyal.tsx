import React, { ReactNode, RefObject, useCallback, useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { WheelItem } from '@models/wheel.model.ts';
import ResizableBracket from '@components/RandomWheel/ResizableBracket/ResizableBracket.tsx';
import { WheelController } from '@components/BaseWheel/BaseWheel.tsx';
import { getWheelColor } from '@utils/common.utils.ts';
import DuelDescription from '@components/RandomWheel/WheelSettings/fields/DuelDescription.tsx';
import Nesting from '@components/RandomWheel/WheelSettings/fields/Nesting.tsx';
import { buildGame } from '@components/SlotsBracket/SlotsBracket.tsx';
import useInitWrapper from '@components/RandomWheel/hooks/useInitWrapper.ts';

const useBattleRoyal = (controller: RefObject<WheelController>): Wheel.FormatHook => {
  const { t } = useTranslation();
  const { setValue } = useFormContext<Wheel.Settings>();
  const [_items, setItems] = useState<WheelItem[] | undefined>();
  const items = useMemo(() => _items || [], [_items]);

  const [step, setStep] = useState<number>(0);
  const [nextWinner, setNextWinner] = useState<WheelItem | null>(null);
  const [maxDepth, setMaxDepth] = useState<number>();

  const depthRestriction = useWatch<Wheel.Settings>({ name: 'depthRestriction' });

  const initInternal = useCallback(
    (items: WheelItem[]) => {
      setItems(items);
      const game = buildGame(items);
      const depth = Math.max(...game.gameOrder.map(({ level }) => level));
      setMaxDepth(depth);
      setValue('depthRestriction', depth);
    },
    [setValue],
  );
  const { init } = useInitWrapper(initInternal);

  const { game, gameOrder } = useMemo(() => buildGame(items, depthRestriction), [depthRestriction, items]);
  const selectedGame = useMemo(() => gameOrder[step], [gameOrder, step]);
  const content = <ResizableBracket rootGame={game} currentGame={selectedGame} />;

  const nextTurn = useCallback(() => {
    controller.current?.clearWinner();
    controller.current?.resetPosition();
    setNextWinner(null);
    setStep(step + 1);
  }, [controller, step]);

  const renderSubmitButton = (defaultButton: ReactNode) =>
    nextWinner ? (
      <Button className='wheel-controls-button' variant='contained' color='primary' onClick={nextTurn}>
        {t('wheel.nextDuel')}
      </Button>
    ) : (
      defaultButton
    );

  const onSpinEnd = useCallback(
    (winner: WheelItem) => {
      setNextWinner(winner);

      const game = gameOrder[step];
      game.winner = game.sides.findIndex(({ id }) => winner.id === id);
      if (game.parentSide) {
        game.parentSide.id = winner.id;
        game.parentSide.name = winner.name;
      }
      const parentTitle = document.getElementById(`${game.parentSide?.gameId}${game.parentSide?.side}`);
      const winnerBg = document.getElementById(`${game.id}${game.winner}-bg`);

      if (winnerBg) {
        winnerBg.style.fill = '#ff7324';
      }
      if (parentTitle) {
        parentTitle.innerHTML = winner.name;
      }
    },
    [gameOrder, step],
  );

  const duelItems = useMemo(() => {
    const duel = gameOrder[step]?.sides ?? [];
    return duel.map<WheelItem>(({ name, amount, id }) => ({ name, amount, id, color: getWheelColor() }));
  }, [gameOrder, step]);

  const extraSettings = (
    <>
      <DuelDescription />
      <Nesting maxDepth={maxDepth} />
    </>
  );

  return {
    items: duelItems,
    init,
    content,
    renderSubmitButton,
    onSpinEnd,
    extraSettings,
  };
};

export default useBattleRoyal;
