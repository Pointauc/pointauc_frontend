import React, { useEffect, useState } from 'react';
import { Redirect, Route, RouteProps } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../reducers';
import LoadingPage from '../LoadingPage/LoadingPage';
import ROUTES from '../../constants/routes.constants';
import { updateUsername } from '../../reducers/User/User';
import withLoading from '../../decorators/withLoading';

const PrivateRoute: React.FC<RouteProps> = (props) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { username } = useSelector((root: RootState) => root.user);

  useEffect(() => {
    if (!username) {
      dispatch(withLoading(setIsLoading, updateUsername));
    }
  }, [dispatch, username]);

  if (username) {
    return <Route {...props} />;
  }

  if (isLoading) {
    return <LoadingPage />;
  }

  return <Redirect to={ROUTES.LOGIN} />;
};

export default PrivateRoute;
