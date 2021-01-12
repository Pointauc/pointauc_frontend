import { DragObjectWithType } from 'react-dnd/lib/interfaces';
import { Purchase } from '../reducers/Purchases/Purchases';
import { SortOrder } from './common.model';

export type PurchaseDragType = Purchase & DragObjectWithType;

export interface PurchaseSortOption {
  key: 'timestamp' | 'cost';
  order: SortOrder;
}
