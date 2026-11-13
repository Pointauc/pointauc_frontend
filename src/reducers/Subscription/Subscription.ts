import { ThunkDispatch } from '@reduxjs/toolkit';
import { Action } from 'redux';

import { getIntegrationsValidity } from '@api/userApi.ts';
import { integrations } from '@domains/bids/external-integrations/integrations.ts';
import {
  checkIsFrontendOnlyIntegration,
  getFrontendOnlyAuthData,
} from '@domains/bids/external-integrations/shared/frontendOnly.ts';

import { RootState } from '../index';
import { setUserState } from '../User/User';

export const validateIntegrations = async (
  dispatch: ThunkDispatch<{}, {}, Action>,
  getState: () => RootState,
): Promise<void> => {
  const {
    user: { authData },
  } = getState();

  const validity = await getIntegrationsValidity();
  const nextAuthData = integrations.all.reduce((acc, { authFlow, id }) => {
    const validityKey = `${id}Auth` as keyof typeof validity;
    const isValidFromBackend = validityKey in validity ? validity[validityKey] : undefined;
    const isFlowValid = authFlow.validate();

    if (checkIsFrontendOnlyIntegration(id)) {
      const localData = getFrontendOnlyAuthData(id) ?? authData[id];
      return { ...acc, [id]: (isValidFromBackend ?? true) && isFlowValid ? localData : undefined };
    }

    const data = (isValidFromBackend ?? authData[id]?.isValid) && isFlowValid ? authData[id] : undefined;

    if (id === 'donatePay') {
      return {
        ...acc,
        donatePayEu: validity.donatePayEuAuth && authFlow.validate() ? authData.donatePayEu : undefined,
        donatePay: data,
      };
    }

    return { ...acc, [id]: data };
  }, {});

  dispatch(
    setUserState({
      authData: nextAuthData,
    }),
  );
};
