import { Game } from '@components/Bracket/components/model';
import { WheelItem } from '@models/wheel.model.ts';
import { createGame, setOffsets } from '@utils/slots.utils.ts';

export interface BuildGameResult {
  game: Game | null;
  gameOrder: Game[];
}

export const buildGame = (items: WheelItem[], maxDepth?: number | null): BuildGameResult => {
  const gameOrder: Game[] = [];

  if (items.length < 2) {
    return { game: null, gameOrder };
  }

  const data = items.filter(({ amount }) => amount);
  const createdGame = createGame(data, 0, gameOrder, undefined, maxDepth);

  return { game: createdGame && setOffsets(createdGame), gameOrder };
};
