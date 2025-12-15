import { ChangeEvent, FC, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Group, Switch, SwitchProps, Text } from '@mantine/core';
import classNames from 'classnames';
import clsx from 'clsx';

import { getActiveRegion } from '@components/Integration/DonatePay/index.tsx';
import { RootState } from '@reducers';
import { toSubscriptionId } from '@reducers/Subscription/Subscription.ts';
import { integrationUtils } from '@components/Integration/helpers.ts';

import styles from './PubsubSwitch.module.css';

interface Props extends Integration.PubsubComponentProps {
  hideTitle?: boolean;
  switchProps?: SwitchProps;
}

const PubsubSwitch: FC<Props> = ({ integration, hideTitle, switchProps }) => {
  const { id } = integration;
  const { t } = useTranslation();
  const subscriptionId = toSubscriptionId(id);
  const { actual, loading } = useSelector((root: RootState) => root.subscription[subscriptionId]);
  const authData = useSelector((root: RootState) => root.user.authData);
  const Icon = integration.branding.icon;

  const handleSwitchChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>): void => {
      void integrationUtils.setSubscribeState(integration, e.target.checked);
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
  }, [id, t, authData]);

  return (
    <Switch
      onChange={handleSwitchChange}
      className={classNames('integration-switch', id)}
      {...switchProps}
      disabled={loading}
      checked={actual}
      label={
        <Group align='center' gap='xxs'>
          <Icon className={clsx(styles.integrationIcon, `${id}-icon`)} width={32} height={32} />
          {!hideTitle && <Text fw={500}>{displayName}</Text>}
        </Group>
      }
    />
  );
};

export default PubsubSwitch;
