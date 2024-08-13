import React from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface ConfigProps {
  type: Bid.Action;
}

const GlobalActionTitle = () => {
  const { t } = useTranslation();

  return <Typography>{t('bidsManagement.restBids')}</Typography>;
};

export class GlobalActionConfig implements ConfigProps, Bid.BaseActionConfig {
  Title = GlobalActionTitle;

  constructor(public type: Bid.Action) {}

  canApply(): boolean {
    return true;
  }
}

export default GlobalActionTitle;
