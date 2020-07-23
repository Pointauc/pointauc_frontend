import React, { useEffect, useState } from 'react';
import { Redirect, useLocation } from 'react-router';
import { CircularProgress } from '@material-ui/core';
import { getQueryValue } from '../../utils/url.utils';
import ROUTES from '../../constants/routes.constants';
import { authenticateTwitch } from '../../api/twitchApi';
import './TwitchRedirect.scss';
import { CODE_QUERY_NAME } from '../../constants/common.constants';

const TwitchRedirect: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const location = useLocation();

  useEffect(() => {
    const code = getQueryValue(location.search, CODE_QUERY_NAME);
    if (code) {
      authenticateTwitch(code).then(() => setIsLoading(false));
    }
  }, [location]);

  return isLoading ? (
    <div className="twitch-redirect">
      <CircularProgress className="twitch-redirect-spinner" />
    </div>
  ) : (
    <Redirect to={ROUTES.AUC_PAGE} />
  );
};

export default TwitchRedirect;
