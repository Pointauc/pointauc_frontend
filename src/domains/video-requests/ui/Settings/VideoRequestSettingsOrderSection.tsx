import { SegmentedControl, Stack } from '@mantine/core';

import { VideoRequestNextStrategy, VideoRequestSettings } from '@domains/video-requests/model/types';

interface VideoRequestSettingsOrderSectionProps {
  settings: VideoRequestSettings;
  nextStrategyOptions: { value: VideoRequestNextStrategy; label: string }[];
  onSettingsChange: (settings: VideoRequestSettings) => void;
}

const VideoRequestSettingsOrderSection = ({
  settings,
  nextStrategyOptions,
  onSettingsChange,
}: VideoRequestSettingsOrderSectionProps) => (
  <Stack gap='sm'>
    <SegmentedControl
      fullWidth
      value={settings.nextStrategy}
      data={nextStrategyOptions}
      onChange={(value) => onSettingsChange({ ...settings, nextStrategy: value as VideoRequestNextStrategy })}
    />
  </Stack>
);

export default VideoRequestSettingsOrderSection;
