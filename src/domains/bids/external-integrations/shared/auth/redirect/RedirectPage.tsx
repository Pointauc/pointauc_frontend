import { notifications } from '@mantine/notifications';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { Navigate, useLocation } from 'react-router';

import LoadingPage from '@components/LoadingPage/LoadingPage.tsx';
import { QUERIES } from '@constants/common.constants.ts';
import * as Integration from '@models/integration';
import { loadUserData } from '@reducers/AucSettings/AucSettings.ts';
import { checkIsDesktop } from '@shared/lib/desktop/checkIsDesktop';
import { getQueryValue } from '@utils/url.utils.ts';

import DesktopAuthRedirectPrompt from './DesktopAuthRedirectPrompt';
import { consumeRedirectReturnPath } from './redirectReturnPath';

interface RedirectPageProps {
  integration: Integration.Config<Integration.RedirectFlow>;
}

const RedirectPage = ({ integration }: RedirectPageProps) => {
  const { t } = useTranslation();
  const { authFlow } = integration;
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const location = useLocation();
  const returnPathRef = useRef<string | null>(null);

  const code = getQueryValue(location.search, authFlow.redirectCodeQueryKey ?? QUERIES.CODE);
  const state = getQueryValue(location.search, 'state');

  const isDesktop = checkIsDesktop();
  const isDesktopHandshake = !isDesktop && (state?.startsWith('desktop.') ?? false);

  const protocolUrl = `pointauc://oauth-callback?provider=${integration.id}&${location.search.replace(/^\?/, '')}`;

  useEffect(() => {
    if (isDesktopHandshake) {
      window.location.href = protocolUrl;
    }
  }, [isDesktopHandshake, protocolUrl]);

  const getReturnPath = (): string => {
    if (!returnPathRef.current) {
      returnPathRef.current = consumeRedirectReturnPath(integration.id);
    }

    return returnPathRef.current;
  };

  const authQuery = useQuery({
    queryKey: ['auth-redirect', code],
    queryFn: async () => {
      await authFlow.authenticate(code!);
      if (integration.id !== 'donatex') {
        await dispatch(loadUserData());
      }
      return true;
    },
    enabled: !isDesktopHandshake && !!code,
    retry: false,
    staleTime: Infinity,
  });

  if (isDesktopHandshake) {
    return <DesktopAuthRedirectPrompt protocolUrl={protocolUrl} />;
  }

  if (authQuery.isError) {
    notifications.show({
      title: t('common.authError'),
      message: t('common.authErrorMessage'),
      color: 'red',
      autoClose: 10000,
      withCloseButton: true,
    });
    return <Navigate to={getReturnPath()} replace />;
  }

  if (authQuery.isSuccess) {
    return <Navigate to={getReturnPath()} replace />;
  }

  return <LoadingPage helpText={t('common.authProgress')} />;
};

export default RedirectPage;
