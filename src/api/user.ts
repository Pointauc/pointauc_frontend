import axios from 'axios';
import ENDPOINTS from '../constants/api.constants';

export const getUsername = async (): Promise<string> => {
  const { data } = await axios.get(ENDPOINTS.USER.USERNAME);

  return data;
};
