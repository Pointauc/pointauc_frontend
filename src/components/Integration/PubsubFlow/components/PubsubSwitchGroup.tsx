import React, { useEffect } from 'react';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Switch } from '@mantine/core';

import SwitchAllIntegrations from '@components/SwitchAllIntegrations/SwitchAllIntegrations.tsx';
import PubsubSwitch from '@components/Integration/PubsubFlow/components/PubsubSwitch.tsx';
import { RootState } from '@reducers';
import { toSubscriptionId } from '@reducers/Subscription/Subscription.ts';

interface Props {
  integrations: Integration.Config[];
  classNames?: any;
}

const PubsubSwitchGroup = ({ integrations, classNames }: Props) => {
  const { t } = useTranslation();
  const subscriptions = useSelector((root: RootState) => root.subscription);
  const [discrepancy, setDiscrepancy] = React.useState(false);

  useEffect(() => {
    const firstSubId = toSubscriptionId(integrations[0].id);
    const targetValue = subscriptions[firstSubId]?.actual;
    const loaded = integrations.every(({ id }) => subscriptions[toSubscriptionId(id)]?.loading === false);
    if (!loaded) return;

    setDiscrepancy(integrations.some(({ id }) => subscriptions[toSubscriptionId(id)]?.actual !== targetValue));
  }, [integrations, subscriptions]);

  return (
    <>
      <SwitchAllIntegrations integrations={integrations} classNames={classNames} />
      {discrepancy && (
        <div className='available-integrations'>
          {integrations.map((integration) => (
            <PubsubSwitch hideTitle key={integration.id} integration={integration} switchProps={{ classNames }} />
          ))}
        </div>
      )}
    </>
  );
};

export default PubsubSwitchGroup;
