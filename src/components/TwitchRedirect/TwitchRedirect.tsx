import React, { useEffect, useState } from 'react';
import { Redirect, useLocation } from 'react-router';
import { getQueryValue } from '../../utils/url.utils';
import ROUTES from '../../constants/routes.constants';
import { authenticateTwitch } from '../../api/twitchApi';
import { QUERIES } from '../../constants/common.constants';
import LoadingPage from '../LoadingPage/LoadingPage';

const TwitchRedirect: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const location = useLocation();

  useEffect(() => {
    const code = getQueryValue(location.search, QUERIES.CODE);
    if (code) {
      authenticateTwitch(code).then(() => setIsLoading(false));
    }
  }, [location]);

  return isLoading ? <LoadingPage /> : <Redirect to={ROUTES.HOME} />;
};

export default TwitchRedirect;
