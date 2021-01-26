// eslint-disable-next-line import/prefer-default-export
import { getCookie, isProduction } from './common.utils';

export const getQueryValue = (url: string, queryName: string): string | null => {
  const regexp = new RegExp(`[?&]${queryName}=([^&]*)&|[?&]${queryName}=([^&]*)$`);
  const query = regexp.exec(url);
  return query && (query[1] || query[2]);
};

const urlRegExp = /(https:\/\/[^\s]*)/;

export const splitByUrls = (text: string): string[] => {
  return text.split(urlRegExp);
};

export const getWebsocketUrl = (): string =>
  isProduction()
    ? `wss://woods-service.herokuapp.com?jwtToken=${getCookie('jwtToken')}`
    : `ws://localhost:8000?jwtToken=${getCookie('jwtToken')}`;
