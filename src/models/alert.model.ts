export enum AlertTypeEnum {
  Success = 'success',
}

export interface AlertProps {
  message: string;
  type: AlertTypeEnum.Success;
}

export interface AlertType extends AlertProps {
  id: number;
}
