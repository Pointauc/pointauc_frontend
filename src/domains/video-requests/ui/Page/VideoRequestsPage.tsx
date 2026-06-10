import { Loader } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { selectNextVideoRequest } from '@domains/video-requests/lib/requestSelection';
import {
  useAppendVideoRequestHistory,
  useClearVideoRequestHistory,
  useClearVideoRequestQueue,
  useCreateVideoRequest,
  useDeleteVideoRequestHistoryRecord,
  useDeleteVideoRequest,
  useReorderVideoRequestQueue,
  useSaveVideoRequestSettings,
  useVideoRequestHistory,
  useVideoRequestQueue,
} from '@domains/video-requests/model/hooks';
import { useSkipVoting } from '@domains/video-requests/model/useSkipVoting';
import { useVideoRequestListener } from '@domains/video-requests/model/useVideoRequestListener';
import {
  VideoRequest,
  VideoRequestHistoryRecord,
  VideoRequestHistoryStatus,
} from '@domains/video-requests/model/types';
import VideoRequestsUtilityBar from '@domains/video-requests/ui/Controls/VideoRequestsUtilityBar';
import VideoRequestDebugPanel from '@domains/video-requests/ui/Debug/VideoRequestDebugPanel';
import VideoRequestPlayer from '@domains/video-requests/ui/Player/VideoRequestPlayer';
import VideoRequestQueue from '@domains/video-requests/ui/Queue/VideoRequestQueue';
import VideoRequestSettingsModal from '@domains/video-requests/ui/Settings/VideoRequestSettingsModal';
import VideoRequestWheelPicker from '@domains/video-requests/ui/Wheel/VideoRequestWheelPicker';
import { useInitializeUser } from '@domains/bids/lib/useInitializeUser';
import { registerGlobalBidFallbackConsumer } from '@domains/bids/lib/globalBidsEventBus';

const getPreviousRequest = (history: VideoRequestHistoryRecord[]) =>
  history.find((request) => request.status === 'watched' || request.status === 'skipped') ?? null;

const getFrontQueueTimestamp = (queue: VideoRequest[]) => {
  const queueTimestamps = queue.map((queueRequest) => Date.parse(queueRequest.createdAt));
  const earliestQueueTimestamp = queueTimestamps.length > 0 ? Math.min(...queueTimestamps) : Date.now();

  return new Date(earliestQueueTimestamp - 1).toISOString();
};

const VideoRequestsPage = () => {
  const listener = useVideoRequestListener();
  const queueQuery = useVideoRequestQueue();
  const historyQuery = useVideoRequestHistory();
  const deleteRequestMutation = useDeleteVideoRequest();
  const clearQueueMutation = useClearVideoRequestQueue();
  const appendHistoryMutation = useAppendVideoRequestHistory();
  const clearHistoryMutation = useClearVideoRequestHistory();
  const deleteHistoryMutation = useDeleteVideoRequestHistoryRecord();
  const reorderQueueMutation = useReorderVideoRequestQueue();
  const saveSettingsMutation = useSaveVideoRequestSettings();
  const createRequestMutation = useCreateVideoRequest();
  const [isSettingsOpened, settingsModal] = useDisclosure(false);
  const [isTheaterMode, theaterMode] = useDisclosure(false);
  const [isTheaterPanelOpen, setIsTheaterPanelOpen] = useState(false);
  const [wheelRequests, setWheelRequests] = useState<VideoRequest[]>([]);
  const [isWheelPicking, setIsWheelPicking] = useState(false);

  const queue = useMemo(() => queueQuery.data ?? [], [queueQuery.data]);
  const history = useMemo(() => historyQuery.data ?? [], [historyQuery.data]);
  const previousRequest = getPreviousRequest(history);
  const isAutoplayEnabled = Boolean(listener.settings?.isAutoplayEnabled);
  const nextStrategy = listener.settings?.nextStrategy ?? 'requestOrder';
  const currentRequest = queue[0] ?? null;
  const remainingRequests = currentRequest ? queue.filter((request) => request.id !== currentRequest.id) : queue;
  const nextRequest = selectNextVideoRequest(remainingRequests, nextStrategy);

  useInitializeUser();

  // useEffect(() => {
  //   return registerGlobalBidFallbackConsumer(async (bid) => {
  //     dispatch(processRedemption(bid));
  //     return true;
  //   });
  // }, [dispatch]);

  useEffect(() => {
    if (queue.length === 0) {
      setIsWheelPicking(false);
      setWheelRequests([]);
    }
  }, [queue.length]);

  useEffect(() => {
    if (!isTheaterMode) {
      setIsTheaterPanelOpen(false);
      return;
    }

    const handlePointerMove = (event: MouseEvent | PointerEvent) => {
      const panelWidth = Math.min(416, window.innerWidth * 0.92);

      if (event.clientX >= window.innerWidth - 112) {
        setIsTheaterPanelOpen(true);
        return;
      }

      if (event.clientX < window.innerWidth - panelWidth - 24) {
        setIsTheaterPanelOpen(false);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('mousemove', handlePointerMove);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('mousemove', handlePointerMove);
    };
  }, [isTheaterMode]);

  const completeRequest = useCallback(
    async (request: VideoRequest, status: VideoRequestHistoryStatus) => {
      await appendHistoryMutation.mutateAsync({
        ...request,
        status,
      });
      await deleteRequestMutation.mutateAsync(request.id);
    },
    [appendHistoryMutation, deleteRequestMutation],
  );

  const advanceCurrentRequest = useCallback(
    async (status: Extract<VideoRequestHistoryStatus, 'watched' | 'skipped'>) => {
      if (!currentRequest && queue.length === 0) {
        return;
      }

      const selectableRequests = currentRequest ? queue.filter((request) => request.id !== currentRequest.id) : queue;

      if (currentRequest) {
        await completeRequest(currentRequest, status);
      }

      if (nextStrategy === 'randomWheel' && selectableRequests.length > 0) {
        setWheelRequests(selectableRequests);
        setIsWheelPicking(true);
        return;
      }

      const selectedRequest = selectNextVideoRequest(selectableRequests, nextStrategy);

      if (selectedRequest) {
        await reorderQueueMutation.mutateAsync([
          selectedRequest.id,
          ...selectableRequests.filter((request) => request.id !== selectedRequest.id).map((request) => request.id),
        ]);
      }
    },
    [completeRequest, currentRequest, nextStrategy, queue, reorderQueueMutation],
  );

  const handleNext = async () => {
    await advanceCurrentRequest('watched');
  };

  const handleSkip = useCallback(() => {
    void advanceCurrentRequest('skipped');
  }, [advanceCurrentRequest]);

  const skipVoting = useSkipVoting({
    currentRequest,
    onSkip: handleSkip,
  });

  const handleRemove = async (id: string) => {
    const request = queue.find((item) => item.id === id);

    if (!request) {
      return;
    }

    await completeRequest(request, 'removed');
  };

  const handlePlayRequest = async (id: string) => {
    if (id === currentRequest?.id) {
      return;
    }

    await reorderQueueMutation.mutateAsync([
      id,
      ...queue.filter((request) => request.id !== id).map((request) => request.id),
    ]);
  };

  const handleMoveRequestToTop = async (id: string) => {
    if (id === currentRequest?.id) {
      return;
    }

    const request = queue.find((queueRequest) => queueRequest.id === id);

    if (!request) {
      return;
    }

    await reorderQueueMutation.mutateAsync([
      request.id,
      ...queue.filter((queueRequest) => queueRequest.id !== id).map((queueRequest) => queueRequest.id),
    ]);
  };

  const restoreHistoryRequest = async (request: VideoRequestHistoryRecord, shouldPlay: boolean) => {
    const restoredRequestId = crypto.randomUUID();
    const createdAt = shouldPlay ? getFrontQueueTimestamp(queue) : new Date().toISOString();

    await createRequestMutation.mutateAsync({
      ...request,
      id: restoredRequestId,
      status: 'queued',
      createdAt,
    });
    await deleteHistoryMutation.mutateAsync(request.id);
  };

  const handleRestoreHistory = async (id: string) => {
    const request = history.find((item) => item.id === id);

    if (!request) {
      return;
    }

    await restoreHistoryRequest(request, false);
  };

  const handlePlayHistory = async (id: string) => {
    const request = history.find((item) => item.id === id);

    if (!request) {
      return;
    }

    await restoreHistoryRequest(request, true);
  };

  const handlePrevious = async () => {
    if (!previousRequest) {
      return;
    }

    const restoredRequestId = crypto.randomUUID();

    await createRequestMutation.mutateAsync({
      ...previousRequest,
      id: restoredRequestId,
      status: 'queued',
      createdAt: getFrontQueueTimestamp(queue),
    });
    await deleteHistoryMutation.mutateAsync(previousRequest.id);
  };

  const handlePlayerEnded = () => {
    if (currentRequest && isAutoplayEnabled) {
      void handleNext();
    }
  };

  const handleWheelWin = async (requestId: string) => {
    await reorderQueueMutation.mutateAsync([
      requestId,
      ...queue
        .filter((request) => request.id !== requestId && request.id !== currentRequest?.id)
        .map((request) => request.id),
    ]);
    setIsWheelPicking(false);
    setWheelRequests([]);
  };

  return (
    <main
      className={clsx(
        'bg-paper-900 text-paper-text min-h-screen',
        isTheaterMode ? 'fixed inset-0 z-50 h-screen overflow-hidden' : 'h-screen overflow-hidden',
      )}
    >
      {import.meta.env.DEV && <VideoRequestDebugPanel />}

      {queueQuery.isLoading || historyQuery.isLoading || listener.isLoading ? (
        <div className='flex h-full items-center justify-center'>
          <Loader color='cyan' />
        </div>
      ) : (
        <div className={clsx('flex h-full min-h-0', isTheaterMode ? 'relative' : 'flex-col lg:flex-row')}>
          <div className='flex min-h-0 flex-1 flex-col'>
            <div className='border-paper-600 bg-paper-950 mt-3 ml-3 min-h-0 flex-1 overflow-hidden rounded-md border'>
              {isWheelPicking ? (
                <VideoRequestWheelPicker
                  requests={wheelRequests}
                  onWin={(requestId) => void handleWheelWin(requestId)}
                />
              ) : (
                <VideoRequestPlayer request={currentRequest} listener={listener} onEnded={handlePlayerEnded} />
              )}
            </div>

            {!isTheaterMode && (
              <VideoRequestsUtilityBar
                currentRequest={currentRequest}
                previousRequest={previousRequest}
                nextRequest={nextRequest}
                isAutoplayEnabled={isAutoplayEnabled}
                isTheaterMode={isTheaterMode}
                nextStrategy={nextStrategy}
                skipVoting={skipVoting}
                onPrevious={() => void handlePrevious()}
                onNext={() => (skipVoting.isEnabled ? handleSkip() : void handleNext())}
                onToggleAutoplay={(isEnabled) =>
                  void saveSettingsMutation.mutateAsync({ isAutoplayEnabled: isEnabled })
                }
                onOpenSettings={settingsModal.open}
                onToggleTheater={theaterMode.toggle}
              />
            )}
          </div>

          {isTheaterMode ? (
            <>
              <div
                className='absolute top-0 right-0 z-20 h-full w-28 bg-transparent'
                onMouseEnter={() => setIsTheaterPanelOpen(true)}
              />
              <div
                className={clsx(
                  'absolute top-0 right-0 z-30 flex h-full w-[min(27rem,94vw)] flex-col gap-3 p-3 transition-transform duration-200 focus-within:translate-x-0',
                  isTheaterPanelOpen ? 'translate-x-0' : 'translate-x-full',
                )}
                onMouseLeave={() => setIsTheaterPanelOpen(false)}
              >
                <VideoRequestsUtilityBar
                  currentRequest={currentRequest}
                  previousRequest={previousRequest}
                  nextRequest={nextRequest}
                  isAutoplayEnabled={isAutoplayEnabled}
                  isTheaterMode={isTheaterMode}
                  nextStrategy={nextStrategy}
                  skipVoting={skipVoting}
                  onPrevious={() => void handlePrevious()}
                  onNext={() => (skipVoting.isEnabled ? handleSkip() : void handleNext())}
                  onToggleAutoplay={(isEnabled) =>
                    void saveSettingsMutation.mutateAsync({ isAutoplayEnabled: isEnabled })
                  }
                  onOpenSettings={settingsModal.open}
                  onToggleTheater={theaterMode.toggle}
                />
                <VideoRequestQueue
                  requests={queue}
                  history={history}
                  currentRequestId={currentRequest?.id ?? null}
                  listener={listener}
                  isClearing={clearQueueMutation.isPending}
                  isClearingHistory={clearHistoryMutation.isPending}
                  isTheaterMode
                  onPlay={(id) => void handlePlayRequest(id)}
                  onMoveToTop={(id) => void handleMoveRequestToTop(id)}
                  onRemove={(id) => void handleRemove(id)}
                  onRestoreHistory={(id) => void handleRestoreHistory(id)}
                  onPlayHistory={(id) => void handlePlayHistory(id)}
                  onDeleteHistory={(id) => void deleteHistoryMutation.mutateAsync(id)}
                  onClear={() => void clearQueueMutation.mutateAsync()}
                  onClearHistory={() => void clearHistoryMutation.mutateAsync()}
                />
              </div>
            </>
          ) : (
            <VideoRequestQueue
              requests={queue}
              history={history}
              currentRequestId={currentRequest?.id ?? null}
              listener={listener}
              isClearing={clearQueueMutation.isPending}
              isClearingHistory={clearHistoryMutation.isPending}
              onPlay={(id) => void handlePlayRequest(id)}
              onMoveToTop={(id) => void handleMoveRequestToTop(id)}
              onRemove={(id) => void handleRemove(id)}
              onRestoreHistory={(id) => void handleRestoreHistory(id)}
              onPlayHistory={(id) => void handlePlayHistory(id)}
              onDeleteHistory={(id) => void deleteHistoryMutation.mutateAsync(id)}
              onClear={() => void clearQueueMutation.mutateAsync()}
              onClearHistory={() => void clearHistoryMutation.mutateAsync()}
            />
          )}
        </div>
      )}

      <VideoRequestSettingsModal opened={isSettingsOpened} onClose={settingsModal.close} />
    </main>
  );
};

export default VideoRequestsPage;
