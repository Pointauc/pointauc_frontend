import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { integrations } from '@domains/bids/external-integrations/integrations';
import { useVideoRequestSettings } from '@domains/video-requests/model/hooks';
import { VideoRequest } from '@domains/video-requests/model/types';
import * as Integration from '@models/integration';
import { RootState } from '@reducers';

interface UseSkipVotingParams {
  currentRequest: VideoRequest | null;
  onSkip: () => void;
}

const normalizeCommand = (command: string) => command.trim().toLowerCase();

const getVoterKey = (message: { userId: string | null; username: string }) =>
  message.userId ?? message.username.trim().toLowerCase();

export const useSkipVoting = ({ currentRequest, onSkip }: UseSkipVotingParams) => {
  const settingsQuery = useVideoRequestSettings();
  const twitchUsername = useSelector((state: RootState) => state.user.authData.twitch?.username ?? state.user.username);
  const [voterKeys, setVoterKeys] = useState<string[]>([]);
  const skipVotingSettings = settingsQuery.data?.skipVoting;
  const chatIntegration = integrations.all.find((integration) => integration.id === 'twitch')?.chatIntegration;
  const [connectionState, setConnectionState] = useState<Integration.ChatIntegrationSubscription | null>(
    chatIntegration?.store.state ?? null,
  );
  const requiredVotes = Math.max(1, skipVotingSettings?.requiredVotes ?? 1);
  const isEnabled = Boolean(skipVotingSettings?.isEnabled && currentRequest && twitchUsername);
  const skipCommand = normalizeCommand(skipVotingSettings?.skipCommand ?? '!skip');
  const denyCommand = normalizeCommand(skipVotingSettings?.denyCommand ?? '!noskip');

  useEffect(() => {
    setVoterKeys([]);
  }, [currentRequest?.id]);

  useEffect(() => {
    if (!chatIntegration) {
      return undefined;
    }

    if (!isEnabled || !twitchUsername) {
      void chatIntegration.disconnect();
      return undefined;
    }

    void chatIntegration.connect(twitchUsername);

    return () => {
      void chatIntegration.disconnect();
    };
  }, [chatIntegration, isEnabled, twitchUsername]);

  useEffect(() => {
    if (!chatIntegration) {
      setConnectionState(null);
      return undefined;
    }

    setConnectionState(chatIntegration.store.state);

    return chatIntegration.store.subscribe(() => {
      setConnectionState(chatIntegration.store.state);
    });
  }, [chatIntegration]);

  useEffect(() => {
    if (!chatIntegration || !skipVotingSettings?.isEnabled || !currentRequest) {
      return undefined;
    }

    const handleMessage = (message: Integration.ChatMessage) => {
      const normalizedMessage = normalizeCommand(message.message);
      const voterKey = getVoterKey(message);

      if (!voterKey) {
        return;
      }

      if (normalizedMessage === skipCommand) {
        setVoterKeys((currentVoterKeys) =>
          currentVoterKeys.includes(voterKey) ? currentVoterKeys : [...currentVoterKeys, voterKey],
        );
        return;
      }

      if (skipVotingSettings.allowDenySkip && normalizedMessage === denyCommand) {
        setVoterKeys((currentVoterKeys) => currentVoterKeys.filter((key) => key !== voterKey));
      }
    };

    chatIntegration.events.on('message', handleMessage);

    return () => {
      chatIntegration.events.off('message', handleMessage);
    };
  }, [
    chatIntegration,
    currentRequest,
    denyCommand,
    skipCommand,
    skipVotingSettings?.allowDenySkip,
    skipVotingSettings?.isEnabled,
  ]);

  useEffect(() => {
    if (!skipVotingSettings?.isEnabled || !currentRequest || voterKeys.length < requiredVotes) {
      return;
    }

    setVoterKeys([]);
    onSkip();
  }, [currentRequest, onSkip, requiredVotes, skipVotingSettings?.isEnabled, voterKeys.length]);

  return useMemo(
    () => ({
      isEnabled,
      channel: twitchUsername ?? null,
      requiredVotes,
      voteCount: voterKeys.length,
      remainingVotes: Math.max(0, requiredVotes - voterKeys.length),
      progress: Math.min(1, voterKeys.length / requiredVotes),
      connection: connectionState,
      hasChannel: Boolean(twitchUsername),
    }),
    [connectionState, isEnabled, requiredVotes, twitchUsername, voterKeys.length],
  );
};
