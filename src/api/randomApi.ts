import axios from 'axios';
import ENDPOINTS from '../constants/api.constants';

export const getRandomNumber = async (min: number, max: number): Promise<number> => {
  const { data } = await axios.get(ENDPOINTS.RANDOM.INTEGER, { params: { min, max } });

  return data;
};
