export enum AlertTypeEnum {
  Success = 'success',
  Error = 'error',
}

export interface AlertProps {
  message: string;
  type: AlertTypeEnum;
  duration?: number;
}

export interface AlertType extends AlertProps {
  id: number;
}
