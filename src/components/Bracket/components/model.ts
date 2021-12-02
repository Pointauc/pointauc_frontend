import { Key } from 'react';

export enum Side {
  VISITOR,
  HOME,
}

export type ID = Key;

export interface SideInfo {
  amount: number;
  name: string;
  sourceGame?: Game | null;
  sourcePool?: object;
  id: Key;
  gameId?: Key;
  side: Side;
}

export interface Offset {
  top: number;
  bot: number;
}

export interface Game {
  id: ID;
  x?: number;
  y?: number;
  // the game name
  name: string;
  // optional: the label for the game within the bracket, e.g. Gold Finals, Silver Semi-Finals
  bracketLabel?: string;
  // the unix timestamp of the game-will be transformed to a human-readable time using momentjs
  scheduled?: number;

  offset?: Offset;
  level: number;
  winner?: Side;
  parentSide?: SideInfo;

  court?: {
    name: string;
    venue: {
      name: string;
    };
  };
  sides: SideInfo[];
}
