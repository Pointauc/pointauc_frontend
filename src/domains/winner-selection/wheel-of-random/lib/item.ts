import { WheelItemWithMetadata } from '@models/wheel.model';

export const getAmount = (item: WheelItemWithMetadata) => {
  return item.originalAmount ?? item.amount;
};
