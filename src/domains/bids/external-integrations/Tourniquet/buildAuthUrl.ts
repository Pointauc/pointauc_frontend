import { v4 as uuidv4 } from 'uuid';

export const buildAuthUrl = () => {
  const authId = uuidv4();
  sessionStorage.setItem('tourniquet.authId', authId);

  return `https://tourniquet.app/oauth/fb243201e7151791610ee2f3c283776cd784675d571de68f2148b44a9bfcc646?requestId=${authId}`;
};
