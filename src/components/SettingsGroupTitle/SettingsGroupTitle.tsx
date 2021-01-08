import React, { FC } from 'react';
import './SettingsGroupTitle.scss';
import { Typography } from '@material-ui/core';

interface SettingsGroupTitleProps {
  title: string;
}

const SettingsGroupTitle: FC<SettingsGroupTitleProps> = ({ title, children }) => {
  return (
    <Typography variant="h5" className="setting-group-title">
      {title}
      {children}
    </Typography>
  );
};

export default SettingsGroupTitle;
