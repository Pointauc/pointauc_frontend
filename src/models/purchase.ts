import { SortOrder } from './common.model';

export interface PurchaseSortOption {
  key: 'timestamp' | 'cost';
  order: SortOrder;
}

export enum PurchaseStatusEnum {
  Processed = 'processed',
  Deleted = 'deleted',

  return = 'returned',
  accept = 'accepted',
}
