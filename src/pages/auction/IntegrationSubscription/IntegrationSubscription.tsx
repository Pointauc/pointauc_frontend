import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@material-ui/core';

import React, { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useTranslation } from 'react-i18next';
import { ReactComponent as TwitchSvg } from '../../../assets/icons/twitch.svg';
import { ReactComponent as DASvg } from '../../../assets/icons/DAAlert.svg';
import { ReactComponent as DonatePaySvg } from '../../../assets/icons/donatePay.svg';
import './IntegrationSubscription.scss';
import TwitchLoginButton from '../../../components/IntegrationPage/TwitchLoginButton/TwitchLoginButton';
import {
  sendCpSubscribedState,
  sendDaSubscribedState,
  sendDonatePaySubscribedState,
} from '../../../reducers/Subscription/Subscription';
import { RootState } from '../../../reducers';
import DALoginButton from '../../../components/IntegrationPage/DALoginButton/DALoginButton';
import DonatePayLoginButton from '../../../components/IntegrationPage/DonatePayLoginButton/DonatePayLoginButton';
import IntegrationSwitch from '../../../components/IntegrationSwitch/IntegrationSwitch';

const IntegrationSubscription: FC = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { hasDAAuth, hasTwitchAuth, hasDonatPayAuth, username } = useSelector((root: RootState) => root.user);
  const { da, twitch, donatePay } = useSelector((root: RootState) => root.subscription);

  return (
    <Accordion defaultExpanded className="fast-access">
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
        <Typography>{t('auc.integrations')}</Typography>
      </AccordionSummary>
      <AccordionDetails className="content">
        {username && hasTwitchAuth ? (
          <IntegrationSwitch
            state={twitch}
            onChange={(checked) => dispatch(sendCpSubscribedState(checked))}
            icon={<TwitchSvg className="base-icon twitch" />}
            title="Twitch"
          />
        ) : (
          <TwitchLoginButton />
        )}
        {username && hasDAAuth ? (
          <IntegrationSwitch
            state={da}
            onChange={(checked) => dispatch(sendDaSubscribedState(checked))}
            icon={<DASvg className="base-icon da" />}
            title="Donation Alerts"
          />
        ) : (
          <DALoginButton />
        )}
        {username && hasDonatPayAuth ? (
          <IntegrationSwitch
            state={donatePay}
            onChange={(checked) => dispatch(sendDonatePaySubscribedState(checked))}
            icon={<DonatePaySvg className="base-icon donate-pay" />}
            title="DonatePay"
          />
        ) : (
          <DonatePayLoginButton />
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default IntegrationSubscription;
