import clsx from 'clsx';

import MemeAlertsLogoPng from '@assets/icons/memealerts.png';
import * as Integration from '@models/integration';

export const MemeAlertsIcon = ({
  size = Integration.IconSize.MEDIUM,
  classes,
}: {
  size?: number;
  classes?: string;
}) => (
  <img
    src={MemeAlertsLogoPng}
    alt='MemeAlerts'
    className={clsx('inline-block object-contain', classes)}
    style={{ width: size, height: size }}
  />
);
