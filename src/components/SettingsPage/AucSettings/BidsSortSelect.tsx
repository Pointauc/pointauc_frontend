import React, { FC } from 'react';
import { FormControl, Grid, MenuItem, Select, Typography } from '@mui/material';
import { Control, Controller } from 'react-hook-form';
import ArrowUpwardOutlinedIcon from '@mui/icons-material/ArrowUpwardOutlined';
import ArrowDownwardOutlinedIcon from '@mui/icons-material/ArrowDownwardOutlined';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { RootState } from '@reducers';

interface BidsSortSelectProps {
  control: Control;
}

const BidsSortSelect: FC<BidsSortSelectProps> = ({ control }) => {
  const { t } = useTranslation();
  const { settings } = useSelector((root: RootState) => root.aucSettings);
  const { purchaseSort } = settings;

  return (
    <Controller
      control={control}
      name='purchaseSort'
      defaultValue={purchaseSort}
      render={({ field: { onChange, onBlur, value } }) => (
        <FormControl size='small'>
          <Select
            className='auc-settings-option'
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              onBlur();
            }}
          >
            <MenuItem value={0}>
              <Grid container>
                <Typography>{t('settings.auc.dateSort')}</Typography>
                <ArrowUpwardOutlinedIcon fontSize='small' />
              </Grid>
            </MenuItem>
            <MenuItem value={1}>
              <Grid container>
                <Typography>{t('settings.auc.dateSort')}</Typography>
                <ArrowDownwardOutlinedIcon fontSize='small' />
              </Grid>
            </MenuItem>
            <MenuItem value={2}>
              <Grid container>
                <Typography>{t('settings.auc.costSort')}</Typography>
                <ArrowUpwardOutlinedIcon fontSize='small' />
              </Grid>
            </MenuItem>
            <MenuItem value={3}>
              <Grid container>
                <Typography>{t('settings.auc.costSort')}</Typography>
                <ArrowDownwardOutlinedIcon fontSize='small' />
              </Grid>
            </MenuItem>
          </Select>
        </FormControl>
      )}
    />
  );
};

export default BidsSortSelect;
