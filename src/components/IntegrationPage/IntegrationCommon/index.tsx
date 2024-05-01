import React from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, useFormContext } from 'react-hook-form';
import { FormControl, MenuItem, Select, Typography, FormGroup } from '@mui/material';
import { useSelector } from 'react-redux';

import SettingsGroupTitle from '@components/SettingsGroupTitle/SettingsGroupTitle.tsx';
import { InsertStrategy } from '@enums/settings.enum.ts';
import { RootState } from '@reducers';

const IntegrationCommon = () => {
  const { username } = useSelector((root: RootState) => root.user);
  const { t } = useTranslation(undefined, { keyPrefix: 'settings.integrationCommon' });
  const { control } = useFormContext();

  return (
    <>
      <SettingsGroupTitle title={t('title')}>
        {username && <span className='username'>{username}</span>}
      </SettingsGroupTitle>
      <FormGroup row className='auc-settings-row'>
        <Typography variant='body1' className='MuiFormControlLabel-label'>
          {t('insertStrategyLabel')}
        </Typography>
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
    </>
  );
};

export default IntegrationCommon;
