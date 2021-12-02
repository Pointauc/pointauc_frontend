import React, { FC, Key, useEffect, useRef, useState } from 'react';
import Bracket from '../Bracket/components/Bracket';
import { Game } from '../Bracket/components/model';
import { createGame, setOffsets } from '../../utils/slots.utils';
import { WheelItem } from '../../models/wheel.model';

export interface SlotsBracketProps {
  value?: number;
  maxDepth?: number;
  onGamesOrder: (games: Game[]) => void;
  currentGame: Key;
  items: WheelItem[];
}

const SlotsBracket: FC<SlotsBracketProps> = ({ onGamesOrder, currentGame, items, maxDepth }) => {
  const [game, setGame] = useState<Game | null>(null);
  const skipDepthChange = useRef<boolean>(true);

  useEffect(() => {
    const gameOrder: Game[] = [];

    if (maxDepth !== undefined && skipDepthChange.current) {
      skipDepthChange.current = false;
      return;
    }

    if (items.length < 2) {
      return;
    }

    const data = items.filter(({ amount }) => amount);
    const createdGame = createGame(data, 0, gameOrder, undefined, maxDepth);

    if (createdGame) {
      const gameData = setOffsets(createdGame);
      setGame(gameData);
    }

    onGamesOrder(gameOrder);
  }, [onGamesOrder, items, maxDepth]);

  if (!game) {
    return null;
  }

  return <Bracket game={game} currentGame={currentGame} />;
};

export default React.memo(SlotsBracket);
