import { Group, Switch, SwitchProps, Text } from '@mantine/core';
import { useStore } from '@tanstack/react-store';
import classNames from 'classnames';
import clsx from 'clsx';
import { ChangeEvent, FC, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { getActiveRegion } from '@domains/bids/external-integrations/DonatePay/index.tsx';
import * as Integration from '@models/integration';

import styles from './PubsubSwitch.module.css';

interface Props extends Integration.PubsubComponentProps {
  hideTitle?: boolean;
  switchProps?: SwitchProps;
}

const PubsubSwitch: FC<Props> = ({ integration, hideTitle, switchProps }) => {
  const { id } = integration;
  const { t } = useTranslation();
  const { subscribed, loading } = useStore<Integration.PubsubSubscription>(integration.pubsubFlow.store);
  const Icon = integration.branding.icon;

  const handleSwitchChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>): void => {
      if (e.target.checked) {
        integration.pubsubFlow.connect();
      } else {
        integration.pubsubFlow.disconnect();
      }
    },
    [integration],
  );

  const displayName = useMemo(() => {
    const baseName = t(`integration.${id}.name`);

    // Show region code for DonatePay when authenticated
    if (id === 'donatePay') {
      const region = getActiveRegion();
      if (region) {
        return `${baseName} (${region.toUpperCase()})`;
      }
    }

    return baseName;
  }, [id, t]);

  return (
    <Switch
      onChange={handleSwitchChange}
      className={classNames('integration-switch', id)}
      {...switchProps}
      disabled={loading}
      checked={subscribed}
      label={
        <Group align='center' gap='xxs'>
          <Icon />
          {!hideTitle && <Text fw={500}>{displayName}</Text>}
        </Group>
      }
    />
  );
};

export default PubsubSwitch;
