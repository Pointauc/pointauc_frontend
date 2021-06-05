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
    const { game, hoveredTeamId, onHoveredTeamIdChange, styles, homeOnTop, topText, bottomText, isCurrent, ...rest } = {
      ...defaultProps,
      ...this.props,
    };

    const {
      backgroundColor,
      hoverBackgroundColor,
      scoreBackground,
      winningScoreBackground,
      teamNameStyle,
      teamScoreStyle,
      gameNameStyle,
      gameTimeStyle,
      teamSeparatorStyle,
    } = styles || {};

    const top = game[homeOnTop ? Side.HOME : Side.VISITOR];
    const bottom = game[homeOnTop ? Side.VISITOR : Side.HOME];

    const winnerBackground =
      // eslint-disable-next-line no-nested-ternary
      game.winner ? (
        game.winner === Side.HOME ? (
          <rect x="170" y="12" width="30" height="22.5" style={{ fill: winningScoreBackground }} rx="3" ry="3" />
        ) : (
          <rect x="170" y="34.5" width="30" height="22.5" style={{ fill: winningScoreBackground }} rx="3" ry="3" />
        )
      ) : null;

    interface SideComponentProps {
      x: number;
      y: number;
      side: SideInfo;
      sideType: Side;
      onHover: (id: Key | null) => void;
    }

    const SideComponent = ({ x, y, side, onHover, sideType }: SideComponentProps) => {
      const tooltip = side ? <title>{side.name}</title> : null;

      return (
        <g fontWeight={400} onClick={() => onHover(side ? side.id : null)} style={{ cursor: 'pointer' }}>
          {/* trigger mouse events on the entire block */}
          <rect x={x} y={y} height={22.5} width={200} fillOpacity={0}>
            {tooltip}
          </rect>

          <RectClipped x={x} y={y} height={22.5} width={165}>
            <text x={x + 5} y={y + 16} style={{ ...teamNameStyle }} id={`${game.id}${sideType}`}>
              {side.name}
            </text>
          </RectClipped>

          <text x={x + 185} y={y + 16} style={teamScoreStyle} textAnchor="middle">
            {side.amount || null}
          </text>
        </g>
      );
    };

    const topHovered = top && top.id === hoveredTeamId;
    const bottomHovered = bottom && bottom.id === hoveredTeamId;

    return (
      <svg
        width="200"
        height="82"
        viewBox="0 0 200 82"
        {...rest}
        style={{ outline: isCurrent ? '2px solid #ff1717' : 'none' }}
      >
        {/* game time */}
        <text x="100" y="8" textAnchor="middle" style={gameTimeStyle}>
          {topText && topText(game)}
        </text>

        {/* backgrounds */}

        {/* base background */}
        <rect x="0" y="12" width="200" height="45" fill={backgroundColor} rx="3" ry="3" />

        {/* background for the top team */}
        <rect
          x="0"
          y="12"
          width="200"
          height="22.5"
          fill={topHovered ? hoverBackgroundColor : backgroundColor}
          rx="3"
          ry="3"
        />
        {/* background for the bottom team */}
        <rect
          x="0"
          y="34.5"
          width="200"
          height="22.5"
          fill={bottomHovered ? hoverBackgroundColor : backgroundColor}
          rx="3"
          ry="3"
        />

        {/* scores background */}
        <rect x="170" y="12" width="30" height="45" fill={scoreBackground} rx="3" ry="3" />

        {/* winner background */}
        {winnerBackground}

        {/* the players */}
        {top ? <SideComponent x={0} y={12} side={top} onHover={onHoveredTeamIdChange} sideType={Side.HOME} /> : null}

        {bottom ? (
          <SideComponent x={0} y={34.5} side={bottom} onHover={onHoveredTeamIdChange} sideType={Side.VISITOR} />
        ) : null}

        <line x1="0" y1="34.5" x2="200" y2="34.5" style={teamSeparatorStyle} />

        {/* game name */}
        <text x="100" y="68" textAnchor="middle" style={gameNameStyle}>
          {bottomText && bottomText(game)}
        </text>
      </svg>
    );
  }
}

export default BracketGame;
