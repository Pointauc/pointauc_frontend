import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useFormContext, useWatch } from 'react-hook-form';
import { notifications } from '@mantine/notifications';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';

import {
  ticketsControllerGetActiveTicketOptions,
  ticketsControllerGetActiveTicketQueryKey,
  ticketsControllerRevealTicketForViewersMutation,
  ticketsControllerRevealTicketMutation,
} from '@api/openapi/@tanstack/react-query.gen';
import {
  ActiveTicketResponseDto,
  ParticipantDto,
  RevealTicketResponseDto,
} from '@api/openapi/types.gen';
import { WheelFormat } from '@constants/wheel';

import { DropoutVariant } from '../../BaseWheel/DropoutVariant';

/** Data of a ticket that was revealed by a spin (kept until the ticket is reset) */
export interface RevealedTicketData {
  ticketId: string;
  createdAt: string;
  revealedAt: string;
  randomNumber: number;
}

/** Data displayed on the ticket card: the active ticket while waiting, or the revealed one after a spin */
export interface RevealedData {
  ticketId: string;
  createdAt: string;
  revealedAt?: string;
  randomNumber?: number | null;
}

type FormatKey = 'default' | 'dropout_new';

interface RevealErrorData {
  statusCode?: number;
  message?: string;
  code?: string;
}

interface UseTicketManagementReturn {
  activeTicket: ActiveTicketResponseDto | null;
  /** True while the active ticket is being fetched or a ticket is being revealed */
  isBusy: boolean;
  error: Error | null;
  revealedTicket: RevealedTicketData | null;
  shouldRevealNumber: boolean;
  setShouldRevealNumber: (shouldReveal: boolean) => void;
  /** Reveals the active ticket and binds the participants list to it (called when a spin starts) */
  revealTicket: (participants: ParticipantDto[]) => Promise<RevealTicketResponseDto>;
  /** Publishes the revealed ticket result to viewers (called when the spin animation ends) */
  revealTicketForViewers: (ticketId: string) => Promise<void>;
  resetRevealedTicket: () => void;
}

/**
 * Manages the viewer verifiable spin ticket lifecycle.
 * The active ticket is fetched (and auto-created by the backend) on mount;
 * revealing happens when a spin starts, publishing to viewers when the animation ends.
 */
const useTicketManagement = (isEnabled: boolean): UseTicketManagementReturn => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { control } = useFormContext<Wheel.Settings>();
  const format = useWatch<Wheel.Settings>({ name: 'format', control });
  const dropoutVariant = useWatch<Wheel.Settings>({ name: 'dropoutVariant', control });

  const [revealedTickets, setRevealedTickets] = useState<Record<FormatKey, RevealedTicketData | null>>({
    default: null,
    dropout_new: null,
  });
  const [shouldRevealNumberMap, setShouldRevealNumberMap] = useState<Record<FormatKey, boolean>>({
    default: false,
    dropout_new: false,
  });

  const mapKey = useMemo<FormatKey | null>(() => {
    if (format === WheelFormat.Default) {
      return 'default';
    } else if (format === WheelFormat.Dropout && dropoutVariant === DropoutVariant.New) {
      return 'dropout_new';
    }
    return null;
  }, [format, dropoutVariant]);

  const activeTicketQuery = useQuery({
    ...ticketsControllerGetActiveTicketOptions(),
    enabled: isEnabled,
  });

  const revealTicketMutation = useMutation({
    ...ticketsControllerRevealTicketMutation(),
    onError: (error: AxiosError<RevealErrorData>) => {
      const errorCode = error?.response?.data?.code;

      if (errorCode === 'NO_ACTIVE_TICKET') {
        // A fresh ticket is created automatically, the user just needs to retry the spin
        queryClient.invalidateQueries({ queryKey: ticketsControllerGetActiveTicketQueryKey() });
        notifications.show({
          message: t('wheel.ticket.noActiveTicket'),
          color: 'orange',
          autoClose: 10000,
          withCloseButton: true,
        });
        return;
      }

      if (errorCode === 'TICKET_HAS_BEEN_USED') {
        // The ticket was not consumed, the user can simply retry the spin
        notifications.show({
          message: t('wheel.ticket.ticketHasBeenUsed'),
          color: 'orange',
          autoClose: 10000,
          withCloseButton: true,
        });
        return;
      }

      notifications.show({
        title: t('wheel.ticket.spinUnknownErrorTitle'),
        message: t('wheel.ticket.spinUnknownErrorMessage', { error: error?.response?.data?.message }),
        color: 'red',
        autoClose: 10000,
        withCloseButton: true,
      });
    },
  });

  const revealForViewersMutation = useMutation({
    ...ticketsControllerRevealTicketForViewersMutation(),
    onError: () => {
      notifications.show({
        title: t('wheel.ticket.errorTitle'),
        message: t('wheel.ticket.unknownError'),
        color: 'red',
        autoClose: 10000,
        withCloseButton: true,
      });
    },
  });

  const revealTicket = async (participants: ParticipantDto[]): Promise<RevealTicketResponseDto> => {
    const response = await revealTicketMutation.mutateAsync({
      body: { participants },
    });

    if (mapKey) {
      setRevealedTickets((prev) => ({
        ...prev,
        [mapKey]: {
          ticketId: response.ticketId,
          createdAt: response.createdAt,
          revealedAt: response.revealedAt,
          randomNumber: response.randomNumber,
        },
      }));
    }

    // Reveal creates a fresh active ticket server-side, so the cached one is stale now
    queryClient.invalidateQueries({ queryKey: ticketsControllerGetActiveTicketQueryKey() });

    return response;
  };

  const revealTicketForViewers = async (ticketId: string): Promise<void> => {
    await revealForViewersMutation.mutateAsync({ path: { ticketId } });
  };

  const resetRevealedTicket = () => {
    if (mapKey) {
      setRevealedTickets((prev) => ({ ...prev, [mapKey]: null }));
      setShouldRevealNumberMap((prev) => ({ ...prev, [mapKey]: false }));
    }
  };

  return {
    activeTicket: activeTicketQuery.data ?? null,
    isBusy: activeTicketQuery.isLoading || revealTicketMutation.isPending,
    error: activeTicketQuery.error,
    revealedTicket: mapKey ? revealedTickets[mapKey] : null,
    shouldRevealNumber: mapKey ? shouldRevealNumberMap[mapKey] : false,
    setShouldRevealNumber: (shouldReveal: boolean) => {
      if (mapKey) {
        setShouldRevealNumberMap((prev) => ({ ...prev, [mapKey]: shouldReveal }));
      }
    },
    revealTicket,
    revealTicketForViewers,
    resetRevealedTicket,
  };
};

export default useTicketManagement;
