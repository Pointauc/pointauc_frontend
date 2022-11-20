import { Key } from 'react';
import { Slot } from '../models/slot.model';
import { Purchase } from '../reducers/Purchases/Purchases';
import { Game, Side, SideInfo } from '../components/Bracket/components/model';
import { WheelItem } from '../models/wheel.model';
import { getWheelColor } from './common.utils';

type CreateSideFunc = (restItems: WheelItem[], side: Side, gameId: Key) => SideInfo;

export const getWinnerSlot = (slots: Slot[]): Slot =>
  slots.reduce((winnerSlot, slot) => (Number(winnerSlot.amount) > Number(slot.amount) ? winnerSlot : slot));

export const normalizePurchase = ({ message, cost, ...restPurchase }: Purchase): Purchase => ({
  message,
  cost,
  ...restPurchase,
});

export const parseWheelPreset = (text: string): WheelItem[] => {
  return text.split('\n').map<WheelItem>((value, id) => ({ id: id.toString(), name: value, color: getWheelColor() }));
};

export const parseSlotsPreset = (text: string): Slot[] => {
  const items = text.split('\n');

  return items.map<Slot>((item, fastId) => {
    const [name, amount = 1] = item.split(',');

    return { name, amount: Number(amount), id: Math.random().toString(), fastId, extra: null };
  });
};

export const slotToWheel = ({ id, name, amount }: Slot): WheelItem => ({
  id: id.toString(),
  name: name || '',
  amount: Number(amount),
  color: getWheelColor(),
});

export const getTotalSize = (slots: { amount?: number | null }[]): number =>
  slots.reduce((accum, { amount }) => accum + Number(amount), 0);

export const getSlot = (slots: Slot[], slotId: string): Slot | undefined => slots.find(({ id }) => id === slotId);

export const splitSlotsWitchMostSimilarValues = (items: WheelItem[]): [WheelItem[], WheelItem[]] => {
  const restSlots = [...items];
  const a = [restSlots.splice(0, 1)[0]];
  let aSize = Number(a[0]?.amount);
  const b = [restSlots.splice(-1, 1)[0]];
  let bSize = Number(b[0]?.amount);

  while (restSlots.length > 0) {
    if (aSize + Number(restSlots[0].amount) < bSize + Number(restSlots[restSlots.length - 1].amount)) {
      aSize += Number(restSlots[0].amount);
      a.unshift(restSlots.splice(0, 1)[0]);
    } else {
      bSize += Number(restSlots[restSlots.length - 1].amount);
      b.unshift(restSlots.splice(-1, 1)[0]);
    }
  }

  return [a, b];
};

const getDuelSides = (items: WheelItem[], gameId: Key, createSide: CreateSideFunc): SideInfo[] => {
  const [a, b] = splitSlotsWitchMostSimilarValues(items);
  return [createSide(b, Side.VISITOR, gameId), createSide(a, Side.HOME, gameId)];
};

export const createGame = (
  items: WheelItem[],
  level = 0,
  matchOrder: Game[] = [],
  parentSide?: SideInfo,
  maxDepth?: number,
): Game | null => {
  if (!items.length) {
    return null;
  }

  const createSide = (restItems: WheelItem[], side: Side, gameId: Key): SideInfo => {
    const createdSide: SideInfo =
      restItems.length === 1
        ? {
            amount: Number(restItems[0]?.amount),
            name: restItems[0].name || '',
            id: restItems[0].id,
            side,
            gameId,
          }
        : {
            side,
            amount: getTotalSize(restItems),
            name: '',
            id: Math.random(),
            gameId,
          };

    if (restItems.length > 1) {
      createdSide.sourceGame = createGame(restItems, level + 1, matchOrder, createdSide, maxDepth);
    }

    return createdSide;
  };

  const id = Math.random();
  const shouldBeGrouped = maxDepth && level >= maxDepth;
  const sides = shouldBeGrouped
    ? items.map((item) => createSide([item], Side.VISITOR, id))
    : getDuelSides(items, id, createSide);

  const game: Game = { id, name: '', level, sides, parentSide };

  matchOrder.push(game);

  return game;
};

const getOffset = ({ sides }: Game): number => Math.ceil(sides.length / 4);

export const setOffsets = (game: Game): Game => {
  let botOffsets = { top: 0, bot: 0 };
  let topOffsets = { top: 0, bot: 0 };
  let visitorGame = game.sides[Side.VISITOR].sourceGame;
  let homeGame = game.sides[Side.HOME].sourceGame;

  if (visitorGame) {
    visitorGame = setOffsets(visitorGame);
    game.sides[Side.VISITOR].sourceGame = visitorGame;

    botOffsets = visitorGame.offset || botOffsets;
  }

  if (homeGame) {
    homeGame = setOffsets(homeGame);
    game.sides[Side.HOME].sourceGame = homeGame;

    topOffsets = homeGame.offset || topOffsets;
  }

  game.offset = {
    top: topOffsets.top + topOffsets.bot + (homeGame ? getOffset(homeGame) : 0),
    bot: botOffsets.bot + botOffsets.top + (visitorGame ? getOffset(visitorGame) : 0),
  };

  return game;
};
