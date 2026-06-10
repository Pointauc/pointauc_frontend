import { NumberInput, Stack, Switch, TextInput } from '@mantine/core';

import { VideoRequestSettings } from '@domains/video-requests/model/types';
import { normalizeNumber } from '@domains/video-requests/ui/Settings/videoRequestSettingsFormUtils';

interface VideoRequestSettingsSkipSectionProps {
  settings: VideoRequestSettings;
  labels: {
    skipVotingEnabled: string;
    requiredSkipVotes: string;
    skipCommand: string;
    denyCommand: string;
    allowDenySkip: string;
  };
  onSettingsChange: (settings: VideoRequestSettings) => void;
}

const VideoRequestSettingsSkipSection = ({
  settings,
  labels,
  onSettingsChange,
}: VideoRequestSettingsSkipSectionProps) => {
  const updateSkipVoting = (skipVoting: Partial<VideoRequestSettings['skipVoting']>) => {
    onSettingsChange({
      ...settings,
      skipVoting: {
        ...settings.skipVoting,
        ...skipVoting,
      },
    });
  };

  return (
    <Stack gap='sm'>
      <Switch
        checked={settings.skipVoting.isEnabled}
        onChange={(event) => updateSkipVoting({ isEnabled: event.currentTarget.checked })}
        label={labels.skipVotingEnabled}
      />
      <NumberInput
        label={labels.requiredSkipVotes}
        min={1}
        disabled={!settings.skipVoting.isEnabled}
        value={settings.skipVoting.requiredVotes}
        onChange={(value) => updateSkipVoting({ requiredVotes: normalizeNumber(value) ?? 1 })}
      />
      <div className='grid gap-3 sm:grid-cols-2'>
        <TextInput
          label={labels.skipCommand}
          disabled={!settings.skipVoting.isEnabled}
          value={settings.skipVoting.skipCommand}
          onChange={(event) => updateSkipVoting({ skipCommand: event.currentTarget.value })}
        />
        <TextInput
          label={labels.denyCommand}
          disabled={!settings.skipVoting.isEnabled || !settings.skipVoting.allowDenySkip}
          value={settings.skipVoting.denyCommand}
          onChange={(event) => updateSkipVoting({ denyCommand: event.currentTarget.value })}
        />
      </div>
      <Switch
        checked={settings.skipVoting.allowDenySkip}
        disabled={!settings.skipVoting.isEnabled}
        onChange={(event) => updateSkipVoting({ allowDenySkip: event.currentTarget.checked })}
        label={labels.allowDenySkip}
      />
    </Stack>
  );
};

export default VideoRequestSettingsSkipSection;
