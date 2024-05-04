import React, { FC, ReactNode } from 'react';
import { Grid, Tooltip, Typography } from '@mui/material';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';

interface FieldLabelProps {
  label: ReactNode;
  hint?: string;
}

const FieldLabel: FC<FieldLabelProps> = ({ label, hint }) => {
  const labelElement = typeof label === 'string' ? <Typography>{label}</Typography> : label;
  return (
    <Grid container alignItems='center' spacing={1}>
      <Grid item>{labelElement}</Grid>
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
