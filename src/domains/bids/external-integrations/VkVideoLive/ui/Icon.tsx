import clsx from 'clsx';

import VkVideoLiveLogo from '@assets/icons/vkVideoLive.svg?react';
import * as Integration from '@models/integration';

export const VkVideoLiveIcon = ({
  size = Integration.IconSize.MEDIUM,
  classes,
}: {
  size?: number;
  classes?: string;
}) => <VkVideoLiveLogo className={clsx('inline-block', classes)} width={size} height={size} />;
