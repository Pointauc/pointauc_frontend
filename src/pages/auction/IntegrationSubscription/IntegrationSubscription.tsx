import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import { FC, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';

import TwitchSvg from '@assets/icons/twitch.svg?react';
import DASvg from '@assets/icons/DAAlert.svg?react';
import TwitchLoginButton from '@components/IntegrationPage/TwitchLoginButton/TwitchLoginButton';
import { sendCpSubscribedState, sendDaSubscribedState } from '@reducers/Subscription/Subscription.ts';
import { RootState } from '@reducers';
import DALoginButton from '@components/IntegrationPage/DALoginButton/DALoginButton';
import IntegrationSwitch from '@components/IntegrationSwitch/IntegrationSwitch';
import INTEGRATIONS from '@components/Integration/integrations.ts';
import { integrationUtils } from '@components/Integration/helpers.ts';
import PubsubSwitch from '@components/Integration/PubsubFlow/components/PubsubSwitch.tsx';

import type { ThunkDispatch } from 'redux-thunk';
import './IntegrationSubscription.scss';

const IntegrationSubscription: FC = () => {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const { t } = useTranslation();
  const { hasDAAuth, hasTwitchAuth, hasDonatPayAuth, username } = useSelector((root: RootState) => root.user);
  const user = useSelector((root: RootState) => root.user);
  const { da, twitch, donatePay } = useSelector((root: RootState) => root.subscription);

  const { available, unavailable } = useMemo(() => integrationUtils.groupBy.availability(INTEGRATIONS, user), [user]);

  return (
    <Accordion defaultExpanded className='fast-access'>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='panel1a-content' id='panel1a-header'>
        <Typography>{t('auc.integrations')}</Typography>
      </AccordionSummary>
      <AccordionDetails className='content'>
        {username && hasTwitchAuth ? (
          <IntegrationSwitch
            state={twitch}
            onChange={(checked) => dispatch(sendCpSubscribedState(checked))}
            icon={<TwitchSvg className='base-icon twitch' />}
            title='Twitch'
          />
        ) : (
          <TwitchLoginButton />
        )}
        {username && hasDAAuth ? (
          <IntegrationSwitch
            state={da}
            onChange={(checked) => dispatch(sendDaSubscribedState(checked))}
            icon={<DASvg className='base-icon da' />}
            title='Donation Alerts'
          />
        ) : (
          <DALoginButton />
        )}
        {available.map((integration) => (
          <PubsubSwitch key={integration.id} integration={integration} />
        ))}
        {unavailable.map((integration) => (
          <integration.authFlow.loginComponent key={integration.id} integration={integration} />
        ))}
      </AccordionDetails>
    </Accordion>
  );
};

export default IntegrationSubscription;
