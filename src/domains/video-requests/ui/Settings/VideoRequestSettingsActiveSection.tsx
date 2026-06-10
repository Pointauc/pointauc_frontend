import { ComponentProps } from 'react';

import ChannelPointsSection from '@domains/user-settings-v2/Widgets/channel-points/ChannelPointsSection';
import { VideoRequestNextStrategy, VideoRequestSettings, VideoSourceId } from '@domains/video-requests/model/types';
import VideoRequestSettingsDonationsSection from '@domains/video-requests/ui/Settings/VideoRequestSettingsDonationsSection';
import VideoRequestSettingsFiltersSection from '@domains/video-requests/ui/Settings/VideoRequestSettingsFiltersSection';
import { VideoRequestSettingsSectionId } from '@domains/video-requests/ui/Settings/VideoRequestSettingsModal.types';
import VideoRequestSettingsOrderSection from '@domains/video-requests/ui/Settings/VideoRequestSettingsOrderSection';
import VideoRequestSettingsSkipSection from '@domains/video-requests/ui/Settings/VideoRequestSettingsSkipSection';

interface VideoRequestSettingsActiveSectionProps {
  activeSection: VideoRequestSettingsSectionId;
  settings: VideoRequestSettings;
  sourceOptions: { value: VideoSourceId; label: string }[];
  sourceIds: VideoSourceId[];
  sourceSearch: string;
  nextStrategyOptions: { value: VideoRequestNextStrategy; label: string }[];
  labels: {
    filters: ComponentProps<typeof VideoRequestSettingsFiltersSection>['labels'];
    skip: ComponentProps<typeof VideoRequestSettingsSkipSection>['labels'];
    conversion: string;
  };
  onSearchChange: (value: string) => void;
  onSettingsChange: (settings: VideoRequestSettings) => void;
}

const VideoRequestSettingsActiveSection = ({
  activeSection,
  settings,
  sourceOptions,
  sourceIds,
  sourceSearch,
  nextStrategyOptions,
  labels,
  onSearchChange,
  onSettingsChange,
}: VideoRequestSettingsActiveSectionProps) => {
  if (activeSection === 'filters') {
    return (
      <VideoRequestSettingsFiltersSection
        settings={settings}
        sourceOptions={sourceOptions}
        sourceIds={sourceIds}
        sourceSearch={sourceSearch}
        labels={labels.filters}
        onSearchChange={onSearchChange}
        onSettingsChange={onSettingsChange}
      />
    );
  }

  if (activeSection === 'order') {
    return (
      <VideoRequestSettingsOrderSection
        settings={settings}
        nextStrategyOptions={nextStrategyOptions}
        onSettingsChange={onSettingsChange}
      />
    );
  }

  if (activeSection === 'skip') {
    return (
      <VideoRequestSettingsSkipSection settings={settings} labels={labels.skip} onSettingsChange={onSettingsChange} />
    );
  }

  if (activeSection === 'points') {
    return <ChannelPointsSection />;
  }

  return <VideoRequestSettingsDonationsSection conversionLabel={labels.conversion} />;
};

export default VideoRequestSettingsActiveSection;
