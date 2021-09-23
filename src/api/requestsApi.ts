import axios from 'axios';
import { CamilleList } from '../models/requests.model';
import ENDPOINTS from '../constants/api.constants';

export const getCamilleBotData = async (
  username: string,
  listKey: CamilleList,
): Promise<Record<string, string> | 'You are not registred in camille-bot.'> => {
  const { data } = await axios.get(ENDPOINTS.CAMILLE_BOT, {
    params: { username, listKey },
  });

  return data;
};
