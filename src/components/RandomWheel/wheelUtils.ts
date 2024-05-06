import { WheelItem } from '@models/wheel.model.ts';

const splitItems = (items: WheelItem[], split: number): WheelItem[][] =>
  items.map((item) => {
    const { amount } = item;
    const part = Number(amount) / split;

    if (part > 1) {
      return new Array<WheelItem>(Math.ceil(part)).fill({ ...item, amount: Number(amount) / Math.ceil(part) });
    } else {
      return [item];
    }
  });

const wheelUtils = {
  splitItems,
};

export default wheelUtils;
