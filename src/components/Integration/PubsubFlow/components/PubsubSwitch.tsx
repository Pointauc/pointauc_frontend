import { FC, useCallback } from 'react';
import { FormControlLabel, Grid, Switch, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import { RootState } from '@reducers';
import { integrationUtils } from '@components/Integration/helpers.ts';

import './PubsubSwitch.scss';

interface Props extends Integration.PubsubComponentProps {
  hideTitle?: boolean;
}

const PubsubSwitch: FC<Props> = ({ integration, hideTitle }) => {
  const { id } = integration;
  const { t } = useTranslation();
  const { actual, loading } = useSelector((root: RootState) => root.subscription[id]);
  const Icon = integration.branding.icon;

  const handleSwitchChange = useCallback(
    (e: any, checked: boolean): void => {
      void integrationUtils.setSubscribeState(integration, checked);
    },
    [integration],
  );

  return (
    <FormControlLabel
      className={classNames('integration-switch', id)}
      labelPlacement='start'
      control={<Switch onChange={handleSwitchChange} disabled={loading} checked={actual} />}
      label={
        <Grid container alignItems='center' gap={1}>
          <Icon className='base-icon' />
          {!hideTitle && <Typography className='label'>{t(`integration.${id}.name`)}</Typography>}
        </Grid>
      }
    />
  );
};

export default PubsubSwitch;
