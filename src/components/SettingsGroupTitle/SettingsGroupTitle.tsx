import { FC, ReactNode } from 'react';
import { Typography } from '@mui/material';
import './SettingsGroupTitle.scss';

interface SettingsGroupTitleProps {
  title: string;
  children?: ReactNode;
}

const SettingsGroupTitle: FC<SettingsGroupTitleProps> = ({ title, children }) => {
  return (
    <Typography variant='h5' className='setting-group-title'>
      {title}
      {children}
    </Typography>
  );
};

export default SettingsGroupTitle;
