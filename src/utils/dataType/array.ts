import { Key } from 'react';

import { getRandomIntInclusive } from '@utils/common.utils.ts';

interface Item {
  id: Key;
  amount: number;
}

const getPair = (arr: Item[], start = 0): number => {
  for (let i = start + 1; i <= arr.length; i++) {
    const currentIndex = i === arr.length ? 0 : i;

    if (arr[currentIndex].id === arr[i - 1].id) {
      return i;
    }
  }

  return -1;
};

const getPairsIndexes = (arr: Item[]): number[] => {
  const result = [];
  let cursor = 0;

  while (cursor !== -1) {
    cursor = getPair(arr, cursor);

    if (cursor !== -1) {
      result.push(cursor);
    }
  }

  return result;
};

const insertBetweenPairs = (source: Item[], subArray: Item[]): Item[] => {
  const result = [...source];

  const pairsIndexes = getPairsIndexes(result);
  const pairs = pairsIndexes.length;
  const maxSteps = pairs / subArray.length;
  let step = maxSteps;
  let insertedItems = 0;

  pairsIndexes.forEach((value) => {
    if (step >= maxSteps) {
      result.splice(value + insertedItems, 0, subArray.pop()!);

      insertedItems++;
      step = step - maxSteps + 1;
    } else {
      step++;
    }
  });

  return result;
};

const getSafeIndex = (arr: any[], index: number): number => (index > arr.length ? index - arr.length : index);
export const getSafeIndex2 = (arr: any[], index: number): number => {
  if (index < 0) {
    return index + arr.length;
  } else if (index + 1 > arr.length) {
    return index - arr.length;
  } else {
    return index;
  }
};

const findIndexFrom = (source: Item[], id: Key, start: number): number => {
  const arr = [...source.slice(start), ...source.slice(0, (start || 1) - 1)];
  const index = arr.findIndex((preset) => preset.id === id);

  return index === -1 ? index : index + start;
};

const getStartIndex = (source: Item[], id: Key): number => {
  const existedItem = findIndexFrom(source, id, 0);

  return existedItem === -1 ? getRandomIntInclusive(0, source.length) : existedItem;
};

const insertBetweenNext = (source: Item[], index: number, items: Item[]): void => {
  if (items.length === 0) return;

  const { id } = items[0];
  let nextIndex = findIndexFrom(source, id, index + 1);

  if (nextIndex === -1) {
    nextIndex = source.length + index;

    const insertPosition = index + Math.floor((nextIndex - index) / 2);
    const safePosition = getSafeIndex(source, insertPosition);

    source.splice(safePosition, 0, items.pop()!);

    insertBetweenNext(source, safePosition, items);

    return;
  }

  const insertPosition = index + Math.ceil((nextIndex - index) / 2);
  source.splice(getSafeIndex(source, insertPosition), 0, items.pop()!);

  if (getSafeIndex(source, nextIndex + 1) < index) {
    insertBetweenNext(source, getSafeIndex(source, nextIndex + 1), items);
  } else {
    insertBetweenNext(source, nextIndex + 1, items);
  }
};

const insertEvenly = (source: Item[], subArray: Item[]): Item[] => {
  const result = [...source];

  const start = getStartIndex(source, subArray[0].id);

  insertBetweenNext(result, start, subArray);

  return result;
};

const insertItems = (source: Item[], subArray: Item[]): Item[] => {
  const subArrayClone = [...subArray];

  const processedSource = insertBetweenPairs(source, subArrayClone);

  return subArrayClone.length === 0 ? processedSource : insertEvenly(processedSource, subArrayClone);
};

const distributeEvenly = <T extends Item>(data: T[][]): T[] => {
  return data.reduce((accum, arr) => insertItems(accum, arr) as any);
};

const maxBy = <T>(arr: T[], fn: (item: T) => number) =>
  arr.length ? arr.reduce((a, b) => (fn(a) > fn(b) ? a : b)) : null;

const groupBy = <T>(arr: T[], fn: (item: T) => string) => {
  const result: Record<string, T[]> = {};

  arr.forEach((item) => {
    const key = fn(item);
    const arr = result[key] || (result[key] = []);

    arr.push(item);
  });

  return result;
};

const array = {
  distributeEvenly,
  maxBy,
  groupBy,
};

export default array;
