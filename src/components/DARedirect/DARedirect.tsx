import React, { useEffect, useState } from 'react';
import { Redirect, useLocation } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { AxiosError } from 'axios';
import { getQueryValue } from '../../utils/url.utils';
import ROUTES from '../../constants/routes.constants';
import { authenticateDA } from '../../api/twitchApi';
import { QUERIES } from '../../constants/common.constants';
import LoadingPage from '../LoadingPage/LoadingPage';
import { setHasDAAuth, setHasTwitchAuth } from '../../reducers/User/User';
import withLoading from '../../decorators/withLoading';
import { loadUserData } from '../../reducers/AucSettings/AucSettings';
import { ERRORS } from '../../constants/errors.constants';
import { addAlert } from '../../reducers/notifications/notifications';
import { AlertTypeEnum } from '../../models/alert.model';
import { RootState } from '../../reducers';

const DARedirect: React.FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>('Авторизация...');
  const { hasTwitchAuth } = useSelector((root: RootState) => root.user);

  useEffect(() => {
    const code = getQueryValue(location.search, QUERIES.CODE);

    if (code) {
      authenticateDA(code)
        .then(() => {
          setLoadingMessage('Загрузка аккаунта...');
          dispatch(setHasDAAuth(true));
          return dispatch(withLoading(setIsLoading, loadUserData));
        })
        .catch((error) => {
          const errorStatus = (error as AxiosError).response?.status as keyof typeof ERRORS.DA;
          if (ERRORS.DA[errorStatus]) {
            dispatch(addAlert({ duration: 9000, message: ERRORS.DA[errorStatus], type: AlertTypeEnum.Error }));
          } else if (hasTwitchAuth) {
            document.cookie = 'jwtToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
            dispatch(setHasTwitchAuth(false));
            dispatch(
              addAlert({ duration: 8000, message: ERRORS.DA.TOKEN_ERROR_FROM_TWITCH, type: AlertTypeEnum.Error }),
            );
          } else {
            dispatch(
              addAlert({ duration: 10000, message: ERRORS.DA.TOKEN_ERROR_CLEAR_BROWSER, type: AlertTypeEnum.Error }),
            );
          }
          setIsLoading(false);
        });
    }
  }, [dispatch, hasTwitchAuth, location]);

  return isLoading ? <LoadingPage helpText={loadingMessage} /> : <Redirect to={ROUTES.INTEGRATION} />;
};

export default DARedirect;
