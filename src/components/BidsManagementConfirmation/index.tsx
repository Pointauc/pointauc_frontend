import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Divider, Paper, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import ActionChip from '@components/BidsManagementConfirmation/ActionChip.tsx';
import ActionStatistics from '@components/BidsManagementConfirmation/ActionStatistics.tsx';
import { RootState } from '@reducers';
import { PurchaseStatusEnum } from '@models/purchase.ts';
import ActionStatus from '@components/BidsManagementConfirmation/ActionStatus.tsx';
import { updateRedemptions } from '@api/twitchApi.ts';
import LoadingButton from '@components/LoadingButton/LoadingButton.tsx';
import bidsManagementUtils from '@components/BidsManagementConfirmation/utils.ts';
import { setHistory } from '@reducers/Purchases/Purchases.ts';
import { addAlert } from '@reducers/notifications/notifications.ts';
import { AlertTypeEnum } from '@models/alert.model.ts';
import '@components/BidsManagementConfirmation/index.scss';

import { store } from '../../main.tsx';

export interface BidsManagementConfirmationProps {
  actions: Bid.ActionConfig[];
  onLoadingChanged?: (isLoading: boolean) => void;
  onClose: () => void;
}

const BidsManagementConfirmation = ({
  actions: _actions,
  onLoadingChanged,
  onClose,
}: BidsManagementConfirmationProps) => {
  const { t } = useTranslation();
  const [actionsStatuses, setActionsStatuses] = React.useState<API.RequestStatus[]>([]);
  const { history: _history } = useSelector((root: RootState) => root.purchases);
  const [actions] = useState(_actions);
  const [history] = useState(_history);
  const dispatch = useDispatch();

  const actionsData = useMemo(() => {
    const distributedBids: string[] = [];

    return actions.map((action) => {
      return history.filter((bid) => {
        const shouldBeAdded =
          !distributedBids.includes(bid.id) &&
          bid.status === PurchaseStatusEnum.Processed &&
          bid.source === 'twitch' &&
          action.canApply(bid);

        if (shouldBeAdded) distributedBids.push(bid.id);

        return shouldBeAdded;
      });
    });
  }, [actions, history]);

  const renderAction = (action: Bid.ActionConfig, index: number) => {
    const Component = action.Title;

    return (
      <Stack spacing={1}>
        <Stack spacing={1} direction='row' alignItems='center'>
          <ActionChip type={action.type} />
          <Component config={action} />
        </Stack>
        <Divider />
        <ActionStatistics data={actionsData[index]} />
        <ActionStatus status={actionsStatuses[index] ?? 'idle'} />
      </Stack>
    );
  };

  const setActionStatus = (status: API.RequestStatus, index: number) => {
    setActionsStatuses((prev) => {
      const newStatuses = [...prev];
      newStatuses[index] = status;
      return newStatuses;
    });
  };

  const confirmActions = useCallback(async () => {
    const max = 9999;
    if (actionsData.reduce((acc) => actionsData.length + acc, 0) > max) {
      dispatch(
        addAlert({ message: t('bidsManagement.tooManyBids', { max }), type: AlertTypeEnum.Error, duration: 10000 }),
      );
      return;
    }

    for (let index = 0; index < actions.length; index++) {
      const action = actions[index];
      const data = actionsData[index];

      if (!data.length) {
        setActionStatus('success', index);
        continue;
      }

      const requestData = bidsManagementUtils.toDto(data, action.type);

      setActionStatus('loading', index);

      await updateRedemptions(requestData)
        .then(() => {
          const history = store.getState().purchases.history;
          dispatch(setHistory(bidsManagementUtils.markStatus(data, history, action.type)));
          setActionStatus('success', index);
        })
        .catch(() => setActionStatus('error', index));
    }
  }, [actions, actionsData, dispatch, t]);
  const isLoading = useMemo(() => actionsStatuses.some((status) => status === 'loading'), [actionsStatuses]);
  const isIdling = useMemo(
    () => !actionsStatuses.length || actionsStatuses.some((status) => status === 'idle'),
    [actionsStatuses],
  );
  const canConfirm = isLoading || isIdling;

  useEffect(() => onLoadingChanged?.(isLoading), [isLoading, onLoadingChanged]);

  return (
    <Stack className='bids-management-confirmation' spacing={2}>
      <Typography>{t('bidsManagement.allActions')}</Typography>
      <Stack spacing={1}>
        {actions.map((action, index) => (
          <Paper className='action-config' key={index}>
            {renderAction(action, index)}
          </Paper>
        ))}
      </Stack>
      <div className='disclaimer' dangerouslySetInnerHTML={{ __html: t('bidsManagement.disclaimer') }} />
      {canConfirm && (
        <LoadingButton
          isLoading={isLoading}
          onClick={confirmActions}
          className='confirm'
          variant='outlined'
          color='primary'
        >
          {t('bidsManagement.confirm')}
        </LoadingButton>
      )}
      {!canConfirm && (
        <Button onClick={onClose} className='confirm' color='blank' variant='outlined'>
          {t('bidsManagement.close')}
        </Button>
      )}
    </Stack>
  );
};

export default BidsManagementConfirmation;
