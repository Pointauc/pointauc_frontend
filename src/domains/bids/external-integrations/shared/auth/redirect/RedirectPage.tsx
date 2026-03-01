import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';

import { getQueryValue } from '@utils/url.utils.ts';
import { QUERIES } from '@constants/common.constants.ts';
import { loadUserData } from '@reducers/AucSettings/AucSettings.ts';
import LoadingPage from '@components/LoadingPage/LoadingPage.tsx';
import ROUTES from '@constants/routes.constants.ts';
import * as Integration from '@models/integration';

const RedirectPage = ({ integration }: Integration.LoginButtonProps<Integration.RedirectFlow>) => {
  const { t } = useTranslation();
  const { authFlow } = integration;
  const dispatch = useDispatch();
  const location = useLocation();

  const code = getQueryValue(location.search, authFlow.redirectCodeQueryKey ?? QUERIES.CODE);

  const authQuery = useQuery({
    queryKey: ['auth-redirect', code],
    queryFn: async () => {
      await authFlow.authenticate(code!);
      await loadUserData(dispatch);
      return true;
    },
    enabled: !!code,
    retry: false,
    staleTime: Infinity,
  });

  if (authQuery.isError) {
    notifications.show({
      title: t('common.authError'),
      message: t('common.authErrorMessage'),
      color: 'red',
      autoClose: 10000,
      withCloseButton: true,
    });
    return <Navigate to={ROUTES.HOME} />;
  }

  if (authQuery.isSuccess) {
    return <Navigate to={ROUTES.INTEGRATIONS} />;
  }

  return <LoadingPage helpText={t('common.authProgress')} />;
};

export default RedirectPage;
