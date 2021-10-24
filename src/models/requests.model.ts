export enum CamilleList {
  Games = 'subday',
  Movies = 'submovie',
}

export interface RequestsListInfo {
  name: string;
  uuid: string;
  isSyncWithAuc: boolean;
  command?: string;
  subOnly?: boolean;
  disabled?: boolean;
  allData: UserRequest[];
  winnersData: UserRequest[];
}

export interface UserRequest {
  username: string;
  id: string;
  request?: string;
}
