// eslint-disable-next-line import/prefer-default-export
import { Purchase } from '../reducers/Purchases/Purchases';
import { Slot } from '../models/slot.model';

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
