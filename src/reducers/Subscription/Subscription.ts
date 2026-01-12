import { ThunkDispatch } from '@reduxjs/toolkit';
import { Action } from 'redux';

import { getIntegrationsValidity } from '@api/userApi.ts';
import { getDonateXAuthData } from '@domains/bids/external-integrations/DonateX/auth.ts';
import { integrations } from '@domains/bids/external-integrations/integrations.ts';

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

    if (id === 'donatex') {
      const donatexData = getDonateXAuthData() ?? authData.donatex;
      return { ...acc, donatex: (isValidFromBackend ?? true) && isFlowValid ? donatexData : undefined };
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
