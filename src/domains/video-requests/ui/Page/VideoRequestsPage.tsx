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
  useDeleteVideoRequest,
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
import VideoRequestHistoryModal from '@domains/video-requests/ui/History/VideoRequestHistoryModal';
import VideoRequestPlayer from '@domains/video-requests/ui/Player/VideoRequestPlayer';
import VideoRequestQueue from '@domains/video-requests/ui/Queue/VideoRequestQueue';
import VideoRequestSettingsModal from '@domains/video-requests/ui/Settings/VideoRequestSettingsModal';
import VideoRequestWheelPicker from '@domains/video-requests/ui/Wheel/VideoRequestWheelPicker';

const getRemainingRequests = (queue: VideoRequest[], currentRequestId: string | null) =>
  currentRequestId ? queue.filter((request) => request.id !== currentRequestId) : queue;

const getPreviousRequest = (history: VideoRequestHistoryRecord[]) =>
  history.find((request) => request.status === 'watched' || request.status === 'skipped') ?? null;

const VideoRequestsPage = () => {
  const listener = useVideoRequestListener();
  const queueQuery = useVideoRequestQueue();
  const historyQuery = useVideoRequestHistory();
  const deleteRequestMutation = useDeleteVideoRequest();
  const clearQueueMutation = useClearVideoRequestQueue();
  const appendHistoryMutation = useAppendVideoRequestHistory();
  const clearHistoryMutation = useClearVideoRequestHistory();
  const saveSettingsMutation = useSaveVideoRequestSettings();
  const createRequestMutation = useCreateVideoRequest();
  const [isHistoryOpened, historyModal] = useDisclosure(false);
  const [isSettingsOpened, settingsModal] = useDisclosure(false);
  const [isTheaterMode, theaterMode] = useDisclosure(false);
  const [isTheaterPanelOpen, setIsTheaterPanelOpen] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [wheelRequests, setWheelRequests] = useState<VideoRequest[]>([]);
  const [isWheelPicking, setIsWheelPicking] = useState(false);

  const queue = useMemo(() => queueQuery.data ?? [], [queueQuery.data]);
  const history = useMemo(() => historyQuery.data ?? [], [historyQuery.data]);
  const previousRequest = getPreviousRequest(history);
  const isAutoplayEnabled = Boolean(listener.settings?.isAutoplayEnabled);
  const nextStrategy = listener.settings?.nextStrategy ?? 'requestOrder';
  const currentRequest =
    queue.find((request) => request.id === currentRequestId) ??
    selectNextVideoRequest(queue, nextStrategy);
  const remainingRequests = getRemainingRequests(queue, currentRequest?.id ?? null);
  const nextRequest = selectNextVideoRequest(remainingRequests, nextStrategy);

  useEffect(() => {
    if (queue.length === 0) {
      setCurrentRequestId(null);
      setIsWheelPicking(false);
      setWheelRequests([]);
      return;
    }

    if (!currentRequest || !queue.some((request) => request.id === currentRequest.id)) {
      setCurrentRequestId(selectNextVideoRequest(queue, nextStrategy)?.id ?? null);
    }
  }, [currentRequest, nextStrategy, queue]);

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

  const completeRequest = useCallback(async (request: VideoRequest, status: VideoRequestHistoryStatus) => {
    await appendHistoryMutation.mutateAsync({
      ...request,
      status,
    });
    await deleteRequestMutation.mutateAsync(request.id);
  }, [appendHistoryMutation, deleteRequestMutation]);

  const advanceCurrentRequest = useCallback(async (status: Extract<VideoRequestHistoryStatus, 'watched' | 'skipped'>) => {
    if (!currentRequest && queue.length === 0) {
      return;
    }

    const selectableRequests = getRemainingRequests(queue, currentRequest?.id ?? null);

    if (currentRequest) {
      await completeRequest(currentRequest, status);
    }

    if (nextStrategy === 'randomWheel' && selectableRequests.length > 0) {
      setWheelRequests(selectableRequests);
      setIsWheelPicking(true);
      return;
    }

    setCurrentRequestId(selectNextVideoRequest(selectableRequests, nextStrategy)?.id ?? null);
  }, [completeRequest, currentRequest, nextStrategy, queue]);

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

  const handlePrevious = async () => {
    if (!previousRequest) {
      return;
    }

    const restoredRequestId = crypto.randomUUID();

    await createRequestMutation.mutateAsync({
      ...previousRequest,
      id: restoredRequestId,
      status: 'queued',
      createdAt: new Date().toISOString(),
    });
    setCurrentRequestId(restoredRequestId);
  };

  const handlePlayerEnded = () => {
    if (currentRequest && isAutoplayEnabled) {
      void handleNext();
    }
  };

  const handleWheelWin = (requestId: string) => {
    setCurrentRequestId(requestId);
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
                <VideoRequestWheelPicker requests={wheelRequests} onWin={handleWheelWin} />
              ) : (
                <VideoRequestPlayer
                  request={currentRequest}
                  listener={listener}
                  onEnded={handlePlayerEnded}
                />
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
                onOpenHistory={historyModal.open}
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
                  onOpenHistory={historyModal.open}
                  onOpenSettings={settingsModal.open}
                  onToggleTheater={theaterMode.toggle}
                />
                <VideoRequestQueue
                  requests={queue}
                  currentRequestId={currentRequest?.id ?? null}
                  listener={listener}
                  isClearing={clearQueueMutation.isPending}
                  isTheaterMode
                  onRemove={(id) => void handleRemove(id)}
                  onClear={() => void clearQueueMutation.mutateAsync()}
                />
              </div>
            </>
          ) : (
            <VideoRequestQueue
              requests={queue}
              currentRequestId={currentRequest?.id ?? null}
              listener={listener}
              isClearing={clearQueueMutation.isPending}
              onRemove={(id) => void handleRemove(id)}
              onClear={() => void clearQueueMutation.mutateAsync()}
            />
          )}
        </div>
      )}

      <VideoRequestHistoryModal
        opened={isHistoryOpened}
        history={history}
        isClearing={clearHistoryMutation.isPending}
        onClose={historyModal.close}
        onClear={() => void clearHistoryMutation.mutateAsync()}
      />
      <VideoRequestSettingsModal opened={isSettingsOpened} onClose={settingsModal.close} />
    </main>
  );
};

export default VideoRequestsPage;
