import React from 'react';
import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface ActionChipProps {
  type: Bid.Action;
}

const ActionChip = ({ type }: ActionChipProps) => {
  const { t } = useTranslation();
  const color = type === 'accept' ? 'success' : 'warning';

  return <Chip color={color} label={<b>{t(`bidsManagement.action.${type}`)}</b>} />;
};

export default ActionChip;
