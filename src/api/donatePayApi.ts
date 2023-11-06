import axios from 'axios';
import ENDPOINTS from '../constants/api.constants';

export const authenticateDonatePay = async (accessToken: string): Promise<{ isNew: boolean }> => {
  const { data } = await axios.post(ENDPOINTS.DONATE_PAY.AUTH, { accessToken });

  return data;
};
