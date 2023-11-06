import { ReactNode } from 'react';

export enum AlertTypeEnum {
  Success = 'success',
  Error = 'error',
  Info = 'info',
}

export interface AlertProps {
  message: ReactNode;
  type: AlertTypeEnum;
  duration?: number;
  closable?: boolean;
}

export interface AlertType extends AlertProps {
  id: number;
}
