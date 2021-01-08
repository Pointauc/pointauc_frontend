import React, { useEffect, useState } from 'react';
import { Redirect, useLocation } from 'react-router';
import { useDispatch } from 'react-redux';
import { getQueryValue } from '../../utils/url.utils';
import ROUTES from '../../constants/routes.constants';
import { authenticateDA } from '../../api/twitchApi';
import { QUERIES } from '../../constants/common.constants';
import LoadingPage from '../LoadingPage/LoadingPage';
import { setHasDAAuth } from '../../reducers/User/User';

const DARedirect: React.FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const code = getQueryValue(location.search, QUERIES.CODE);

    if (code) {
      authenticateDA(code).then(() => {
        dispatch(setHasDAAuth(true));
        setIsLoading(false);
      });
    }
  }, [dispatch, location]);

  return isLoading ? <LoadingPage helpText="Авторизация..." /> : <Redirect to={ROUTES.INTEGRATION} />;
};

export default DARedirect;
