import React from 'react';
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { Navigate } from 'react-router';

import ROUTES from '@constants/routes.constants.ts';
import { setEventState } from '@reducers/User/User.ts';
import { aukus } from '@components/Event/events.ts';

const AukusRedirectPage = () => {
  const dispatch = useDispatch();
  const [params] = useSearchParams();
  const token = params.get('aukus_token');
  if (token) {
    aukus.setToken(token);
    dispatch(setEventState({ key: 'aukus', value: { isValid: true } }));
  }

  return <Navigate to={ROUTES.SETTINGS} state={{ subpage: 'integrations' }} />;
};

export default AukusRedirectPage;