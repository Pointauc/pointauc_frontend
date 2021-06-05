import React, { FC, Key, useEffect, useState } from 'react';
import Bracket from '../Bracket/components/Bracket';
import { Game } from '../Bracket/components/model';
import { createGame, setOffsets } from '../../utils/slots.utils';
import { Slot } from '../../models/slot.model';

interface SlotsBracketProps {
  value?: number;
  onGamesOrder: (games: Game[]) => void;
  currentGame: Key;
  slots: Slot[];
}

const SlotsBracket: FC<SlotsBracketProps> = ({ onGamesOrder, currentGame, slots }) => {
  const [game, setGame] = useState<Game | null>(null);

  useEffect(() => {
    const gameOrder: Game[] = [];
    const createdGame = createGame(
      slots.filter(({ amount }) => amount),
      0,
      gameOrder,
    );

    if (createdGame) {
      const gameData = setOffsets(createdGame);
      setGame(gameData);
    }

    onGamesOrder(gameOrder);
  }, [onGamesOrder, slots]);

  if (!game) {
    return null;
  }

  return <Bracket game={game} currentGame={currentGame} />;
};

export default SlotsBracket;
