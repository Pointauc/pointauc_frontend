import { ReactNode } from 'react';

export type VideoRequestSettingsSectionId = 'filters' | 'order' | 'skip' | 'points' | 'donations';

export interface VideoRequestSettingsNavItem {
  id: VideoRequestSettingsSectionId;
  icon: ReactNode;
  label: string;
  disabled?: boolean;
}
