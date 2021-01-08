import { IntegrationFields, SettingFields } from '../reducers/AucSettings/AucSettings';

export interface UserData {
  username: string;
  hasDAAuth: boolean;
  settings?: SettingFields;
  integration?: IntegrationFields;
}
