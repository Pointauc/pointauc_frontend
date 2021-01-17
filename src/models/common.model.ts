import { StyledProps } from '@material-ui/core';
import { StyledComponent } from '@material-ui/styles';

export type SortOrder = 'ascend' | 'descend';

export interface MenuItem {
  title: string;
  path: string;
  IconComponent: StyledComponent<StyledProps>;
  disabled?: boolean;
}
