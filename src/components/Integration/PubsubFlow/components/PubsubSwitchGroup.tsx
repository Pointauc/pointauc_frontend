import React, { useEffect } from 'react';
import { FormControlLabel } from '@mui/material';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import SwitchAllIntegrations from '@components/SwitchAllIntegrations/SwitchAllIntegrations.tsx';
import PubsubSwitch from '@components/Integration/PubsubFlow/components/PubsubSwitch.tsx';
import { RootState } from '@reducers';

interface Props {
  integrations: Integration.Config[];
}

const PubsubSwitchGroup = ({ integrations }: Props) => {
  const { t } = useTranslation();
  const subscriptions = useSelector((root: RootState) => root.subscription);
  const [discrepancy, setDiscrepancy] = React.useState(false);

  useEffect(() => {
    const targetValue = subscriptions[integrations[0].id]?.actual;
    const loaded = integrations.every(({ id }) => subscriptions[id]?.loading === false);
    if (!loaded) return;

    setDiscrepancy(integrations.some(({ id }) => subscriptions[id]?.actual !== targetValue));
  }, [integrations, subscriptions]);

  return (
    <>
      <FormControlLabel
        className={classNames('integration-switch compose')}
        labelPlacement='start'
        control={<SwitchAllIntegrations integrations={integrations} />}
        label={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span>{t('integration.groups.donations')} (</span>
            {integrations.map((integration) => (
              <integration.branding.icon key={integration.id} className={classNames('base-icon', integration.id)} />
            ))}
            <span>)</span>
          </div>
        }
      />
      {discrepancy && (
        <div className='available-integrations'>
          {integrations.map((integration) => (
            <PubsubSwitch hideTitle key={integration.id} integration={integration} />
          ))}
        </div>
      )}
    </>
  );
};

export default PubsubSwitchGroup;
