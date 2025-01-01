import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router';

import { getQueryValue } from '@utils/url.utils.ts';
import { QUERIES } from '@constants/common.constants.ts';
import withLoading from '@decorators/withLoading.ts';
import { loadUserData } from '@reducers/AucSettings/AucSettings.ts';
import LoadingPage from '@components/LoadingPage/LoadingPage.tsx';
import ROUTES from '@constants/routes.constants.ts';
import { getCookie } from '@utils/common.utils.ts';

const RedirectPage = ({ integration }: Integration.LoginButtonProps<Integration.RedirectFlow>) => {
  const { t } = useTranslation();
  const { authFlow } = integration;
  const dispatch = useDispatch();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>(t('common.authProgress'));

  useEffect(() => {
    const code = getQueryValue(location.search, QUERIES.CODE);

    if (code) {
      authFlow.authenticate(code).then(() => {
        setLoadingMessage(t('common.accountProgress'));

        withLoading(setIsLoading, async () => loadUserData(dispatch))();
      });
    }
  }, [authFlow, dispatch, location, t]);

  return isLoading ? <LoadingPage helpText={loadingMessage} /> : <Navigate to={ROUTES.INTEGRATIONS} />;
};

export default RedirectPage;
