import clsx from 'clsx';

import * as Integration from '@models/integration';

export const VkVideoLiveIcon = ({ size = Integration.IconSize.MEDIUM, classes }: { size?: number; classes?: string }) => (
  <span
    className={clsx(
      'inline-flex items-center justify-center rounded-md bg-[#0077ff] text-sm font-bold leading-none text-white',
      classes,
    )}
    style={{ width: size, height: size }}
  >
    VK
  </span>
);
