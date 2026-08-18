import clsx from 'clsx';

import IhaqSvg from '@assets/icons/ihaq-icon.png';
import { IconProps, IconSize } from '@models/integration';

export const IhaqIcon = ({ size = IconSize.MEDIUM, classes }: IconProps) => {
  const logoSize = size * 0.8;

  return <img className={clsx('inline-block', classes)} src={IhaqSvg} alt='IHAQ' width={logoSize} height={logoSize} />;
};
