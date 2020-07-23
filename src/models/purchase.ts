import { DragObjectWithType } from 'react-dnd/lib/interfaces';
import { Purchase } from '../reducers/Purchases/Purchases';

export type PurchaseDragType = Purchase & DragObjectWithType;
