import { DragEvent } from 'react';
import { FieldNamesMarkedBoolean } from 'react-hook-form/dist/types/form';
import { FieldValues } from 'react-hook-form/dist/types/fields';
import { CellValue, ValueGetterParams } from '@material-ui/x-grid';
import { Slot } from '../models/slot.model';
import { COLORS } from '../constants/color.constants';
import { WheelItem } from '../models/wheel.model';
import { ATTRIBUTES, TAGS } from '../constants/common.constants';

export const isProduction = (): boolean => process.env.NODE_ENV === 'production';

export const animateValue = (ref: HTMLInputElement, start: number, end: number, duration = 500): void => {
  let startTimestamp = 0;

  if (!duration) {
    ref.value = end.toString();
    return;
  }

  const step = (timestamp: number): void => {
    if (!startTimestamp) startTimestamp = timestamp;

    const progress = Math.min((timestamp - startTimestamp) / duration, 1);

    ref.value = Math.floor(progress * (end - start) + start).toString();

    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
};

export const getCookie = (name: string): string => {
  const match = new RegExp(`(^| )${name}=([^;]+)`).exec(document.cookie);
  return (match && match[2]) || '';
};

export const sortSlots = (slots: Slot[]): Slot[] => {
  return [...slots].sort((a: Slot, b: Slot) => {
    if (a.amount === undefined) {
      return 1;
    }

    return Number(b.amount) - Number(a.amount);
  });
};

export const handleDragOver = <T extends Element>(e: DragEvent<T>): void => {
  e.preventDefault();
};

export const getWheelColor = (): string => COLORS.WHEEL[Math.floor(Math.random() * COLORS.WHEEL.length)];

export const toPercents = (value: number): string => `${value}%`;

export const formatPercents = (value: number): string => `${Math.round(value * 100)}%`;

export const formatDegree = (value: number): string => `${value}°`;

export const formatSeconds = (value: number): string => `${value}c.`;

export const getDirtyValues = <T extends FieldValues>(
  values: T,
  dirtyFields: FieldNamesMarkedBoolean<T> = {},
  defaultValues: T,
): Partial<T> =>
  Object.keys(dirtyFields).reduce(
    (accum, key) => ({
      ...accum,
      [key]: values[key] === undefined ? defaultValues[key] : values[key],
    }),
    {},
  );

export const shuffle = <T>(a: T[]): T[] => {
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const isFirefox = (): boolean => navigator.userAgent.toLowerCase().includes('firefox');

export const getTotalSize = (items: WheelItem[]): number => items.reduce((acc, { amount }) => acc + (amount || 0), 0);

export const loadFile = (filename: string, data: string): void => {
  const element = document.createElement(TAGS.A);
  element.setAttribute(ATTRIBUTES.HREF, `data:text/plain;charset=utf-8,${encodeURIComponent(data)}`);
  element.setAttribute(ATTRIBUTES.DOWNLOAD, filename);

  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
};

export const getRandomIntInclusive = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getRandomInclusive = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

export const fitText = (text: string, maxLength: number): string =>
  text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

export const createMapByKey = <TKey, TData>(
  data: TData[],
  keySelector: (record: TData) => TKey,
  filter: (record: TData) => boolean,
): Map<TKey, TData[]> => {
  const map = new Map<TKey, TData[]>();

  data.forEach((record: TData) => {
    if (filter(record)) {
      const restData = map.get(keySelector(record)) || [];

      map.set(keySelector(record), [...restData, record]);
    }
  });

  return map;
};

export const percentsFormatter = (params: ValueGetterParams): CellValue => `${params.value}%`;

export const getUniqItems = <T>(items: T[], count: number): T[] => {
  if (items.length <= count) {
    return items;
  }

  const indexes: number[] = [];

  while (indexes.length < count) {
    const index = getRandomIntInclusive(0, items.length - 1);

    if (!indexes.includes(index)) {
      indexes.push(index);
    }
  }

  return indexes.map((index) => items[index]);
};

export const getTotal = <T>(items: T[], selectValue: (item: T) => number): number =>
  items.reduce((acc, value) => acc + selectValue(value), 0);

export const randomizeItem = <T>(items: T[], selectValue: (item: T) => number): number => {
  const seed = Math.random();
  let restAmount = seed * getTotal(items, selectValue);

  return items.findIndex((item) => {
    restAmount -= Number(selectValue(item));

    return restAmount <= 0;
  });
};
