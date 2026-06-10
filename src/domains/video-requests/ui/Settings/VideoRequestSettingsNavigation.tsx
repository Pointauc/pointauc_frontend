import { UnstyledButton } from '@mantine/core';
import clsx from 'clsx';

import {
  VideoRequestSettingsNavItem,
  VideoRequestSettingsSectionId,
} from '@domains/video-requests/ui/Settings/VideoRequestSettingsModal.types';

interface VideoRequestSettingsNavigationProps {
  activeSection: VideoRequestSettingsSectionId;
  items: VideoRequestSettingsNavItem[];
  onSectionChange: (sectionId: VideoRequestSettingsSectionId) => void;
}

const VideoRequestSettingsNavigation = ({
  activeSection,
  items,
  onSectionChange,
}: VideoRequestSettingsNavigationProps) => (
  <nav className='border-paper-500 flex flex-col gap-1 border-b pb-3 md:border-r md:border-b-0 md:pr-3 md:pb-0'>
    {items.map((item) => (
      <UnstyledButton
        key={item.id}
        className={clsx(
          'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors',
          activeSection === item.id ? 'bg-primary-light text-primary-200' : 'text-paper-text',
          item.disabled && 'cursor-default opacity-50',
          activeSection !== item.id && !item.disabled && 'hover:bg-paper-600 hover:text-paper-text',
        )}
        onClick={() => onSectionChange(item.id)}
        disabled={item.disabled}
      >
        {item.icon}
        <span>{item.label}</span>
      </UnstyledButton>
    ))}
  </nav>
);

export default VideoRequestSettingsNavigation;
