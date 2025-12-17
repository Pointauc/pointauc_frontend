import { ReactNode } from 'react';

export type SortOrder = 'ascend' | 'descend';

export interface MenuItem {
  title: string;
  path: string;
  pathMatch?: string;
  icon: ReactNode;
  disabled?: boolean;
  divide?: boolean;
  target?: '_blank' | '_self' | '_parent' | '_top';
  /** @default 'auto' */
  navbarFixedState?: 'opened' | 'closed' | 'auto';
  /**
   * - true: the navbar will take page space when opened
   * - false: the navbar will overlap the page content when opened
   * @default false
   */
  shouldTakePageSpace?: boolean;
  /** Shows a beta badge next to the menu item */
  isBeta?: boolean;
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
