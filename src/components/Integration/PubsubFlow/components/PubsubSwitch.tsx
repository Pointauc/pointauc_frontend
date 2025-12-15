import { ChangeEvent, FC, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Group, Switch, SwitchProps, Text } from '@mantine/core';
import classNames from 'classnames';
import clsx from 'clsx';

import { RootState } from '@reducers';
import { integrationUtils } from '@components/Integration/helpers.ts';

import styles from './PubsubSwitch.module.css';

interface Props extends Integration.PubsubComponentProps {
  hideTitle?: boolean;
  switchProps?: SwitchProps;
}

const PubsubSwitch: FC<Props> = ({ integration, hideTitle, switchProps }) => {
  const { id } = integration;
  const { t } = useTranslation();
  const { actual, loading } = useSelector((root: RootState) => root.subscription[id]);
  const Icon = integration.branding.icon;

  const handleSwitchChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>): void => {
      void integrationUtils.setSubscribeState(integration, e.target.checked);
    },
    [integration],
  );

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
          {!hideTitle && <Text fw={500}>{t(`integration.${id}.name`)}</Text>}
        </Group>
      }
    />
  );
};

export default PubsubSwitch;
