import axios from 'axios';

export const getRandomNumber = async (min: number, max: number): Promise<number | null> => {
  const params = {
    num: 1,
    min,
    max,
    col: 1,
    base: 10,
    format: 'plain',
    rnd: 'new',
  };
  const { data: randomOrgResponse } = await axios.get<string>('https://www.random.org/integers/', { params });

  // With format=plain, response is just the number as plain text
  const number = parseInt(randomOrgResponse.trim());

  return isNaN(number) ? null : number;
};
