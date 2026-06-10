import { useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';

import { integrations } from '@domains/bids/external-integrations/integrations.ts';
import { integrationUtils } from '@domains/bids/external-integrations/shared/helpers.ts';
import { connectIntegrationWithTimeout } from '@domains/bids/external-integrations/shared/pubsub/subscriptionTimeout';
import { useMergedSubscriptionsState } from '@domains/bids/external-integrations/shared/useMergedState';
import { registerGlobalBidConsumer } from '@domains/bids/lib/globalBidsEventBus.ts';
import { resolveVideoRequestMetadata } from '@domains/links/participant-url-parsing/resolveVideoRequestMetadata';
import { videoRequestsRepository } from '@domains/video-requests/api/VideoRequestsRepository';
import {
  buildParsedVideoReference,
  buildVideoRequestMetadataSnapshot,
  getAvailableVideoRequestIntegrations,
  getVideoRequestBidGroup,
  getVideoRequestValidationReason,
  mapSourceMetadataToVideoSourceId,
  VIDEO_REQUEST_BID_GROUPS,
  VIDEO_REQUEST_REJECTION_REASONS,
} from '@domains/video-requests/lib/listener';
import {
  VIDEO_REQUESTS_QUERY_KEYS,
  useSaveVideoRequestSettings,
  useVideoRequestSettings,
} from '@domains/video-requests/model/hooks';
import { VideoRequestBidGroup } from '@domains/video-requests/model/types';
import { RootState } from '@reducers';

const invalidateVideoRequestQueries = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: VIDEO_REQUESTS_QUERY_KEYS.queue }),
    queryClient.invalidateQueries({ queryKey: VIDEO_REQUESTS_QUERY_KEYS.rejections }),
    queryClient.invalidateQueries({ queryKey: VIDEO_REQUESTS_QUERY_KEYS.settings }),
    queryClient.invalidateQueries({ queryKey: VIDEO_REQUESTS_QUERY_KEYS.all }),
  ]);
};

export const useVideoRequestListener = () => {
  const queryClient = useQueryClient();
  const settingsQuery = useVideoRequestSettings();
  const saveSettingsMutation = useSaveVideoRequestSettings();
  const authData = useSelector((root: RootState) => root.user.authData);
  const ownedIntegrationIdsRef = useRef(new Set<string>());

  const availableIntegrationsByGroup = useMemo(() => {
    return getAvailableVideoRequestIntegrations(authData);
  }, [authData]);
  const unavailableIntegrations = useMemo(() => {
    return integrationUtils.groupBy.availability(
      integrations.all.filter((integration) =>
        integration.type === 'donate' && !integration.branding.partner ? false : true,
      ),
      authData,
    ).unavailable;
  }, [authData]);

  const activeBidGroups = settingsQuery.data?.listening.activeBidGroups ?? VIDEO_REQUEST_BID_GROUPS;

  const selectedIntegrations = useMemo(() => {
    return activeBidGroups.flatMap((group) => availableIntegrationsByGroup[group]);
  }, [activeBidGroups, availableIntegrationsByGroup]);

  const selectedIntegrationIds = useMemo(() => {
    return new Set(selectedIntegrations.map((integration) => integration.id));
  }, [selectedIntegrations]);

  const subscriptions = useMergedSubscriptionsState(selectedIntegrations);

  useEffect(() => {
    const reconcileOwnedIntegrations = async () => {
      const ownedIntegrationIds = ownedIntegrationIdsRef.current;

      if (!settingsQuery.data?.listening.isEnabled) {
        const disconnectTargets = integrations.all.filter((integration) => ownedIntegrationIds.has(integration.id));
        ownedIntegrationIds.clear();
        await Promise.all(disconnectTargets.map((integration) => integration.pubsubFlow.disconnect()));
        return;
      }

      for (const integration of selectedIntegrations) {
        const subscriptionState = integration.pubsubFlow.store.state;

        if (!subscriptionState.subscribed && !subscriptionState.loading) {
          ownedIntegrationIds.add(integration.id);
          await connectIntegrationWithTimeout(integration);
        }
      }

      const staleOwnedIntegrations = integrations.all.filter(
        (integration) => ownedIntegrationIds.has(integration.id) && !selectedIntegrationIds.has(integration.id),
      );

      for (const integration of staleOwnedIntegrations) {
        ownedIntegrationIds.delete(integration.id);
        await integration.pubsubFlow.disconnect();
      }
    };

    void reconcileOwnedIntegrations();
  }, [selectedIntegrationIds, selectedIntegrations, settingsQuery.data?.listening.isEnabled]);

  useEffect(() => {
    if (!settingsQuery.data?.listening.isEnabled) {
      return;
    }

    return registerGlobalBidConsumer(async (bid) => {
      const currentSettings = await videoRequestsRepository.getSettings();
      const bidGroup = getVideoRequestBidGroup(bid);

      if (!currentSettings.listening.activeBidGroups.includes(bidGroup)) {
        return false;
      }

      const metadata = await resolveVideoRequestMetadata({
        message: bid.message ?? '',
        parentHost: window.location.hostname,
      });

      if (!metadata) {
        await videoRequestsRepository.appendRejection({
          bidId: bid.id,
          requestedBy: bid.username,
          source: bid.source,
          reason: VIDEO_REQUEST_REJECTION_REASONS.unsupportedSource,
          requestText: bid.message ?? null,
        });
        await invalidateVideoRequestQueries(queryClient);
        return true;
      }

      const sourceId = mapSourceMetadataToVideoSourceId(metadata);
      const queue = await videoRequestsRepository.listRequests();
      const request = {
        bidId: bid.id,
        requestedBy: bid.username,
        sourceId,
        requestText: bid.message ?? null,
        bidSnapshot: {
          id: bid.id,
          source: bid.source,
          cost: bid.cost,
          username: bid.username,
          message: bid.message ?? null,
          timestamp: bid.timestamp,
          rewardId: bid.rewardId ?? null,
          isDonation: Boolean(bid.isDonation),
        },
        metadata: buildVideoRequestMetadataSnapshot(metadata),
        parsedVideoReference: buildParsedVideoReference(sourceId, metadata),
      };
      const rejectionReason = getVideoRequestValidationReason({
        queue,
        request,
        settings: currentSettings,
      });

      if (rejectionReason) {
        await videoRequestsRepository.appendRejection({
          bidId: bid.id,
          requestedBy: bid.username,
          source: bid.source,
          reason: rejectionReason,
          requestText: bid.message ?? null,
        });
        await invalidateVideoRequestQueries(queryClient);
        return true;
      }

      await videoRequestsRepository.createRequest(request);
      await invalidateVideoRequestQueries(queryClient);

      return true;
    });
  }, [queryClient, settingsQuery.data?.listening.isEnabled]);

  const setListeningEnabled = async (isEnabled: boolean) => {
    await saveSettingsMutation.mutateAsync({
      listening: {
        isEnabled,
      },
    });
  };

  const toggleBidGroup = async (group: VideoRequestBidGroup, isEnabled: boolean) => {
    const nextGroups = new Set(activeBidGroups);

    if (isEnabled) {
      nextGroups.add(group);
    } else {
      nextGroups.delete(group);
    }

    await saveSettingsMutation.mutateAsync({
      listening: {
        isEnabled: nextGroups.size > 0,
        activeBidGroups: VIDEO_REQUEST_BID_GROUPS.filter((item) => nextGroups.has(item)),
      },
    });
  };

  return {
    settings: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    isSaving: saveSettingsMutation.isPending,
    subscriptions,
    availableIntegrationsByGroup,
    unavailableIntegrations,
    setListeningEnabled,
    toggleBidGroup,
  };
};
