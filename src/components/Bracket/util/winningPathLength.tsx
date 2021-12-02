import { Game } from '../components/model';

export default function winningPathLength(game: Game, visited: { [id: string]: true } = {}): number {
  if (visited[game.id]) {
    return 0;
  }

  visited[game.id] = true;

  return (
    1 +
    (Object.keys(game).length > 0
      ? // eslint-disable-next-line prefer-spread
        Math.max.apply(
          Math,
          [game.sides[1], game.sides[0]].map(({ sourceGame }) =>
            sourceGame ? winningPathLength(sourceGame, visited) : 0,
          ),
        )
      : 0)
  );
}
