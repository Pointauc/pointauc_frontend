import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import type { ThunkDispatch } from 'redux-thunk';

import { checkHasUserToken } from '@domains/bids/lib/useInitializeUser';
import {
  claimDesktopSyncSession,
  createDesktopSyncSession,
  fetchDesktopSyncStatus,
} from '@domains/desktop/api/desktopSyncApi';
import { importDesktopData } from '@domains/desktop/lib/importDesktopData';
import { getSyncPayloadSummary } from '@domains/desktop/lib/validateSyncPayload';
import { DesktopSyncDataPayload, DesktopSyncSession } from '@domains/desktop/model/types';
import { loadUserData } from '@reducers/AucSettings/AucSettings';
import { getPointaucDesktop } from '@shared/lib/desktop/checkIsDesktop';

export type DesktopSyncFlowStep = 'intro' | 'waiting' | 'file-import' | 'importing' | 'success' | 'error';

export interface UseDesktopSyncFlowOptions {
  initialStep?: DesktopSyncFlowStep;
  autoStartTransfer?: boolean;
  onComplete?: () => void;
}

const POLL_INTERVAL_MS = 1500;

export const useDesktopSyncFlow = ({
  initialStep = 'intro',
  autoStartTransfer = false,
  onComplete,
}: UseDesktopSyncFlowOptions = {}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const [step, setStep] = useState<DesktopSyncFlowStep>(initialStep);
  const [activeSession, setActiveSession] = useState<DesktopSyncSession | null>(null);
  const [syncUrl, setSyncUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isInitializingTransfer, setIsInitializingTransfer] = useState(false);
  const [importedUsername, setImportedUsername] = useState<string | null>(null);
  const [summaryStats, setSummaryStats] = useState<{ archivesCount: number; settingsCount: number }>({
    archivesCount: 0,
    settingsCount: 0,
  });

  const activeSessionRef = useRef<DesktopSyncSession | null>(null);
  const isClaimingRef = useRef(false);
  const hasAutoStartedRef = useRef(false);

  const cleanupSessionPolling = useCallback(() => {
    activeSessionRef.current = null;
    setActiveSession(null);
    isClaimingRef.current = false;
  }, []);

  const handleApplyImportedData = useCallback(
    async (payload: DesktopSyncDataPayload) => {
      setStep('importing');
      try {
        const summary = getSyncPayloadSummary(payload);
        setSummaryStats({
          archivesCount: summary.archivesCount,
          settingsCount: summary.settingsCount,
        });
        setImportedUsername(summary.detectedUsername ?? null);

        await importDesktopData(payload);

        if (checkHasUserToken()) {
          try {
            await dispatch(loadUserData());
          } catch {
            // Ignore user load error during sync
          }
        }

        setStep('success');
      } catch {
        setErrorMessage(t('desktop.splash.error.claimFailed'));
        setStep('error');
      }
    },
    [dispatch, t],
  );

  const handleClaimReadySession = useCallback(
    async (session: DesktopSyncSession) => {
      if (isClaimingRef.current) {
        return;
      }
      isClaimingRef.current = true;

      try {
        setStep('importing');
        const claimResult = await claimDesktopSyncSession(session.sessionId, session.claimToken);
        if (claimResult.success && claimResult.data) {
          await handleApplyImportedData(claimResult.data);
        } else {
          setErrorMessage(t('desktop.splash.error.claimFailed'));
          setStep('error');
        }
      } catch {
        setErrorMessage(t('desktop.splash.error.claimFailed'));
        setStep('error');
      } finally {
        isClaimingRef.current = false;
      }
    },
    [handleApplyImportedData, t],
  );

  const handleStartTransfer = useCallback(async () => {
    setIsInitializingTransfer(true);
    setErrorMessage(null);

    try {
      const session = await createDesktopSyncSession();
      activeSessionRef.current = session;
      setActiveSession(session);

      const desktopBridge = getPointaucDesktop();
      const origin = desktopBridge?.publicOrigin || window.location.origin;
      const transferUrl = `${origin}/desktop-sync?session=${encodeURIComponent(session.sessionId)}`;
      setSyncUrl(transferUrl);

      if (desktopBridge?.openExternal) {
        desktopBridge.openExternal(transferUrl).catch(() => {
          // Ignore external browser open failure
        });
      } else if (typeof window !== 'undefined') {
        window.open(transferUrl, '_blank', 'noopener,noreferrer');
      }

      setStep('waiting');
    } catch {
      setErrorMessage(t('desktop.splash.error.sessionFailed'));
      setStep('error');
    } finally {
      setIsInitializingTransfer(false);
    }
  }, [t]);

  useEffect(() => {
    if (autoStartTransfer && !hasAutoStartedRef.current) {
      hasAutoStartedRef.current = true;
      void handleStartTransfer();
    }
  }, [autoStartTransfer, handleStartTransfer]);

  useEffect(() => {
    if (step !== 'waiting' || !activeSession) {
      return;
    }

    const currentSession = activeSession;
    let isCancelled = false;
    const desktopBridge = getPointaucDesktop();
    let unregisterSyncListener: (() => void) | undefined;

    if (desktopBridge?.onDesktopSyncSession) {
      unregisterSyncListener = desktopBridge.onDesktopSyncSession((incomingSessionId) => {
        if (!isCancelled && incomingSessionId === currentSession.sessionId) {
          void handleClaimReadySession(currentSession);
        }
      });
    }

    const pollInterval = setInterval(async () => {
      if (isCancelled || isClaimingRef.current) {
        return;
      }

      try {
        const response = await fetchDesktopSyncStatus(currentSession.sessionId);
        if (response.status === 'READY') {
          clearInterval(pollInterval);
          if (!isCancelled) {
            await handleClaimReadySession(currentSession);
          }
        } else if (response.status === 'EXPIRED') {
          clearInterval(pollInterval);
          if (!isCancelled) {
            setErrorMessage(t('desktop.splash.error.claimFailed'));
            setStep('error');
          }
        }
      } catch {
        // Continue polling despite occasional network hiccups
      }
    }, POLL_INTERVAL_MS);

    return () => {
      isCancelled = true;
      clearInterval(pollInterval);
      if (unregisterSyncListener) {
        unregisterSyncListener();
      }
    };
  }, [step, activeSession, handleClaimReadySession, t]);

  const handleCancelWaiting = useCallback(() => {
    cleanupSessionPolling();
    setStep(initialStep);
  }, [cleanupSessionPolling, initialStep]);

  const handleSwitchToFileImport = useCallback(() => {
    cleanupSessionPolling();
    setStep('file-import');
  }, [cleanupSessionPolling]);

  const handleLaunchApp = useCallback(() => {
    onComplete?.();
    if (typeof window !== 'undefined' && typeof window.location?.reload === 'function') {
      try {
        window.location.reload();
        return;
      } catch {
        // Fallback if reload is restricted
      }
    }
  }, [onComplete]);

  return {
    step,
    setStep,
    syncUrl,
    errorMessage,
    isInitializingTransfer,
    importedUsername,
    summaryStats,
    handleStartTransfer,
    handleApplyImportedData,
    handleCancelWaiting,
    handleSwitchToFileImport,
    handleLaunchApp,
    cleanupSessionPolling,
  };
};
