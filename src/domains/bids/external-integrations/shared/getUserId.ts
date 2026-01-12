import * as Integration from '@models/integration';
import { store } from '@reducers/store.ts';

export const getUserId = (integrationId: Integration.ID): string | undefined => {
  const { user } = store.getState();
  if (integrationId === 'donatePay') {
    return user.authData.donatePayEu?.id ?? user.authData.donatePay?.id;
  }
  return user.authData[integrationId]?.id;
};
