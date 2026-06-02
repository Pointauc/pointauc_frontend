import { describe, expect, it } from 'vitest';

import { applyLotSuggestions, buildSmartSplitEntries } from './splitBidSuggestions';

import type { Lot } from '@models/slot.model';

const createLot = (props: Partial<Lot>): Lot => ({
  id: props.id ?? Math.random().toString(),
  fastId: props.fastId ?? 1,
  name: props.name ?? '',
  amount: props.amount ?? 0,
  contributors: [],
  isFavorite: false,
});

const getEntrySummary = (message: string, totalAmount = 100) =>
  buildSmartSplitEntries(message, totalAmount).map(({ lotInput, amount, percentage }) => ({
    lotInput,
    amount,
    percentage,
  }));

describe('smart split bid suggestions', () => {
  it('splits weighted entries by English and Russian conjunctions', () => {
    expect(getEntrySummary('30 game A and 70 game B')).toEqual([
      { lotInput: 'game A', amount: 30, percentage: 30 },
      { lotInput: 'game B', amount: 70, percentage: 70 },
    ]);

    expect(getEntrySummary('30 game A и 70 game B')).toEqual([
      { lotInput: 'game A', amount: 30, percentage: 30 },
      { lotInput: 'game B', amount: 70, percentage: 70 },
    ]);
  });

  it('supports percentages and amount markers in free-form text', () => {
    expect(getEntrySummary('25% game A, 75% game B')).toEqual([
      { lotInput: 'game A', amount: 25, percentage: 25 },
      { lotInput: 'game B', amount: 75, percentage: 75 },
    ]);

    expect(getEntrySummary('30 to game A 70 to game B')).toEqual([
      { lotInput: 'game A', amount: 30, percentage: 30 },
      { lotInput: 'game B', amount: 70, percentage: 70 },
    ]);
  });

  it('uses even split for name-only lists and falls back to one entry otherwise', () => {
    expect(getEntrySummary('game A / game B / game C', 99)).toEqual([
      { lotInput: 'game A', amount: 33, percentage: 33.33 },
      { lotInput: 'game B', amount: 33, percentage: 33.33 },
      { lotInput: 'game C', amount: 33, percentage: 33.33 },
    ]);

    expect(getEntrySummary('single game', 100)).toEqual([{ lotInput: 'single game', amount: 100, percentage: 100 }]);
  });

  it('keeps fast id references intact and resolves them to existing lots', () => {
    const lots = [
      createLot({ id: 'lot-a', fastId: 15, name: 'game A' }),
      createLot({ id: 'lot-b', fastId: 16, name: 'game B' }),
    ];
    const entries = buildSmartSplitEntries('30 #15 и 70 #16', 100);

    expect(entries.map(({ lotInput, amount }) => ({ lotInput, amount }))).toEqual([
      { lotInput: '#15', amount: 30 },
      { lotInput: '#16', amount: 70 },
    ]);

    expect(applyLotSuggestions(entries, lots).map(({ lotInput, target }) => ({ lotInput, target }))).toEqual([
      { lotInput: 'game A', target: { type: 'existing', lotId: 'lot-a', name: 'game A' } },
      { lotInput: 'game B', target: { type: 'existing', lotId: 'lot-b', name: 'game B' } },
    ]);
  });

  it('does not split serial-like or descriptive numbers by accident', () => {
    expect(getEntrySummary('I want Game 2', 100)).toEqual([
      { lotInput: 'I want Game 2', amount: 100, percentage: 100 },
    ]);

    expect(getEntrySummary('Season 2 episode 3', 100)).toEqual([
      { lotInput: 'Season 2 episode 3', amount: 100, percentage: 100 },
    ]);

    expect(getEntrySummary('Game 2 and 3', 100)).toEqual([{ lotInput: 'Game 2 and 3', amount: 100, percentage: 100 }]);

    expect(getEntrySummary('30 fps mode for Game A', 100)).toEqual([
      { lotInput: '30 fps mode for Game A', amount: 100, percentage: 100 },
    ]);
  });
});
