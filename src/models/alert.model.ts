import { ReactNode } from 'react';

export enum AlertTypeEnum {
  Success = 'success',
  Error = 'error',
  Info = 'info',
  Warning = 'warning',
}

export interface AlertProps {
  id?: number;
  message: ReactNode;
  type: AlertTypeEnum;
  duration?: number | false;
  variant?: 'filled' | 'outlined' | 'standard';
  closable?: boolean;
  showCountdown?: boolean;
  static?: boolean;
}

export interface AlertType extends AlertProps {
  id: number;
}
