import * as React from 'react';
import { Key } from 'react';
import { RectClipped } from './Clipped';
import { Game, Side, SideInfo } from './model';

interface BracketGameProps {
  game: Game;
  isCurrent: boolean;

  homeOnTop?: boolean;
  hoveredTeamId?: Key | null;

  x: number;
  y: number;

  fromSide: number;

  onHoveredTeamIdChange: (id: Key | null) => void;
  styles?: {
    backgroundColor: string;
    hoverBackgroundColor: string;
    scoreBackground: string;
    winningScoreBackground: string;
    teamNameStyle: React.CSSProperties;
    teamScoreStyle: React.CSSProperties;
    gameNameStyle: React.CSSProperties;
    gameTimeStyle: React.CSSProperties;
    teamSeparatorStyle: React.CSSProperties;
  };
  topText?: (game: Game) => string;
  bottomText?: (game: Game) => string;
}

const defaultProps: Partial<BracketGameProps> = {
  homeOnTop: true,
  hoveredTeamId: null,

  styles: {
    backgroundColor: '#58595e',
    hoverBackgroundColor: '#222',

    scoreBackground: '#787a80',
    winningScoreBackground: '#ff7324',
    teamNameStyle: { fill: '#fff', fontSize: 12, textShadow: '1px 1px 1px #222' },
    teamScoreStyle: { fill: '#23252d', fontSize: 12 },
    gameNameStyle: { fill: '#999', fontSize: 10 },
    gameTimeStyle: { fill: '#999', fontSize: 10 },
    teamSeparatorStyle: { stroke: '#444549', strokeWidth: 1 },
  },

  topText: ({ scheduled }: Game) => (scheduled ? new Date(scheduled).toLocaleDateString() : ''),
  bottomText: ({ name, bracketLabel }: Game) => [name, bracketLabel].filter((value) => value).join(' - '),
};

class BracketGame extends React.PureComponent<BracketGameProps> {
  render() {
    const { game, hoveredTeamId, onHoveredTeamIdChange, styles, fromSide, isCurrent, ...rest } = {
      ...defaultProps,
      ...this.props,
    };

    game.x = rest.x;
    game.y = rest.y;

    const {
      backgroundColor,
      hoverBackgroundColor,
      scoreBackground,
      winningScoreBackground,
      teamNameStyle,
      teamScoreStyle,
      teamSeparatorStyle,
    } = styles || {};

    const { sides } = game;

    interface SideComponentProps {
      x: number;
      y: number;
      side: SideInfo;
      sideType: Side;
      onHover: (id: Key | null) => void;
      winner?: boolean;
      hovered?: boolean;
    }

    const SideComponent = ({ x, y, side, onHover, sideType, winner, hovered }: SideComponentProps) => {
      const tooltip = side ? <title>{side.name}</title> : null;
      const offset = sideType * 22 + 12.5;
      const lineOffset = sideType * 22 + 34.5;

      return (
        <g fontWeight={400} onClick={() => onHover(side ? side.id : null)} style={{ cursor: 'pointer' }}>
          <rect
            x="0"
            y={offset}
            width="200"
            height="22.5"
            fill={hovered ? hoverBackgroundColor : backgroundColor}
            rx="3"
            ry="3"
          />
          <rect
            x="160"
            y={offset}
            width="40"
            height="22.5"
            fill={winner ? winningScoreBackground : scoreBackground}
            rx="3"
            ry="3"
          />
          {/* trigger mouse events on the entire block */}
          <rect x={x} y={y} height={22.5} width={200} fillOpacity={0}>
            {tooltip}
          </rect>

          <RectClipped x={x} y={y} height={22.5} width={165}>
            <text x={x + 5} y={y + 16} style={{ ...teamNameStyle }} id={`${game.id}${side.side}`}>
              {side.name}
            </text>
          </RectClipped>

          <text x={x + 175} y={y + 16} style={teamScoreStyle} textAnchor="middle">
            {side.amount || null}
          </text>

          {side.side !== sides.length && (
            <line x1="0" y1={lineOffset} x2="200" y2={lineOffset} style={teamSeparatorStyle} />
          )}
        </g>
      );
    };

    return (
      <svg
        width="200"
        {...rest}
        y={rest.y + 29}
        height={34.5 * sides.length}
        style={{ outline: isCurrent ? '2px solid #ff1717' : 'none' }}
      >
        {game.sides.map((side, index) => (
          <SideComponent
            key={side.id}
            x={0}
            y={(sides.length - index) * 22 - 12}
            side={side}
            onHover={onHoveredTeamIdChange}
            sideType={sides.length - index - 1}
            winner={game.winner === index}
            hovered={hoveredTeamId === side.id}
          />
        ))}
      </svg>
    );
  }
}

export default BracketGame;
