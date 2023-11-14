import React, { FC } from 'react';
import { Grid, Tooltip, Typography } from '@mui/material';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';

interface FieldLabelProps {
  label: string;
  hint?: string;
}

const FieldLabel: FC<FieldLabelProps> = ({ label, hint }) => {
  return (
    <Grid container alignItems='center' spacing={2}>
      <Grid item>
        <Typography>{label}</Typography>
      </Grid>
      {hint && (
        <Grid item sx={{ display: 'flex' }}>
          <Tooltip title={<Typography>{hint}</Typography>}>
            <HelpOutlineOutlinedIcon color='primary' />
          </Tooltip>
        </Grid>
      )}
    </Grid>
  );
};

export default FieldLabel;
