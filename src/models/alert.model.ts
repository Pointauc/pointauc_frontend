export enum AlertTypeEnum {
  Success = 'success',
  Error = 'error',
}

export interface AlertProps {
  message: string;
  type: AlertTypeEnum;
}

export interface AlertType extends AlertProps {
  id: number;
}
