import React from 'react';
import './SettingsGroupTitle.scss';

interface SettingsGroupTitleProps {
  title: string;
}

const SettingsGroupTitle: React.FC<SettingsGroupTitleProps> = ({ title }) => {
  return <div className="setting-group-title">{title}</div>;
};

export default SettingsGroupTitle;
