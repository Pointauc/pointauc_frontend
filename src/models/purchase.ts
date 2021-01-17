import { SortOrder } from './common.model';

export interface PurchaseSortOption {
  key: 'timestamp' | 'cost';
  order: SortOrder;
}
