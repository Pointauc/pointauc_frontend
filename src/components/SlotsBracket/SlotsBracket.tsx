import React, { FC, Key, useEffect, useState } from 'react';
import Bracket from '../Bracket/components/Bracket';
import { Game } from '../Bracket/components/model';
import { createGame, setOffsets } from '../../utils/slots.utils';
import { WheelItem } from '../../models/wheel.model';

export interface SlotsBracketProps {
  value?: number;
  maxGroupAmount?: number | null;
  onGamesOrder: (games: Game[]) => void;
  currentGame: Key;
  items: WheelItem[];
}

const SlotsBracket: FC<SlotsBracketProps> = ({ onGamesOrder, currentGame, items, maxGroupAmount }) => {
  const [game, setGame] = useState<Game | null>(null);

  useEffect(() => {
    const gameOrder: Game[] = [];

    if (items.length < 2) {
      return;
    }

    const data = items.filter(({ amount }) => amount).reverse();
    const createdGame = createGame(data, 0, gameOrder, undefined, maxGroupAmount);

    if (createdGame) {
      const gameData = setOffsets(createdGame);
      setGame(gameData);
    }

    onGamesOrder(gameOrder);
  }, [onGamesOrder, items, maxGroupAmount]);

  if (!game) {
    return null;
  }

  return <Bracket game={game} currentGame={currentGame} />;
};

export default React.memo(SlotsBracket);
