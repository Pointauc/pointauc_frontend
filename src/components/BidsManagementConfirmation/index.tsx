import { Button, Divider, Group, Paper, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { updateKickRedemptions } from '@api/kickApi';
import { updateRedemptions } from '@api/twitchApi.ts';
import { vkVideoLiveRewardsApi } from '@api/vkVideoLiveApi';
import ActionChip from '@components/BidsManagementConfirmation/ActionChip.tsx';
import ActionStatistics from '@components/BidsManagementConfirmation/ActionStatistics.tsx';
import ActionStatus from '@components/BidsManagementConfirmation/ActionStatus.tsx';
import bidsManagementUtils from '@components/BidsManagementConfirmation/utils.ts';
import { PurchaseStatusEnum } from '@models/purchase.ts';
import { RootState } from '@reducers';
import {
  addActionLogEntry,
  createActionLogEntry,
  selectPurchaseLogs,
  updatePurchaseLogStatuses,
} from '@reducers/ActionsLog/ActionsLog.ts';
import { store } from '@store';

import classes from './BidsManagementConfirmation.module.css';

const channelPointsSources = new Set<Bid.Source>(['twitch', 'kick', 'vkVideoLive']);

const updateRedemptionsBySource = async (
  data: ReturnType<typeof bidsManagementUtils.toDto>,
  source: Bid.Source,
): Promise<void> => {
  if (source === 'vkVideoLive') {
    const channelUrl = store.getState().user.authData.vkVideoLive?.channelUrl;

    if (!channelUrl) {
      throw new Error('VK Video Live channel URL is missing');
    }

    await vkVideoLiveRewardsApi.updateRedemptions(data, channelUrl);
    return;
  }

  if (source === 'kick') {
    await updateKickRedemptions(data);
    return;
  }

  await updateRedemptions(data);
};

export interface BidsManagementConfirmationProps {
  actions: Bid.ActionConfig[];
  onLoadingChanged?: (isLoading: boolean) => void;
  onClose: () => void;
}

function BidsManagementConfirmation({ actions: _actions, onLoadingChanged, onClose }: BidsManagementConfirmationProps) {
  const { t } = useTranslation();
  const [actionsStatuses, setActionsStatuses] = useState<API.RequestStatus[]>([]);
  const _history = useSelector(selectPurchaseLogs);
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
          channelPointsSources.has(bid.source) &&
          action.canApply(bid);

        if (shouldBeAdded) distributedBids.push(bid.id);

        return shouldBeAdded;
      });
    });
  }, [actions, history]);

  const renderAction = (action: Bid.ActionConfig, index: number) => {
    const Component = action.Title;

    return (
      <Stack gap='xs'>
        <Group gap='xs'>
          <ActionChip type={action.type} />
          <Component config={action} />
        </Group>
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
      notifications.show({
        message: t('bidsManagement.tooManyBids', { max }),
        color: 'red',
        autoClose: 10000,
      });
      return;
    }

    for (let index = 0; index < actions.length; index++) {
      const action = actions[index];
      const data = actionsData[index];

      if (!data.length) {
        setActionStatus('success', index);
        continue;
      }

      setActionStatus('loading', index);

      await Promise.all(
        Array.from(channelPointsSources).map((source) => {
          const sourceData = data.filter((bid) => bid.source === source);

          if (!sourceData.length) {
            return Promise.resolve();
          }

          return updateRedemptionsBySource(bidsManagementUtils.toDto(sourceData, action.type), source);
        }),
      )
        .then(() => {
          const bidIds = data.map((bid) => bid.id);
          dispatch(
            addActionLogEntry(
              createActionLogEntry({
                type: 'bid.redemptionStatusChanged',
                bidIds,
                previousStatus: PurchaseStatusEnum.Processed,
                nextStatus: bidsManagementUtils.actionToLogStatus(action.type),
              }),
            ),
          );
          dispatch(
            updatePurchaseLogStatuses({
              bidIds,
              status: bidsManagementUtils.actionToLogStatus(action.type),
            }),
          );
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
    <Stack gap='md'>
      <Text>{t('bidsManagement.allActions')}</Text>
      <Stack gap='xs'>
        {actions.map((action, index) => (
          <Paper key={index} withBorder shadow='md' p='md' bg='dark.6'>
            {renderAction(action, index)}
          </Paper>
        ))}
      </Stack>
      <div className={classes.disclaimer} dangerouslySetInnerHTML={{ __html: t('bidsManagement.disclaimer') }} />
      {canConfirm && (
        <Button variant='outline' loading={isLoading} onClick={confirmActions} style={{ alignSelf: 'center' }}>
          {t('bidsManagement.confirm')}
        </Button>
      )}
      {!canConfirm && (
        <Button onClick={onClose} variant='outline' color='gray' style={{ alignSelf: 'center' }}>
          {t('bidsManagement.close')}
        </Button>
      )}
    </Stack>
  );
}

export default BidsManagementConfirmation;
