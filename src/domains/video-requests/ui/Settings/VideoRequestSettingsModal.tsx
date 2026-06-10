import { Divider, Modal, ScrollArea, Text } from '@mantine/core';
import { useAsyncDebouncer } from '@tanstack/react-pacer/async-debouncer';
import { IconCoin, IconFilter, IconPlayerSkipForward, IconSortAscending } from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { settingsApi } from '@api/userApi';
import PointsIcon from '@assets/icons/channelPoints.svg?react';
import { useSaveVideoRequestSettings, useVideoRequestSettings } from '@domains/video-requests/model/hooks';
import { VideoRequestNextStrategy, VideoRequestSettings, VideoSourceId } from '@domains/video-requests/model/types';
import VideoRequestSettingsActiveSection from '@domains/video-requests/ui/Settings/VideoRequestSettingsActiveSection';
import VideoRequestSettingsNavigation from '@domains/video-requests/ui/Settings/VideoRequestSettingsNavigation';
import { VideoRequestSettingsSectionId } from '@domains/video-requests/ui/Settings/VideoRequestSettingsModal.types';
import { createVideoRequestSettingsPatch } from '@domains/video-requests/ui/Settings/videoRequestSettingsFormUtils';
import { SettingsForm } from '@models/settings.model.ts';
import { RootState } from '@reducers';
import { initialState, saveSettings as saveAuctionSettings } from '@reducers/AucSettings/AucSettings.ts';
import { getDirtyValues } from '@utils/common.utils';

interface VideoRequestSettingsModalProps {
  opened: boolean;
  onClose: () => void;
}

const sourceIds: VideoSourceId[] = ['youtube', 'twitchClip', 'twitchVod'];
const nextStrategies: VideoRequestNextStrategy[] = ['requestOrder', 'biggestBid', 'randomWheel'];
const SETTINGS_AUTOSAVE_WAIT = 200;

interface VideoRequestSettingsAutosavePayload {
  settings: VideoRequestSettings;
}

interface AuctionSettingsAutosavePayload {
  dirtyValues: Partial<SettingsForm>;
  changeVersion: number;
}

const VideoRequestSettingsModal = ({ opened, onClose }: VideoRequestSettingsModalProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const auctionSettings = useSelector((root: RootState) => root.aucSettings.settings);
  const settingsQuery = useVideoRequestSettings();
  const saveSettingsMutation = useSaveVideoRequestSettings();
  const settings = settingsQuery.data;
  const [draft, setDraft] = useState<VideoRequestSettings | null>(null);
  const [activeSection, setActiveSection] = useState<VideoRequestSettingsSectionId>('filters');
  const [sourceSearch, setSourceSearch] = useState('');
  const wasOpenedRef = useRef(false);
  const videoRequestSaveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const auctionSaveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const latestAuctionChangeVersionRef = useRef(0);
  const auctionFormMethods = useForm<SettingsForm>({
    defaultValues: auctionSettings,
    mode: 'onBlur',
  });

  const videoRequestAutosaveDebouncer = useAsyncDebouncer(
    async ({ settings: nextSettings }: VideoRequestSettingsAutosavePayload) => {
      const saveNextSettings = async () => {
        await saveSettingsMutation.mutateAsync(createVideoRequestSettingsPatch(nextSettings));
      };

      videoRequestSaveQueueRef.current = videoRequestSaveQueueRef.current.catch(() => undefined).then(saveNextSettings);

      await videoRequestSaveQueueRef.current;
    },
    {
      wait: SETTINGS_AUTOSAVE_WAIT,
      onError: (err) => {
        console.error('Failed to autosave video request settings', err);
      },
    },
  );

  const auctionAutosaveDebouncer = useAsyncDebouncer(
    async ({ dirtyValues, changeVersion }: AuctionSettingsAutosavePayload) => {
      const saveNextSettings = async () => {
        await auctionFormMethods.handleSubmit(async (values) => {
          await settingsApi.preset.setActiveData(dirtyValues);
          await dispatch(saveAuctionSettings(dirtyValues));

          if (latestAuctionChangeVersionRef.current === changeVersion) {
            auctionFormMethods.reset({ ...values, ...dirtyValues });
          }
        })();
      };

      auctionSaveQueueRef.current = auctionSaveQueueRef.current.catch(() => undefined).then(saveNextSettings);

      await auctionSaveQueueRef.current;
    },
    {
      wait: SETTINGS_AUTOSAVE_WAIT,
      onError: (err) => {
        console.error('Failed to autosave auction settings', err);
      },
    },
  );

  useEffect(() => {
    if (!opened) {
      wasOpenedRef.current = false;
      setDraft(null);
      return;
    }

    if (!wasOpenedRef.current) {
      wasOpenedRef.current = true;
      latestAuctionChangeVersionRef.current += 1;
      setActiveSection('filters');
      auctionFormMethods.reset(auctionSettings);
    }

    if (settings && !draft) {
      setDraft(settings);
    }
  }, [auctionFormMethods, auctionSettings, draft, opened, settings]);

  useEffect(() => {
    if (!opened) {
      return undefined;
    }

    const unsubscribe = auctionFormMethods.subscribe({
      formState: {
        values: true,
        dirtyFields: true,
        touchedFields: true,
      },
      callback: ({ values, dirtyFields, touchedFields }) => {
        const changeVersion = latestAuctionChangeVersionRef.current + 1;
        latestAuctionChangeVersionRef.current = changeVersion;

        const dirtyValues = getDirtyValues(
          (values ?? auctionFormMethods.getValues()) as SettingsForm,
          dirtyFields,
          initialState.settings,
          touchedFields,
        );

        if (Object.keys(dirtyValues).length === 0) {
          return;
        }

        void auctionAutosaveDebouncer.maybeExecute({
          dirtyValues,
          changeVersion,
        });
      },
    });

    return () => {
      unsubscribe();
    };
  }, [auctionAutosaveDebouncer, auctionFormMethods, opened]);

  const sourceOptions = useMemo(
    () =>
      sourceIds.map((sourceId) => ({
        value: sourceId,
        label: t(`videoRequests.sources.${sourceId}`),
      })),
    [t],
  );

  const nextStrategyOptions = useMemo(
    () =>
      nextStrategies.map((strategy) => ({
        value: strategy,
        label: t(`videoRequests.settings.nextStrategies.${strategy}`),
      })),
    [t],
  );

  const navItems = useMemo(
    () => [
      { id: 'filters' as const, icon: <IconFilter size={18} />, label: t('videoRequests.settings.sections.filters') },
      {
        id: 'order' as const,
        icon: <IconSortAscending size={18} />,
        label: t('videoRequests.settings.sections.order'),
        disabled: true,
      },
      {
        id: 'skip' as const,
        icon: <IconPlayerSkipForward size={18} />,
        label: t('videoRequests.settings.sections.skip'),
        disabled: true,
      },
      {
        id: 'points' as const,
        icon: <PointsIcon width={18} height={18} />,
        label: t('videoRequests.settings.sections.points'),
      },
      {
        id: 'donations' as const,
        icon: <IconCoin size={18} />,
        label: t('videoRequests.settings.sections.donations'),
      },
    ],
    [t],
  );

  const handleSettingsChange = useCallback(
    (nextSettings: VideoRequestSettings) => {
      setDraft(nextSettings);
      void videoRequestAutosaveDebouncer.maybeExecute({ settings: nextSettings });
    },
    [videoRequestAutosaveDebouncer],
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('videoRequests.settings.title')}
      centered
      size='60rem'
      h='100%'
      classNames={{
        content: 'bg-paper-800 h-full',
        header: 'bg-paper-800',
        title: 'font-bold',
      }}
    >
      {draft && (
        <FormProvider {...auctionFormMethods}>
          <div className='grid min-h-[34rem] grid-cols-1 gap-4 md:grid-cols-[13rem_minmax(0,1fr)]'>
            <VideoRequestSettingsNavigation
              activeSection={activeSection}
              items={navItems}
              onSectionChange={setActiveSection}
            />

            <div className='flex min-h-0 flex-col'>
              <Text fw={700} className='text-paper-100'>
                {navItems.find((item) => item.id === activeSection)?.label}
              </Text>
              <Divider className='border-paper-800 my-3' />
              <ScrollArea className='min-h-0 flex-1 pr-3' scrollbarSize={8}>
                <VideoRequestSettingsActiveSection
                  activeSection={activeSection}
                  settings={draft}
                  sourceOptions={sourceOptions}
                  sourceIds={sourceIds}
                  sourceSearch={sourceSearch}
                  nextStrategyOptions={nextStrategyOptions}
                  labels={{
                    filters: {
                      supportedPlatforms: t('videoRequests.settings.fields.supportedPlatforms'),
                      selectAll: t('videoRequests.settings.actions.selectAll'),
                      deselectAll: t('videoRequests.settings.actions.deselectAll'),
                      maxLength: t('videoRequests.settings.fields.maxLength'),
                      minutes: t('videoRequests.settings.units.minutes'),
                      minViews: t('videoRequests.settings.fields.minViews'),
                      limitPerViewer: t('videoRequests.settings.fields.limitPerViewer'),
                      maxTotalVideos: t('videoRequests.settings.fields.maxTotalVideos'),
                      maxTotalLength: t('videoRequests.settings.fields.maxTotalLength'),
                    },
                    skip: {
                      skipVotingEnabled: t('videoRequests.settings.fields.skipVotingEnabled'),
                      requiredSkipVotes: t('videoRequests.settings.fields.requiredSkipVotes'),
                      skipCommand: t('videoRequests.settings.fields.skipCommand'),
                      denyCommand: t('videoRequests.settings.fields.denyCommand'),
                      allowDenySkip: t('videoRequests.settings.fields.allowDenySkip'),
                    },
                    conversion: t('settings.donations.conversion'),
                  }}
                  onSearchChange={setSourceSearch}
                  onSettingsChange={handleSettingsChange}
                />
              </ScrollArea>
            </div>
          </div>
        </FormProvider>
      )}
    </Modal>
  );
};

export default VideoRequestSettingsModal;
