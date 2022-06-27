import { StyledProps } from '@material-ui/core';
import { StyledComponent } from '@material-ui/styles';

export type SortOrder = 'ascend' | 'descend';

export interface MenuItem {
  title: string;
  path: string;
  IconComponent: StyledComponent<StyledProps>;
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
