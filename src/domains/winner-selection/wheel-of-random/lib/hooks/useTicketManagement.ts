import { useEffect, useMemo, useRef, useState } from 'react';
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

/** Error body returned by the backend when ticket generation is rate limited (HTTP 429) */
interface RateLimitErrorData extends RevealErrorData {
  retryAfterMs?: number;
}

/** How often the rate limit countdown state is refreshed */
const RATE_LIMIT_TICK_MS = 250;

interface UseTicketManagementReturn {
  activeTicket: ActiveTicketResponseDto | null;
  /** True while the active ticket is being fetched or a ticket is being revealed */
  isBusy: boolean;
  error: Error | null;
  /**
   * Milliseconds left until a new ticket can be generated, ticking down while the
   * backend rate limits the request (one ticket every 2 seconds per user).
   * Null when not rate limited. Once it reaches zero the ticket is fetched again.
   */
  rateLimitRemainingMs: number | null;
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

  const [rateLimitRemainingMs, setRateLimitRemainingMs] = useState<number | null>(null);
  const rateLimitDeadlineRef = useRef<number | null>(null);

  /**
   * Rate limit feedback: while the backend refuses to generate a new ticket
   * (429 RATE_LIMITED), keep a live countdown of the remaining cooldown and
   * fetch the ticket again once it expires.
   */
  useEffect(() => {
    const rateLimitError = activeTicketQuery.error as AxiosError<RateLimitErrorData> | null;
    const retryAfterMs =
      rateLimitError?.response?.data?.code === 'RATE_LIMITED'
        ? rateLimitError.response.data.retryAfterMs
        : undefined;

    if (retryAfterMs == null) {
      rateLimitDeadlineRef.current = null;
      setRateLimitRemainingMs(null);
      return;
    }

    const deadline = Date.now() + Math.max(retryAfterMs, RATE_LIMIT_TICK_MS);
    rateLimitDeadlineRef.current = deadline;
    setRateLimitRemainingMs(deadline - Date.now());

    const tick = setInterval(() => {
      const remaining = (rateLimitDeadlineRef.current ?? 0) - Date.now();

      if (remaining > 0) {
        setRateLimitRemainingMs(remaining);
        return;
      }

      // The cooldown has passed: request the ticket again
      clearInterval(tick);
      rateLimitDeadlineRef.current = null;
      setRateLimitRemainingMs(null);
      activeTicketQuery.refetch();
    }, RATE_LIMIT_TICK_MS);

    return () => clearInterval(tick);
    // activeTicketQuery.error and .refetch are the stable slice the effect needs;
    // depending on the whole query object would restart the countdown every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTicketQuery.error, activeTicketQuery.refetch]);

  // While rate limited the ticket card shows the countdown, so the error must
  // not surface through the generic error alert as well. Covers the refetch
  // window after the countdown ends, while the stale 429 is still on the query.
  const ticketError = activeTicketQuery.error as AxiosError<RateLimitErrorData> | null;
  const isRateLimited =
    rateLimitRemainingMs != null || ticketError?.response?.data?.code === 'RATE_LIMITED';

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
    error: isRateLimited ? null : activeTicketQuery.error,
    rateLimitRemainingMs,
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
