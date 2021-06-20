import { Accordion, AccordionDetails, AccordionSummary, Switch, Typography } from '@material-ui/core';

import React, { FC, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { ReactComponent as TwitchSvg } from '../../../assets/icons/twitch.svg';
import { ReactComponent as DASvg } from '../../../assets/icons/DAAlert.svg';
import './IntegrationSubscription.scss';
import TwitchLoginButton from '../../IntegrationPage/TwitchLoginButton/TwitchLoginButton';
import { sendCpSubscribedState, sendDaSubscribedState } from '../../../reducers/Subscription/Subscription';
import { RootState } from '../../../reducers';
import DALoginButton from '../../IntegrationPage/DALoginButton/DALoginButton';

const IntegrationSubscription: FC = () => {
  const dispatch = useDispatch();
  const { hasDAAuth, hasTwitchAuth, username } = useSelector((root: RootState) => root.user);

  const {
    da: { actual, loading },
    twitch: { actual: twitchActual, loading: twitchLoading },
  } = useSelector((root: RootState) => root.subscription);

  const [isSubscribedDA, setIsSubscribedDA] = useState<boolean>(actual);
  const [isSubscribedTwitch, setIsSubscribedTwitch] = useState<boolean>(twitchActual);

  useEffect(() => {
    setIsSubscribedTwitch(twitchActual);
  }, [twitchActual]);

  useEffect(() => {
    setIsSubscribedDA(actual);
  }, [actual]);

  const subscribeTwitch = useCallback((): void => {
    setIsSubscribedTwitch((checked) => {
      dispatch(sendCpSubscribedState(!checked, setIsSubscribedTwitch));

      return !checked;
    });
  }, [dispatch]);

  const subscribeDA = useCallback(
    (e: any, checked: boolean): void => {
      setIsSubscribedDA(checked);
      dispatch(sendDaSubscribedState(checked));
    },
    [dispatch],
  );

  return (
    <Accordion defaultExpanded className="fast-access">
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
        <Typography>Интеграции</Typography>
      </AccordionSummary>
      <AccordionDetails className="content">
        {username && hasTwitchAuth ? (
          <div className="row">
            <TwitchSvg className="base-icon twitch" />
            <span className="label">Twitch</span>
            <Switch onChange={subscribeTwitch} disabled={twitchLoading} checked={isSubscribedTwitch} />
          </div>
        ) : (
          <TwitchLoginButton />
        )}
        {username && hasDAAuth ? (
          <div className="row">
            <DASvg className="base-icon da" />
            <span className="label">Donation Alerts</span>
            <Switch onChange={subscribeDA} disabled={loading} checked={isSubscribedDA} />
          </div>
        ) : (
          <DALoginButton />
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default IntegrationSubscription;
