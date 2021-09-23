export enum CamilleList {
  Games = 'subday',
  Movies = 'submovie',
}

export interface RequestsListInfo {
  name: string;
  uuid: string;
  command?: string;
  subOnly?: boolean;
  disabled?: boolean;
}

export interface UserRequest {
  username: string;
  id: string;
  request?: string;
}
