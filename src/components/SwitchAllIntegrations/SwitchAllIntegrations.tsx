import { Switch } from '@mantine/core';
import clsx from 'clsx';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useMergedSubscriptionsState } from '@domains/bids/external-integrations/shared/useMergedState';
import * as Integration from '@models/integration';

import styles from './SwitchAllIntegrations.module.css';

interface Props {
  integrations: Integration.Config[];
  showLabel?: boolean;
  classNames?: any;
}

const SwitchAllIntegrations = ({ integrations, showLabel = true, classNames }: Props) => {
  const { t } = useTranslation();
  const onSwitchAll = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.stopPropagation();
    integrations.forEach((integration) => {
      if (e.target.checked) {
        integration.pubsubFlow.connect();
      } else {
        integration.pubsubFlow.disconnect();
      }
    });
  };
  const subscriptions = useMergedSubscriptionsState(integrations);

  const selectAllDisabled = useMemo(() => {
    return integrations.some((integration) => subscriptions?.[integration.id]?.loading);
  }, [integrations, subscriptions]);

  const isAllSelected = useMemo(() => {
    return integrations.every((integration) => subscriptions?.[integration.id]?.subscribed);
  }, [integrations, subscriptions]);

  const label = (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <span>{t('integration.groups.donations')} (</span>
      {integrations.map((integration) => (
        <integration.branding.icon key={integration.id} size={32} />
      ))}
      <span>)</span>
    </div>
  );

  return (
    <Switch
      wrapperProps={{ onClick: (e) => e.stopPropagation() }}
      onClick={(e) => e.stopPropagation()}
      onChange={onSwitchAll}
      disabled={selectAllDisabled}
      checked={isAllSelected}
      label={showLabel && label}
      classNames={classNames}
    />
  );
};

export default SwitchAllIntegrations;
