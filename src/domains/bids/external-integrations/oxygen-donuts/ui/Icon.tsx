import clsx from 'clsx';

import OxygenDonutsPng from '@assets/icons/oxygenDonuts.png';
import * as Integration from '@models/integration';

export const OxygenDonutsIcon = ({ size = Integration.IconSize.SMALL, classes }: Integration.IconProps) => (
  <img
    src={OxygenDonutsPng}
    alt='Oxygen Donuts'
    className={clsx('inline-block object-contain', classes)}
    style={{ width: size, height: size }}
  />
);
