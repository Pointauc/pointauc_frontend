import { useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useMutation } from '@tanstack/react-query';

import { broadcastingControllerBroadcastRulesMutation } from '@api/openapi/@tanstack/react-query.gen';
import { RootState } from '@reducers/index';

import { Broadcasting } from '../model/types';
import { store } from '../../../main';

import type { JSONContent } from '@tiptap/react';

interface RulesBroadcastingHooks {
  broadcastRules: (content: JSONContent) => void;
}

interface RulesBroadcastingProps {
  currentRuleContent: JSONContent | null;
}

export const useRulesBroadcasting = ({ currentRuleContent }: RulesBroadcastingProps) => {
  const socket = useSelector((state: RootState) => state.broadcasting.socket);

  const { mutate: broadcastRules } = useMutation({
    ...broadcastingControllerBroadcastRulesMutation(),
  });

  const broadcastRulesContent = useCallback(
    (content: JSONContent) => {
      if (!store.getState().broadcasting.broadcastingData.rules) return;

      // Broadcast the JSONContent as a string so the overlay can render it properly
      const text = JSON.stringify(content);

      broadcastRules({
        body: {
          data: {
            text,
          },
        },
      });
    },
    [broadcastRules],
  );

  useEffect(() => {
    if (socket) {
      const handleUpdatesRequested = (data: Broadcasting.DataRequestPayload) => {
        if (data.dataType === 'rules' && currentRuleContent) {
          broadcastRulesContent(currentRuleContent);
        }
      };

      if (currentRuleContent && store.getState().broadcasting.broadcastingData.rules) {
        broadcastRulesContent(currentRuleContent);
      }

      socket.on('updatesRequested', handleUpdatesRequested);

      return () => {
        socket.off('updatesRequested', handleUpdatesRequested);
      };
    }
  }, [socket, currentRuleContent, broadcastRulesContent]);
};
