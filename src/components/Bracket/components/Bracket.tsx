import * as React from 'react';
import { FC, Key, useEffect, useRef, useState } from 'react';
import winningPathLength from '../util/winningPathLength';
import BracketGame from './BracketGame';
import { Game, Side } from './model';
import { Size } from '../../../models/common.model';

export interface LineInfo {
  yOffset: number;
  separation: number;
  homeVisitorSpread: number;
}

export interface GameComponentProps {
  game: Game;
  x: number;
  y: number;
  homeOnTop: boolean;
}

export type GameComponent = React.ComponentType<GameComponentProps>;

interface BracketGamesFunctionProps {
  game: Game;
  x: number;
  y: number;
  fromSide: Side;
  gameDimensions: { width: number; height: number };
  roundSeparatorWidth: number;
  round: number;
  homeOnTop: boolean;
  hoveredTeamId: Key | null;
  setHoveredTeamId: (id: Key | null) => void;
  lineInfo: LineInfo;
  currentGame: Key;
}

const toBracketGames = ({
  game,
  x,
  y,
  gameDimensions,
  roundSeparatorWidth,
  round,
  lineInfo,
  homeOnTop,
  hoveredTeamId,
  setHoveredTeamId,
  fromSide,
  currentGame,
  ...rest
}: BracketGamesFunctionProps): JSX.Element[] => {
  const { width: gameWidth, height: gameHeight } = gameDimensions;

  // game.name = `${game.name} (${y})`;
  const data = game.sides
    // .reverse()
    .map((sideInfo, index) => ({ ...sideInfo, index }))
    // filter to the teams that come from winning other games
    .filter(({ sourceGame }) => sourceGame)
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    .map(({ sourceGame, index }) => {
      // we put visitor teams on the bottom
      const isTop = index === Side.HOME ? homeOnTop : !homeOnTop;
      const offset = index === Side.HOME ? -Number(sourceGame?.offset?.bot) - 1 : Number(sourceGame?.offset?.top) + 1;
      const multiplier = isTop ? -1 : 1;

      const pathInfo = [
        `M${x - lineInfo.separation} ${
          y + gameHeight / 2 + lineInfo.yOffset + multiplier * lineInfo.homeVisitorSpread
        }`,
        `H${x - roundSeparatorWidth / 2}`,
        `V${y + gameHeight / 2 + lineInfo.yOffset + (offset * gameHeight) / 2}`,
        `H${x - roundSeparatorWidth + lineInfo.separation}`,
      ];

      return [
        <path key={`${game.id}-${index}-${y}-path`} d={pathInfo.join(' ')} fill="transparent" stroke="black" />,
      ].concat(
        toBracketGames({
          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore
          game: sourceGame,
          homeOnTop,
          fromSide: index,
          lineInfo,
          gameDimensions,
          hoveredTeamId,
          setHoveredTeamId,
          roundSeparatorWidth,
          currentGame,
          x: x - gameWidth - roundSeparatorWidth,
          y: y + (offset * gameHeight) / 2,
          round: round - 1,
          ...rest,
        }),
      );
    });

  return [
    <g key={`${game.id}-${y}`}>
      <BracketGame
        {...rest}
        {...gameDimensions}
        key={game.id}
        homeOnTop={homeOnTop}
        game={game}
        isCurrent={currentGame === game.id}
        x={x}
        y={y}
        hoveredTeamId={hoveredTeamId}
        onHoveredTeamIdChange={setHoveredTeamId}
      />
    </g>,
  ].concat(data.flat());
};

export interface BracketProps {
  game: Game;
  GameComponent?: GameComponent;
  homeOnTop?: boolean;
  gameDimensions?: {
    height: number;
    width: number;
  };
  svgPadding?: number;
  roundSeparatorWidth?: number;
  lineInfo?: LineInfo;
  currentGame: Key;
}

const Bracket: FC<BracketProps> = ({
  homeOnTop = true,
  currentGame,
  gameDimensions = {
    height: 160,
    width: 200,
  },
  svgPadding = 20,
  roundSeparatorWidth = 24,
  lineInfo = {
    yOffset: -6,
    separation: 6,
    homeVisitorSpread: 11,
  },
  game,
  ...rest
}) => {
  const [hoveredTeamId, setHoveredTeamId] = useState<Key | null>(null);
  const content = useRef<SVGGElement>(null);
  const numRounds = winningPathLength(game);
  const [svgSize, setSvgSize] = useState<Size>(gameDimensions);

  const svgDimensions = {
    height: gameDimensions.height * 2 * (numRounds - 1) + svgPadding * 2,
    width: numRounds * (gameDimensions.width + roundSeparatorWidth) + svgPadding * 2,
  };

  useEffect(() => {
    if (content.current) {
      const { height, width } = content.current.getBBox();

      setSvgSize({ height, width });
    }
  }, []);

  return (
    <svg {...svgSize} style={{ overflow: 'visible' }}>
      <g ref={content}>
        {toBracketGames({
          gameDimensions,
          fromSide: Side.VISITOR,
          roundSeparatorWidth,
          game,
          round: numRounds,
          homeOnTop,
          lineInfo,
          currentGame,
          hoveredTeamId,
          setHoveredTeamId,
          // svgPadding away from the right
          x: svgDimensions.width - svgPadding - gameDimensions.width,
          // vertically centered first game
          y: 0,

          ...rest,
        })}
      </g>
    </svg>
  );
};

export default Bracket;
