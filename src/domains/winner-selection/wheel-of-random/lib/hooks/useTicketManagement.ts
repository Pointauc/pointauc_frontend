import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useFormContext, useWatch } from 'react-hook-form';

import {
  signedRandomControllerCreateTicketMutation,
  signedRandomControllerGetActiveTicketOptions,
  signedRandomControllerGetActiveTicketQueryKey,
} from '@api/openapi/@tanstack/react-query.gen';
import {
  ExistingActiveTicketResponseDto,
  SignedRandomControllerGetActiveTicketResponses,
} from '@api/openapi/types.gen';
import { WheelFormat } from '@constants/wheel';

import { DropoutVariant } from '../../BaseWheel/BaseWheel';

interface TicketData {
  ticketId: string;
  createdAt: string;
  quotaLeft: number;
}

export interface RevealedData {
  ticketId: string;
  createdAt: string;
  revealedAt?: string;
  randomNumber?: number | null;
}

interface UseTicketManagementReturn {
  activeTicketId: string | null;
  isCreating: boolean;
  error: Error | null;
  setShouldRevealNumber: (shouldReveal: boolean) => void;
  shouldRevealNumber: boolean;
  availableQuota: number | null;
  setAvailableQuota: (quota: number) => void;
  setRevealedTicketId: (ticketId: string) => void;
  resetRevealedTicket: () => void;
  refreshActiveTicket: () => void;
}

const isValidTicket = (
  ticketData: SignedRandomControllerGetActiveTicketResponses[200],
): ticketData is ExistingActiveTicketResponseDto => {
  return ticketData.ticketId !== null;
};

interface RevealedDataMap {
  ['default']: string | null;
  ['dropout_new']: string | null;
}

interface ShouldRevealNumberMap {
  ['default']: boolean;
  ['dropout_new']: boolean;
}

/**
 * Manages Random.org ticket lifecycle for signed random number generation.
 * Fetches active ticket on mount, auto-creates if none exists, and tracks revealed data.
 */
const useTicketManagement = (isEnabled: boolean): UseTicketManagementReturn => {
  const [shouldRevealNumber, setShouldRevealNumber] = useState<ShouldRevealNumberMap>({
    default: false,
    dropout_new: false,
  });
  const [revealedData, setRevealedData] = useState<RevealedDataMap>({
    default: null,
    dropout_new: null,
  });
  const queryClient = useQueryClient();
  const { control } = useFormContext<Wheel.Settings>();
  const format = useWatch<Wheel.Settings>({ name: 'format', control });
  const dropoutVariant = useWatch<Wheel.Settings>({ name: 'dropoutVariant', control });

  const mapKey = useMemo<keyof RevealedDataMap | null>(() => {
    if (format === WheelFormat.Default) {
      return 'default';
    } else if (format === WheelFormat.Dropout && dropoutVariant === DropoutVariant.New) {
      return 'dropout_new';
    }
    return null;
  }, [format, dropoutVariant]);

  // Query for active ticket
  const activeTicketQuery = useQuery({
    ...signedRandomControllerGetActiveTicketOptions(),
    enabled: isEnabled,
  });

  const activeTicket = activeTicketQuery.data && isValidTicket(activeTicketQuery.data) ? activeTicketQuery.data : null;

  // Mutation for creating ticket
  const createTicketMutation = useMutation({
    ...signedRandomControllerCreateTicketMutation(),
    onSuccess: (data) => {
      queryClient.setQueryData(signedRandomControllerGetActiveTicketQueryKey(), data);
    },
  });

  // Auto-create ticket if none exists
  if (
    isEnabled &&
    !activeTicketQuery.isLoading &&
    !activeTicket &&
    !createTicketMutation.isPending &&
    !createTicketMutation.isError &&
    !activeTicketQuery.isError
  ) {
    createTicketMutation.mutate({});
  }

  const activeTicketData =
    activeTicketQuery.data && isValidTicket(activeTicketQuery.data)
      ? {
          activeTicketId: activeTicketQuery.data.ticketId,
          availableQuota: activeTicketQuery.data.quotaLeft,
        }
      : { activeTicketId: null, availableQuota: null };

  const setAvailableQuota = (quota: number) => {
    queryClient.setQueryData(signedRandomControllerGetActiveTicketQueryKey(), {
      ...activeTicketQuery.data,
      quotaLeft: quota,
    });
  };

  const setRevealedTicketId = (ticketId: string) => {
    if (mapKey) {
      setRevealedData((prev) => ({ ...prev, [mapKey]: ticketId }));
    }
  };

  const resetRevealedTicket = () => {
    if (mapKey) {
      setRevealedData((prev) => ({ ...prev, [mapKey]: null }));
      setShouldRevealNumber((prev) => ({ ...prev, [mapKey]: false }));
    }
  };

  const refreshActiveTicket = () => {
    activeTicketQuery.refetch();
  };

  return {
    ...activeTicketData,
    activeTicketId: mapKey && revealedData[mapKey] ? revealedData[mapKey] : activeTicketData.activeTicketId,
    isCreating: createTicketMutation.isPending || activeTicketQuery.isLoading,
    error: createTicketMutation.error || activeTicketQuery.error,
    setShouldRevealNumber: (shouldReveal: boolean) => {
      if (mapKey) {
        setShouldRevealNumber((prev) => ({ ...prev, [mapKey]: shouldReveal }));
      }
    },
    shouldRevealNumber: mapKey ? shouldRevealNumber[mapKey] : false,
    setAvailableQuota,
    setRevealedTicketId,
    resetRevealedTicket,
    refreshActiveTicket,
  };
};

export default useTicketManagement;
