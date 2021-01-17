import { DragEvent } from 'react';
import { Slot } from '../models/slot.model';
import { COLORS } from '../constants/color.constants';

export const isProduction = (): boolean => process.env.NODE_ENV === 'production';

export const animateValue = (ref: HTMLInputElement, start: number, end: number, duration = 500): void => {
  let startTimestamp = 0;
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
