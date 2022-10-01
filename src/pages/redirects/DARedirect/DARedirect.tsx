import React, { useEffect, useState } from 'react';
import { Redirect, useLocation } from 'react-router';
import { useDispatch } from 'react-redux';
import { getQueryValue } from '../../../utils/url.utils';
import ROUTES from '../../../constants/routes.constants';
import { authenticateDA } from '../../../api/twitchApi';
import { QUERIES } from '../../../constants/common.constants';
import LoadingPage from '../../../components/LoadingPage/LoadingPage';
import { setAuthId, setCanBeRestored, setHasDAAuth } from '../../../reducers/User/User';
import withLoading from '../../../decorators/withLoading';
import { loadUserData } from '../../../reducers/AucSettings/AucSettings';
import { getIsCanRestoreSettings, updateIntegration } from '../../../api/userApi';

const DARedirect: React.FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>('Авторизация...');

  useEffect(() => {
    const code = getQueryValue(location.search, QUERIES.CODE);

    if (code) {
      authenticateDA(code).then(({ isNew }) => {
        setLoadingMessage('Загрузка аккаунта...');
        dispatch(setHasDAAuth(true));

        return withLoading(setIsLoading, async () => {
          if (isNew) {
            await updateIntegration({ da: { pointsRate: 1 } });
          }

          const user: any = await loadUserData(dispatch);

          if (isNew) {
            const { id } = user.daAuth;
            const canRestoreSettings = await getIsCanRestoreSettings(`da${id}`);

            dispatch(setCanBeRestored(canRestoreSettings));
            dispatch(setAuthId(`da${id}`));
          }
        })();
      });
    }
  }, [dispatch, location]);

  return isLoading ? <LoadingPage helpText={loadingMessage} /> : <Redirect to={ROUTES.INTEGRATION} />;
};

export default DARedirect;
