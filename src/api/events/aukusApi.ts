import axios from 'axios';

import ENDPOINTS from '@constants/api.constants.ts';
import { aukus } from '@components/Event/events.ts';

export interface ResultData {
  winner_title: string;
}

const updateResult = async ({ winner_title }: ResultData): Promise<void> => {
  await axios.post(ENDPOINTS.AUKUS.RESULT, { winner_title, token: aukus.getToken() });
};

const aukusApi = { updateResult };

export default aukusApi;
