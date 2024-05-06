import { FC, Key, useEffect, useRef, useState, memo } from 'react';

import Bracket from '@components/Bracket/components/Bracket';
import { Game } from '@components/Bracket/components/model';
import { createGame, setOffsets } from '@utils/slots.utils.ts';
import { WheelItem } from '@models/wheel.model.ts';

export interface SlotsBracketProps {
  currentGame: Key;
  rootGame: Game;
}

export interface BuildGameResult {
  game: Game | null;
  gameOrder: Game[];
}

export const buildGame = (items: WheelItem[], maxDepth?: number): BuildGameResult => {
  const gameOrder: Game[] = [];

  if (items.length < 2) {
    return { game: null, gameOrder };
  }

  const data = items.filter(({ amount }) => amount);
  const createdGame = createGame(data, 0, gameOrder, undefined, maxDepth);

  return { game: createdGame && setOffsets(createdGame), gameOrder };
};

const SlotsBracket: FC<SlotsBracketProps> = ({ currentGame, rootGame }) => {
  return <Bracket rootGame={rootGame} currentGame={currentGame} />;
};

const SlotsBracketMemorized = memo(SlotsBracket);

export default SlotsBracketMemorized;
