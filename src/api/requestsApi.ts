import axios from 'axios';
import { CamilleList } from '../models/requests.model';
import ENDPOINTS from '../constants/api.constants';

export const getCamilleBotData = async (username: string, listKey: CamilleList): Promise<Record<string, string>> => {
  const { data } = await axios.get(`${ENDPOINTS.CAMILLE_BOT}/${username}/${listKey}/json`, {
    params: { username, listKey },
  });

  return data;
};
