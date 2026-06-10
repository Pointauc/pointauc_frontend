import { Button, Group, NumberInput, Stack, Switch, TagsInput } from '@mantine/core';

import { VideoRequestSettings, VideoSourceId } from '@domains/video-requests/model/types';
import {
  minutesToSeconds,
  normalizeNumber,
  secondsToMinutes,
} from '@domains/video-requests/ui/Settings/videoRequestSettingsFormUtils';

interface VideoRequestSettingsFiltersSectionProps {
  settings: VideoRequestSettings;
  sourceOptions: { value: VideoSourceId; label: string }[];
  sourceIds: VideoSourceId[];
  sourceSearch: string;
  labels: {
    supportedPlatforms: string;
    selectAll: string;
    deselectAll: string;
    maxLength: string;
    minutes: string;
    minViews: string;
    limitPerViewer: string;
    maxTotalVideos: string;
    maxTotalLength: string;
  };
  onSearchChange: (value: string) => void;
  onSettingsChange: (settings: VideoRequestSettings) => void;
}

const VideoRequestSettingsFiltersSection = ({
  settings,
  sourceOptions,
  sourceIds,
  sourceSearch,
  labels,
  onSearchChange,
  onSettingsChange,
}: VideoRequestSettingsFiltersSectionProps) => {
  const updateLimits = (limits: Partial<VideoRequestSettings['limits']>) => {
    onSettingsChange({
      ...settings,
      limits: {
        ...settings.limits,
        ...limits,
      },
    });
  };

  console.log(settings.supportedSourceIds, sourceOptions);

  return (
    <Stack gap='md'>
      <TagsInput
        label={labels.supportedPlatforms}
        data={sourceIds}
        value={settings.supportedSourceIds}
        searchValue={sourceSearch}
        onSearchChange={onSearchChange}
        onChange={(value) =>
          onSettingsChange({
            ...settings,
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
          onClick={() => onSettingsChange({ ...settings, supportedSourceIds: [...sourceIds] })}
        >
          {labels.selectAll}
        </Button>
        <Button
          variant='subtle'
          color='gray'
          size='xs'
          onClick={() => onSettingsChange({ ...settings, supportedSourceIds: [] })}
        >
          {labels.deselectAll}
        </Button>
      </Group>

      <div className='grid gap-3 sm:grid-cols-2'>
        <NumberInput
          label={labels.maxLength}
          suffix={` ${labels.minutes}`}
          min={0}
          value={secondsToMinutes(settings.limits.maxDurationSeconds) ?? ''}
          onChange={(value) => updateLimits({ maxDurationSeconds: minutesToSeconds(normalizeNumber(value)) })}
        />
        <NumberInput
          label={labels.minViews}
          min={0}
          value={settings.limits.minViewCount ?? ''}
          onChange={(value) => updateLimits({ minViewCount: normalizeNumber(value) })}
        />
      </div>

      <div className='grid gap-3 sm:grid-cols-2'>
        <Stack gap={4}>
          <Switch
            checked={settings.limits.maxRequestsPerUser != null}
            onChange={(event) => updateLimits({ maxRequestsPerUser: event.currentTarget.checked ? 1 : null })}
            label={labels.limitPerViewer}
          />
          <NumberInput
            min={1}
            disabled={settings.limits.maxRequestsPerUser == null}
            value={settings.limits.maxRequestsPerUser ?? 1}
            onChange={(value) => updateLimits({ maxRequestsPerUser: normalizeNumber(value) ?? 1 })}
          />
        </Stack>
        <Stack gap={4}>
          <Switch
            checked={settings.limits.maxQueueSize != null}
            onChange={(event) => updateLimits({ maxQueueSize: event.currentTarget.checked ? 25 : null })}
            label={labels.maxTotalVideos}
          />
          <NumberInput
            min={1}
            disabled={settings.limits.maxQueueSize == null}
            value={settings.limits.maxQueueSize ?? 25}
            onChange={(value) => updateLimits({ maxQueueSize: normalizeNumber(value) ?? 1 })}
          />
        </Stack>
      </div>

      <Stack gap={4}>
        <Switch
          checked={settings.limits.maxTotalDurationSeconds != null}
          onChange={(event) => updateLimits({ maxTotalDurationSeconds: event.currentTarget.checked ? 60 * 60 : null })}
          label={labels.maxTotalLength}
        />
        <NumberInput
          suffix={` ${labels.minutes}`}
          min={1}
          disabled={settings.limits.maxTotalDurationSeconds == null}
          value={secondsToMinutes(settings.limits.maxTotalDurationSeconds) ?? 60}
          onChange={(value) => updateLimits({ maxTotalDurationSeconds: minutesToSeconds(normalizeNumber(value) ?? 1) })}
        />
      </Stack>
    </Stack>
  );
};

export default VideoRequestSettingsFiltersSection;
