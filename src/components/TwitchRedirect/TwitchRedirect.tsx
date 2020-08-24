import React, { useEffect, useState } from 'react';
import { Redirect, useLocation } from 'react-router';
import { CircularProgress } from '@material-ui/core';
import { getQueryValue } from '../../utils/url.utils';
import ROUTES from '../../constants/routes.constants';
import { authenticateTwitch } from '../../api/twitchApi';
import './TwitchRedirect.scss';
import { QUERIES } from '../../constants/common.constants';

const TwitchRedirect: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const location = useLocation();

  useEffect(() => {
    const code = getQueryValue(location.search, QUERIES.CODE);
    if (code) {
      authenticateTwitch(code).then(() => setIsLoading(false));
    }
  }, [location]);

  const originalPath = getQueryValue(location.search, QUERIES.ORIGINAL_PATH);

  return isLoading ? (
    <div className="twitch-redirect">
      <CircularProgress className="twitch-redirect-spinner" />
    </div>
  ) : (
    <Redirect to={originalPath || ROUTES.AUC_PAGE} />
  );
};

export default TwitchRedirect;
