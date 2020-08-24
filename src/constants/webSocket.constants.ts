import { isProduction } from '../utils/common.utils';

export const MESSAGE_TYPES = {
  MOCK_PURCHASE: 'GET_MOCK_DATA',
  CHANNEL_POINTS_SUBSCRIBE: 'CHANNEL_POINTS_SUBSCRIBE',
  CHANNEL_POINTS_UNSUBSCRIBE: 'CHANNEL_POINTS_UNSUBSCRIBE',
  CP_SUBSCRIBED: 'CP_SUBSCRIBED',
  CP_UNSUBSCRIBED: 'CP_UNSUBSCRIBED',
};

export const WEBSOCKET_URL = isProduction()
  ? 'wss://woods-service.herokuapp.com'
  : 'ws://localhost:8000';
