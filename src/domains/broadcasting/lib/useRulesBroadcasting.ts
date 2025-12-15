import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useMutation } from '@tanstack/react-query';

import { broadcastingControllerBroadcastRulesMutation } from '@api/openapi/@tanstack/react-query.gen';
import { RootState } from '@reducers/index';

import type { JSONContent } from '@tiptap/react';

interface RulesBroadcastingHooks {
  broadcastRules: (content: JSONContent) => void;
}

export const useRulesBroadcasting = (): RulesBroadcastingHooks => {
  const isBroadcastEnabled = useSelector((state: RootState) => state.broadcasting.broadcastingData.rules);

  const { mutate: broadcastRules } = useMutation({
    ...broadcastingControllerBroadcastRulesMutation(),
  });

  const broadcastRulesContent = useCallback(
    (content: JSONContent) => {
      if (!isBroadcastEnabled) return;

      console.log('broadcastRulesContent', content);

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
    [broadcastRules, isBroadcastEnabled],
  );

  return useMemo(
    () => ({
      broadcastRules: broadcastRulesContent,
    }),
    [broadcastRulesContent],
  );
};
