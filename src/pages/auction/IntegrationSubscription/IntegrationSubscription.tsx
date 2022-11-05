import { Accordion, AccordionDetails, AccordionSummary, Switch, Typography } from '@material-ui/core';

import React, { FC, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useTranslation } from 'react-i18next';
import { ReactComponent as TwitchSvg } from '../../../assets/icons/twitch.svg';
import { ReactComponent as DASvg } from '../../../assets/icons/DAAlert.svg';
import './IntegrationSubscription.scss';
import TwitchLoginButton from '../../../components/IntegrationPage/TwitchLoginButton/TwitchLoginButton';
import { sendCpSubscribedState, sendDaSubscribedState } from '../../../reducers/Subscription/Subscription';
import { RootState } from '../../../reducers';
import DALoginButton from '../../../components/IntegrationPage/DALoginButton/DALoginButton';

const IntegrationSubscription: FC = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
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
        <Typography>{t('auc.integrations')}</Typography>
      </AccordionSummary>
      <AccordionDetails className="content">
        {username && hasTwitchAuth ? (
          <div className="row">
            <div className="col">
              <TwitchSvg className="base-icon twitch" />
              <span className="label">Twitch</span>
            </div>
            <Switch onChange={subscribeTwitch} disabled={twitchLoading} checked={isSubscribedTwitch} />
          </div>
        ) : (
          <TwitchLoginButton />
        )}
        {username && hasDAAuth ? (
          <div className="row">
            <div className="col">
              <DASvg className="base-icon da" />
              <span className="label">Donation Alerts</span>
            </div>
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
