import React from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, useFormContext } from 'react-hook-form';
import { FormControl, MenuItem, Select, Typography, FormGroup, Grid } from '@mui/material';
import { useSelector } from 'react-redux';

import SettingsGroupTitle from '@components/SettingsGroupTitle/SettingsGroupTitle.tsx';
import { InsertStrategy } from '@enums/settings.enum.ts';
import { RootState } from '@reducers';
import BidsSortSelect from '@components/SettingsPage/AucSettings/BidsSortSelect.tsx';

import '@pages/settings/IntegrationsSettings/Common/CommonIntegrationsSettings.scss';

const IntegrationCommon = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'settings.integrationCommon' });
  const { control } = useFormContext();

  return (
    <Grid container>
      <FormGroup row className='auc-settings-row'>
        <Typography className='label'>{t('insertStrategyLabel')}</Typography>
        <Controller
          name='insertStrategy'
          control={control}
          render={({ field: { onChange, value, onBlur } }) => (
            <FormControl>
              <Select
                value={value}
                onChange={(e) => {
                  onChange(e.target.value);
                  onBlur();
                }}
              >
                <MenuItem value={InsertStrategy.Force}>
                  <Typography>{t('insertStrategy.force')}</Typography>
                </MenuItem>
                <MenuItem value={InsertStrategy.Match}>
                  <Typography>{t('insertStrategy.match')}</Typography>
                </MenuItem>
                <MenuItem value={InsertStrategy.None}>
                  <Typography>{t('insertStrategy.none')}</Typography>
                </MenuItem>
              </Select>
            </FormControl>
          )}
        />
      </FormGroup>
      <FormGroup row className='auc-settings-row'>
        <Typography className='label'>{t('sortBids')}</Typography>
        <BidsSortSelect control={control} />
      </FormGroup>
    </Grid>
  );
};

export default IntegrationCommon;
