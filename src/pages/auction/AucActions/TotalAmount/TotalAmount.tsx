import { ActionIcon, Text, Tooltip } from '@mantine/core';
import { useCallback, useMemo } from 'react';
import { ThunkDispatch } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Trans, useTranslation } from 'react-i18next';

import { RootState } from '@reducers/index';
import { saveSettings } from '@reducers/AucSettings/AucSettings';
import { numberUtils } from '@utils/common/number';

import classes from './TotalAmount.module.css';

const TotalAmount = () => {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const { t } = useTranslation();
  const { slots } = useSelector((root: RootState) => root.slots);
  const { isTotalVisible } = useSelector((root: RootState) => root.aucSettings.settings);
  const totalSum = useMemo(() => {
    const sum = slots.reduce((acc, slot) => (slot.amount ? acc + slot.amount : acc), 0);
    return numberUtils.formatAmount(sum, 2);
  }, [slots]);

  const toggleTotalSumVisability = useCallback(() => {
    dispatch(saveSettings({ isTotalVisible: !isTotalVisible }));
  }, [dispatch, isTotalVisible]);

  return (
    <div className={classes.totalSumWrapper}>
      <Tooltip label={t('auc.totalTooltip')}>
        <ActionIcon onClick={toggleTotalSumVisability} variant='subtle' className={classes.hideSum} size='lg'>
          {isTotalVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </ActionIcon>
      </Tooltip>
      {isTotalVisible && (
        <Text>
          <Trans components={{ 1: <Text c='dimmed' component='span' fw={600} /> }}>
            {t('auc.total', { totalSum })}
          </Trans>
        </Text>
      )}
    </div>
  );
};

export default TotalAmount;
