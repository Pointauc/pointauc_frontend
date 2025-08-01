import { FormControl, FormGroup, MenuItem, Select, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import BidsSortSelect from '@pages/settings/IntegrationsSettings/Common/AucSettings/BidsSortSelect';
import { InsertStrategy } from '@enums/insertStrategy.enum';
import RadioButtonGroup from '@components/RadioButtonGroup/RadioButtonGroup';
import { BidNameStrategy } from '@enums/bid.enum';
import '@pages/settings/IntegrationsSettings/Common/CommonIntegrationsSettings.scss';

const IntegrationCommon = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'settings.integrationCommon' });
  const { control } = useFormContext();

  return (
    <Grid container direction='column'>
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
      <FormGroup row className='auc-settings-row'>
        <Typography className='label'>{t('bidNameStrategyLabel')}</Typography>
        <Controller
          name='bidNameStrategy'
          control={control}
          render={({ field: { onChange, value, onBlur } }) => (
            <FormControl>
              <RadioButtonGroup
                options={[
                  { key: BidNameStrategy.Message, label: t('bidNameStrategy.message') },
                  { key: BidNameStrategy.Username, label: t('bidNameStrategy.username') },
                ]}
                activeKey={value}
                onChangeActive={(key) => {
                  onChange(key);
                  onBlur();
                }}
              />
            </FormControl>
          )}
        />
      </FormGroup>
    </Grid>
  );
};

export default IntegrationCommon;
