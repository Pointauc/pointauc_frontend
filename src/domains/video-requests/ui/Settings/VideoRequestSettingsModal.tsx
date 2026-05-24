import {
  Button,
  Divider,
  Group,
  Modal,
  NumberInput,
  SegmentedControl,
  Stack,
  Switch,
  TagsInput,
  Text,
} from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  useSaveVideoRequestSettings,
  useVideoRequestSettings,
} from '@domains/video-requests/model/hooks';
import {
  VideoRequestNextStrategy,
  VideoRequestSettings,
  VideoSourceId,
} from '@domains/video-requests/model/types';

interface VideoRequestSettingsModalProps {
  opened: boolean;
  onClose: () => void;
}

const sourceIds: VideoSourceId[] = ['youtube', 'twitchClip', 'twitchVod'];
const nextStrategies: VideoRequestNextStrategy[] = ['requestOrder', 'biggestBid', 'randomWheel'];

const secondsToMinutes = (seconds: number | null) => (seconds == null ? null : Math.round(seconds / 60));
const minutesToSeconds = (minutes: number | null) => (minutes == null ? null : minutes * 60);

const normalizeNumber = (value: string | number | null) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }

  return Math.max(0, Math.floor(value));
};

const VideoRequestSettingsModal = ({ opened, onClose }: VideoRequestSettingsModalProps) => {
  const { t } = useTranslation();
  const settingsQuery = useVideoRequestSettings();
  const saveSettingsMutation = useSaveVideoRequestSettings();
  const settings = settingsQuery.data;
  const [draft, setDraft] = useState<VideoRequestSettings | null>(null);
  const [sourceSearch, setSourceSearch] = useState('');

  useEffect(() => {
    if (opened && settings) {
      setDraft(settings);
    }
  }, [opened, settings]);

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

  const updateLimits = (limits: Partial<VideoRequestSettings['limits']>) => {
    setDraft((currentDraft) =>
      currentDraft
        ? {
            ...currentDraft,
            limits: {
              ...currentDraft.limits,
              ...limits,
            },
          }
        : currentDraft,
    );
  };

  const updateSkipVoting = (skipVoting: Partial<VideoRequestSettings['skipVoting']>) => {
    setDraft((currentDraft) =>
      currentDraft
        ? {
            ...currentDraft,
            skipVoting: {
              ...currentDraft.skipVoting,
              ...skipVoting,
            },
          }
        : currentDraft,
    );
  };

  const saveSettings = async () => {
    if (!draft) {
      return;
    }

    await saveSettingsMutation.mutateAsync({
      supportedSourceIds: draft.supportedSourceIds,
      isAutoplayEnabled: draft.isAutoplayEnabled,
      nextStrategy: draft.nextStrategy,
      skipVoting: draft.skipVoting,
      limits: draft.limits,
    });
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('videoRequests.settings.title')}
      centered
      size='lg'
      classNames={{
        content: 'bg-paper-950 text-paper-50',
        header: 'bg-paper-950 text-paper-50',
        title: 'font-bold',
      }}
    >
      {draft && (
        <Stack gap='lg'>
          <Stack gap='sm'>
            <Text fw={700} className='text-paper-100'>
              {t('videoRequests.settings.sections.filters')}
            </Text>
            <TagsInput
              label={t('videoRequests.settings.fields.supportedPlatforms')}
              data={sourceOptions}
              value={draft.supportedSourceIds}
              searchValue={sourceSearch}
              onSearchChange={setSourceSearch}
              onChange={(value) =>
                setDraft({
                  ...draft,
                  supportedSourceIds: value.filter((item): item is VideoSourceId =>
                    sourceIds.includes(item as VideoSourceId),
                  ),
                })
              }
            />
            <Group gap='xs'>
              <Button
                variant='light'
                size='xs'
                onClick={() => setDraft({ ...draft, supportedSourceIds: [...sourceIds] })}
              >
                {t('videoRequests.settings.actions.selectAll')}
              </Button>
              <Button
                variant='subtle'
                color='gray'
                size='xs'
                onClick={() => setDraft({ ...draft, supportedSourceIds: [] })}
              >
                {t('videoRequests.settings.actions.deselectAll')}
              </Button>
            </Group>

            <div className='grid gap-3 sm:grid-cols-2'>
              <NumberInput
                label={t('videoRequests.settings.fields.maxLength')}
                suffix={` ${t('videoRequests.settings.units.minutes')}`}
                min={0}
                value={secondsToMinutes(draft.limits.maxDurationSeconds) ?? ''}
                onChange={(value) => updateLimits({ maxDurationSeconds: minutesToSeconds(normalizeNumber(value)) })}
              />
              <NumberInput
                label={t('videoRequests.settings.fields.minViews')}
                min={0}
                value={draft.limits.minViewCount ?? ''}
                onChange={(value) => updateLimits({ minViewCount: normalizeNumber(value) })}
              />
            </div>

            <div className='grid gap-3 sm:grid-cols-2'>
              <Stack gap={4}>
                <Switch
                  checked={draft.limits.maxRequestsPerUser != null}
                  onChange={(event) =>
                    updateLimits({ maxRequestsPerUser: event.currentTarget.checked ? 1 : null })
                  }
                  label={t('videoRequests.settings.fields.limitPerViewer')}
                />
                <NumberInput
                  min={1}
                  disabled={draft.limits.maxRequestsPerUser == null}
                  value={draft.limits.maxRequestsPerUser ?? 1}
                  onChange={(value) => updateLimits({ maxRequestsPerUser: normalizeNumber(value) ?? 1 })}
                />
              </Stack>
              <Stack gap={4}>
                <Switch
                  checked={draft.limits.maxQueueSize != null}
                  onChange={(event) =>
                    updateLimits({ maxQueueSize: event.currentTarget.checked ? 25 : null })
                  }
                  label={t('videoRequests.settings.fields.maxTotalVideos')}
                />
                <NumberInput
                  min={1}
                  disabled={draft.limits.maxQueueSize == null}
                  value={draft.limits.maxQueueSize ?? 25}
                  onChange={(value) => updateLimits({ maxQueueSize: normalizeNumber(value) ?? 1 })}
                />
              </Stack>
            </div>

            <Stack gap={4}>
              <Switch
                checked={draft.limits.maxTotalDurationSeconds != null}
                onChange={(event) =>
                  updateLimits({ maxTotalDurationSeconds: event.currentTarget.checked ? 60 * 60 : null })
                }
                label={t('videoRequests.settings.fields.maxTotalLength')}
              />
              <NumberInput
                suffix={` ${t('videoRequests.settings.units.minutes')}`}
                min={1}
                disabled={draft.limits.maxTotalDurationSeconds == null}
                value={secondsToMinutes(draft.limits.maxTotalDurationSeconds) ?? 60}
                onChange={(value) =>
                  updateLimits({ maxTotalDurationSeconds: minutesToSeconds(normalizeNumber(value) ?? 1) })
                }
              />
            </Stack>
          </Stack>

          <Divider className='border-paper-800' />

          <Stack gap='sm'>
            <Text fw={700} className='text-paper-100'>
              {t('videoRequests.settings.sections.nextSelection')}
            </Text>
            <SegmentedControl
              fullWidth
              value={draft.nextStrategy}
              data={nextStrategyOptions}
              onChange={(value) =>
                setDraft({ ...draft, nextStrategy: value as VideoRequestNextStrategy })
              }
            />
          </Stack>

          <Divider className='border-paper-800' />

          <Stack gap='sm'>
            <Text fw={700} className='text-paper-100'>
              {t('videoRequests.settings.sections.skipVoting')}
            </Text>
            <Switch
              checked={draft.skipVoting.isEnabled}
              onChange={(event) => updateSkipVoting({ isEnabled: event.currentTarget.checked })}
              label={t('videoRequests.settings.fields.skipVotingEnabled')}
            />
            <NumberInput
              label={t('videoRequests.settings.fields.requiredSkipVotes')}
              min={1}
              disabled={!draft.skipVoting.isEnabled}
              value={draft.skipVoting.requiredVotes}
              onChange={(value) => updateSkipVoting({ requiredVotes: normalizeNumber(value) ?? 1 })}
            />
          </Stack>

          <Group justify='end'>
            <Button variant='subtle' color='gray' onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button loading={saveSettingsMutation.isPending} onClick={() => void saveSettings()}>
              {t('common.save')}
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
};

export default VideoRequestSettingsModal;
