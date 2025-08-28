import { Controller } from 'react-hook-form';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import OutlineInput from '@shared/mantine/ui/Input/OutlineInput';

const SpinTimeField = () => {
  const { t } = useTranslation();
  return (
    <Grid container alignItems='end' spacing={1}>
      <Controller
        name='spinTime'
        render={({ field: { onChange, value } }) => (
          <OutlineInput
            w={120}
            label={t('wheel.duration')}
            type='number'
            onChange={(e) => (e.target.value === '' ? onChange(null) : onChange(Number(e.target.value)))}
            value={Number.isNaN(value) || value == null ? '' : value}
          />
        )}
      />
      <Typography className='wheel-controls-tip'>с.</Typography>
    </Grid>
  );
};

export default SpinTimeField;
