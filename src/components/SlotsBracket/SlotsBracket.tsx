import React, { FC, Key, useEffect, useState } from 'react';
import Bracket from '../Bracket/components/Bracket';
import { Game } from '../Bracket/components/model';
import { createGame, setOffsets } from '../../utils/slots.utils';
import { WheelItem } from '../../models/wheel.model';

export interface SlotsBracketProps {
  value?: number;
  onGamesOrder: (games: Game[]) => void;
  currentGame: Key;
  items: WheelItem[];
}

const SlotsBracket: FC<SlotsBracketProps> = ({ onGamesOrder, currentGame, items }) => {
  const [game, setGame] = useState<Game | null>(null);

  useEffect(() => {
    const gameOrder: Game[] = [];

    if (items.length < 2) {
      return;
    }

    const createdGame = createGame(
      items.filter(({ amount }) => amount),
      0,
      gameOrder,
    );

    if (createdGame) {
      const gameData = setOffsets(createdGame);
      setGame(gameData);
    }

    onGamesOrder(gameOrder);
  }, [onGamesOrder, items]);

  if (!game) {
    return null;
  }

  return <Bracket game={game} currentGame={currentGame} />;
};

export default React.memo(SlotsBracket);
