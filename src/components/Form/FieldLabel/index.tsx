import React, { FC, ReactNode } from 'react';
import { Grid, Tooltip, Typography } from '@mui/material';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';

import Hint from '@components/Hint';

interface FieldLabelProps {
  label: ReactNode;
  hint?: string;
}

const FieldLabel: FC<FieldLabelProps> = ({ label, hint }) => {
  const labelElement = typeof label === 'string' ? <Typography>{label}</Typography> : label;
  return (
    <Grid container alignItems='center' spacing={1}>
      <Grid item>{labelElement}</Grid>
      {hint && <Hint text={hint} />}
    </Grid>
  );
};

export default FieldLabel;
