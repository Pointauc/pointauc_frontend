import { ReactNode } from 'react';

export enum AlertTypeEnum {
  Success = 'success',
  Error = 'error',
  Info = 'info',
  Warning = 'warning',
}

export interface AlertProps {
  message: ReactNode;
  type: AlertTypeEnum;
  duration?: number | false;
  closable?: boolean;
}

export interface AlertType extends AlertProps {
  id: number;
}
