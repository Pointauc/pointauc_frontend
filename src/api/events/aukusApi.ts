import axios from 'axios';

import ENDPOINTS from '@constants/api.constants.ts';
import { aukus } from '@components/Event/events.ts';

export interface ResultData {
  winner_title: string;
  winner_value: number;
  auc_value: number;
  lots_count: number;
}

const updateResult = async (params: ResultData): Promise<void> => {
  await axios.post(ENDPOINTS.AUKUS.RESULT, { ...params, token: aukus.getToken() });
};

const startTimer = async (): Promise<void> => {
  await axios.post(ENDPOINTS.AUKUS.TIMER_STARTED, { token: aukus.getToken() });
};

const aukusApi = { updateResult, startTimer };

export default aukusApi;
