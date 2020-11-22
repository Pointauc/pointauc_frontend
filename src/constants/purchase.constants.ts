import { PurchaseSortOption } from '../models/purchase';

export const PURCHASE_SORT_OPTIONS: PurchaseSortOption[] = [
  { key: 'timestamp', order: 'ascend' },
  { key: 'timestamp', order: 'descend' },
  { key: 'cost', order: 'ascend' },
  { key: 'cost', order: 'descend' },
];

export const REMOVE_COST_PREFIX = '-';
