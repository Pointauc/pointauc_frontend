import { ReactNode } from 'react';

export type SortOrder = 'ascend' | 'descend';

export interface MenuItem {
  title: string;
  path: string;
  icon: ReactNode;
  disabled?: boolean;
  divide?: boolean;
}

export interface Size {
  height: number;
  width: number;
}

export interface DragPosition {
  left: number;
  top: number;
}

export enum LocalStorageEnum {
  Slots = 'slots',
}

export interface Paragraph {
  title: string;
  key: string;
}

export interface AppLocationState {
  isNew?: boolean;
  idKey?: string;
}
