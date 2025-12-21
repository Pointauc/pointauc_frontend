import axios from 'axios';

import ENDPOINTS from '../constants/api.constants';

export const getRandomNumber = async (min: number, max: number): Promise<number | null> => {
  const params = {
    num: 1,
    min,
    max,
    col: 1,
    base: 10,
    format: 'plain',
    md: 'new',
    cl: 'w',
  };
  const { data: randomOrgResponse } = await axios.get<string>('https://www.random.org/integers', { params });
  const numberMatch = randomOrgResponse?.match(/<span.*>(\d+)\s+<\/span>/)?.[1];

  return numberMatch ? parseInt(numberMatch) : null;
};
