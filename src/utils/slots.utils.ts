import { Key } from 'react';
import { Slot } from '../models/slot.model';
import { REMOVE_COST_PREFIX } from '../constants/purchase.constants';
import { Purchase } from '../reducers/Purchases/Purchases';
import { Game, Side, SideInfo } from '../components/Bracket/components/model';
import { WheelItem } from '../models/wheel.model';
import { getTotal, getWheelColor } from './common.utils';

type CreateSideFunc = (restItems: WheelItem[], side: Side, gameId: Key) => SideInfo;

export const getWinnerSlot = (slots: Slot[]): Slot =>
  slots.reduce((winnerSlot, slot) => (Number(winnerSlot.amount) > Number(slot.amount) ? winnerSlot : slot));

export const normalizePurchase = ({ message, cost, ...restPurchase }: Purchase): Purchase => ({
  message: message.startsWith(REMOVE_COST_PREFIX) ? message.slice(1) : message,
  cost: message.startsWith(REMOVE_COST_PREFIX) ? -cost : cost,
  ...restPurchase,
});

export const parseWheelPreset = (text: string): WheelItem[] => {
  return text.split('\n').map<WheelItem>((value, id) => ({ id: id.toString(), name: value, color: getWheelColor() }));
};

export const getTotalSize = (slots: { amount?: number | null }[]): number =>
  slots.reduce((accum, { amount }) => accum + Number(amount), 0);

export const getSlot = (slots: Slot[], slotId: string): Slot | undefined => slots.find(({ id }) => id === slotId);

export const splitSlotsWitchMostSimilarValues = (items: WheelItem[], groups = 2): [WheelItem[], WheelItem[]] => {
  const restSlots = [...items];
  const a = [restSlots.splice(0, 1)[0]];
  let aSize = Number(a[0]?.amount);
  const b = [restSlots.splice(-1, 1)[0]];
  let bSize = Number(b[0]?.amount);

  while (restSlots.length > 0) {
    if (aSize + Number(restSlots[0].amount) < bSize + Number(restSlots[restSlots.length - 1].amount)) {
      aSize += Number(restSlots[0].amount);
      a.push(restSlots.splice(0, 1)[0]);
    } else {
      bSize += Number(restSlots[restSlots.length - 1].amount);
      b.push(restSlots.splice(-1, 1)[0]);
    }
  }

  return [a, b];
};

const getDuelSides = (items: WheelItem[], gameId: Key, createSide: CreateSideFunc): SideInfo[] => {
  const [a, b] = splitSlotsWitchMostSimilarValues(items);
  return [createSide(a, Side.VISITOR, gameId), createSide(b, Side.HOME, gameId)];
};

export const createGame = (
  items: WheelItem[],
  level = 0,
  matchOrder: Game[] = [],
  parentSide?: SideInfo,
  maxGroupAmount?: number | null,
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
      createdSide.sourceGame = createGame(restItems, level + 1, matchOrder, createdSide, maxGroupAmount);
    }

    return createdSide;
  };

  const id = Math.random();
  const shouldBeGrouped = maxGroupAmount && getTotal(items, ({ amount }) => Number(amount)) <= maxGroupAmount;
  const sides = shouldBeGrouped
    ? items.map((item) => createSide([item], Side.VISITOR, id))
    : getDuelSides(items, id, createSide);

  const game: Game = { id, name: '', level, sides, parentSide };

  matchOrder.push(game);

  return game;
};

export const setOffsets = (game: Game): Game => {
  let botOffsets = { top: 0, bot: 0 };
  let topOffsets = { top: 0, bot: 0 };
  let visitorGame = game.sides[0].sourceGame;
  let homeGame = game.sides[1].sourceGame;

  if (visitorGame) {
    visitorGame = setOffsets(visitorGame);
    game.sides[0].sourceGame = visitorGame;

    botOffsets = visitorGame.offset || botOffsets;
  }

  if (homeGame) {
    homeGame = setOffsets(homeGame);
    game.sides[1].sourceGame = homeGame;

    topOffsets = homeGame.offset || topOffsets;
  }

  game.offset = {
    top: topOffsets.top + topOffsets.bot + (homeGame ? 1 : 0),
    bot: botOffsets.bot + botOffsets.top + (visitorGame ? 1 : 0),
  };
  // game.name = `${game.name} ${offset.top}x${offset.bot}`;

  return game;
};
