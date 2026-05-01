import clsx from 'clsx';

import KickLogo from '@assets/icons/kick.svg?react';
import * as Integration from '@models/integration';

export const KickIcon = ({ size = Integration.IconSize.MEDIUM, classes }: { size?: number; classes?: string }) => (
  <KickLogo className={clsx('inline-block', classes)} width={size} height={size} />
);
