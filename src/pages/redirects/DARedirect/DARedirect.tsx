import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useDispatch } from 'react-redux';

import { getQueryValue } from '@utils/url.utils.ts';
import ROUTES from '@constants/routes.constants';
import { QUERIES } from '@constants/common.constants.ts';
import LoadingPage from '@components/LoadingPage/LoadingPage';
import { setHasDAAuth } from '@reducers/User/User.ts';
import withLoading from '@decorators/withLoading';
import { loadUserData } from '@reducers/AucSettings/AucSettings.ts';
import { authenticateDA } from '@api/daApi.ts';
import { getCookie } from '@utils/common.utils.ts';

const hasToken = !!getCookie('userSession');

const DARedirect: React.FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>('Авторизация...');

  useEffect(() => {
    const code = getQueryValue(location.search, QUERIES.CODE);

    if (code) {
      authenticateDA(code).then(() => {
        setLoadingMessage('Загрузка аккаунта...');
        dispatch(setHasDAAuth(true));

        if (!hasToken) {
          withLoading(setIsLoading, async () => loadUserData(dispatch))();
        } else {
          setIsLoading(false);
        }
      });
    }
  }, [dispatch, location]);

  return isLoading ? <LoadingPage helpText={loadingMessage} /> : <Navigate to={ROUTES.INTEGRATION} />;
};

export default DARedirect;
