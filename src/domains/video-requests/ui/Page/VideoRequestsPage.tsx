import { Loader } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

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

const getCurrentRequest = (queue: VideoRequest[]) => queue[0] ?? null;
const getNextRequest = (queue: VideoRequest[]) => queue[1] ?? null;

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

  const queue = queueQuery.data ?? [];
  const history = historyQuery.data ?? [];
  const currentRequest = getCurrentRequest(queue);
  const nextRequest = getNextRequest(queue);
  const previousRequest = getPreviousRequest(history);
  const isAutoplayEnabled = Boolean(listener.settings?.isAutoplayEnabled);

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

  const completeRequest = async (request: VideoRequest, status: VideoRequestHistoryStatus) => {
    await appendHistoryMutation.mutateAsync({
      ...request,
      status,
    });
    await deleteRequestMutation.mutateAsync(request.id);
  };

  const handleNext = async () => {
    if (!currentRequest) {
      return;
    }

    await completeRequest(currentRequest, 'watched');
  };

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

    await createRequestMutation.mutateAsync({
      ...previousRequest,
      id: crypto.randomUUID(),
      status: 'queued',
      createdAt: new Date().toISOString(),
    });
  };

  const handlePlayerEnded = () => {
    if (currentRequest && isAutoplayEnabled) {
      void completeRequest(currentRequest, 'watched');
    }
  };

  return (
    <main
      className={clsx(
        'bg-paper-950 text-paper-50 min-h-screen',
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
            <div className='min-h-0 flex-1 p-3 lg:p-4'>
              <VideoRequestPlayer
                request={currentRequest}
                isAutoplayEnabled={isAutoplayEnabled}
                listener={listener}
                onEnded={handlePlayerEnded}
              />
            </div>

            {!isTheaterMode && (
              <VideoRequestsUtilityBar
                currentRequest={currentRequest}
                previousRequest={previousRequest}
                nextRequest={nextRequest}
                isAutoplayEnabled={isAutoplayEnabled}
                isTheaterMode={isTheaterMode}
                onPrevious={() => void handlePrevious()}
                onNext={() => void handleNext()}
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
                  true ? 'translate-x-0' : 'translate-x-full',
                )}
                onMouseLeave={() => setIsTheaterPanelOpen(false)}
              >
                <VideoRequestsUtilityBar
                  currentRequest={currentRequest}
                  previousRequest={previousRequest}
                  nextRequest={nextRequest}
                  isAutoplayEnabled={isAutoplayEnabled}
                  isTheaterMode={isTheaterMode}
                  onPrevious={() => void handlePrevious()}
                  onNext={() => void handleNext()}
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
