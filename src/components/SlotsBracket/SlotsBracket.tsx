import { FC, Key, useEffect, useRef, useState, memo } from 'react';

import Bracket from '@components/Bracket/components/Bracket';
import { Game } from '@components/Bracket/components/model';
import { createGame, setOffsets } from '@utils/slots.utils.ts';
import { WheelItem } from '@models/wheel.model.ts';

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

const SlotsBracketMemorized = memo(SlotsBracket);

export default SlotsBracketMemorized;
