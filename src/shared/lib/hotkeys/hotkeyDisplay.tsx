import SpaceBarIcon from '@mui/icons-material/SpaceBar';

import type { ReactNode } from 'react';

export const splitHotkeyDisplayLabel = (displayLabel: string): string[] => displayLabel.split(' + ');

export const renderHotkeyDisplayPart = (part: string): ReactNode => {
  if (part === 'Space') {
    return <SpaceBarIcon fontSize='inherit' className='text-[1.2em]' />;
  }

  return part;
};
