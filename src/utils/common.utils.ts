import { DragEvent } from 'react';
import { GridValueFormatterParams } from '@mui/x-data-grid';
import { DeepPartial } from 'redux';

import { Slot } from '../models/slot.model';
import { COLORS } from '../constants/color.constants';
import { WheelItem } from '../models/wheel.model';
import { ATTRIBUTES, TAGS } from '../constants/common.constants';

import { numberUtils } from './common/number';

import type { FieldNamesMarkedBoolean, FieldValues } from 'react-hook-form';

export const isProduction = (): boolean => import.meta.env.MODE === 'production';

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
    } else {
      ref.value = end.toString();
    }
  };
  window.requestAnimationFrame(step);
};

export const getCookie = (name: string): string => {
  const match = new RegExp(`(^| )${name}=([^;]+)`).exec(document.cookie);
  return (match && match[2]) || '';
};

export const removeCookie = (name: string): void => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
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
  dirtyFields: FieldNamesMarkedBoolean<T> = {} as FieldNamesMarkedBoolean<T>,
  defaultValues: T,
  touched: FieldNamesMarkedBoolean<T>,
): Partial<T> =>
  Object.keys(dirtyFields).reduce((accum, key) => {
    const getValue = () => (values[key] === undefined ? defaultValues[key] : values[key]);

    return touched[key] ? { ...accum, [key]: getValue() } : accum;
  }, {});

export const shuffle = <T>(_a: T[]): T[] => {
  const a = [..._a];
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

const getRandomValue = (): number => crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;

export const getRandomIntInclusive = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getRandomInclusive = (
  min: number,
  max: number,
  attemptsCount: number = 1,
  attemptSide: 'max' | 'min' = 'max',
): number => {
  const random = () => Math.random() * (max - min) + min;
  const attempts = new Array(attemptsCount).fill(0).map(random);

  return attemptSide === 'max' ? Math.max(...attempts) : Math.min(...attempts);
};

export const random = {
  getInt: getRandomIntInclusive,
  getFloat: getRandomInclusive,
  value: getRandomValue,
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

export const percentsFormatter = (params: GridValueFormatterParams): string => `${String(params.value)}%`;

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

export function isObject(item: any) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

export function deepMerge<T>(target: T, source: DeepPartial<T>): T {
  if (!isObject(target) || !isObject(source)) {
    return source as T;
  }

  return Object.keys(source).reduce<T>(
    (acc, _key) => {
      const key = _key as keyof T;
      const sourceValue = source[key];

      if (isObject(sourceValue)) {
        acc[key] = deepMerge(acc[key], sourceValue as any);
      } else {
        acc[key] = sourceValue as any;
      }

      return acc;
    },
    { ...target },
  );
}
