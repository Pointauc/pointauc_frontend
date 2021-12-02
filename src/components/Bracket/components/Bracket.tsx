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
  hoveredTeamId,
  setHoveredTeamId,
  fromSide,
  currentGame,
  ...rest
}: BracketGamesFunctionProps): JSX.Element[] => {
  const { width: gameWidth, height } = gameDimensions;

  const data = game.sides
    .map((sideInfo, index) => ({ ...sideInfo, index }))
    .filter(({ sourceGame }) => sourceGame)
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    .map(({ sourceGame, index }) => {
      const offset = index === Side.HOME ? -Number(sourceGame?.offset?.bot) - 1 : Number(sourceGame?.offset?.top) + 1;
      const calcOffset = (offset * height) / 2;
      const realOffset =
        index === Side.HOME ? calcOffset - Math.max((sourceGame?.sides.length || 0) - 4, 0) * 22.5 : calcOffset;

      const pathInfo = [
        `M${x - lineInfo.separation} ${
          y + height / 2 + lineInfo.yOffset + (game.sides.length - index) * lineInfo.homeVisitorSpread - 33
        }`,
        `H${x - roundSeparatorWidth / 2}`,
        `V${y + height / 2 + lineInfo.yOffset + realOffset}`,
        `H${x - roundSeparatorWidth + lineInfo.separation}`,
      ];

      return [
        <path key={`${game.id}-${index}-${y}-path`} d={pathInfo.join(' ')} fill="transparent" stroke="black" />,
      ].concat(
        toBracketGames({
          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore
          game: sourceGame,
          fromSide: index,
          lineInfo,
          gameDimensions,
          hoveredTeamId,
          setHoveredTeamId,
          roundSeparatorWidth,
          currentGame,
          x: x - gameWidth - roundSeparatorWidth,
          y: y + realOffset,
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
        fromSide={fromSide}
        key={game.id}
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
  currentGame,
  gameDimensions = {
    height: 140,
    width: 200,
  },
  svgPadding = 20,
  roundSeparatorWidth = 24,
  lineInfo = {
    yOffset: -6,
    separation: 6,
    homeVisitorSpread: 22,
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
          lineInfo,
          currentGame,
          hoveredTeamId,
          setHoveredTeamId,
          x: svgDimensions.width - svgPadding - gameDimensions.width,
          y: 0,
          ...rest,
        })}
      </g>
    </svg>
  );
};

export default Bracket;
