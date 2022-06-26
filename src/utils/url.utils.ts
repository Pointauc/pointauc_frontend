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

// export const getWebsocketUrl = (): string =>
//   isProduction()
//     ? `wss://woods-service.herokuapp.com?userSession=${getCookie('userSession')}`
//     : `ws://localhost:8000?userSession=${getCookie('userSession')}`;

export const getWebsocketUrl = (): string =>
  `wss://woods-service.herokuapp.com?userSession=${getCookie('userSession')}`;

export const getSocketIOUrl = (): string => (isProduction() ? `https://pointauc.com` : `http://localhost:8000`);

export const getCloudifyUrl = (imageId: string): string =>
  `https://res.cloudinary.com/dn4ue0pj9/image/upload/${imageId}`;
