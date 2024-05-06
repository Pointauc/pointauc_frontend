import React from 'react';
import { Grid, Tooltip, Typography } from '@mui/material';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';

interface Props {
  text: string;
}

const Hint = ({ text }: Props) => {
  return (
    <Grid item sx={{ display: 'flex' }}>
      <Tooltip title={<Typography>{text}</Typography>}>
        <HelpOutlineOutlinedIcon color='primary' />
      </Tooltip>
    </Grid>
  );
};

export default Hint;
