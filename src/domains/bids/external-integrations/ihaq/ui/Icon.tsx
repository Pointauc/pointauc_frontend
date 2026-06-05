import IhaqSvg from '@assets/icons/ihaq-icon.png';
import { IconProps, IconSize } from '@models/integration';

export const IhaqIcon = ({ size = IconSize.MEDIUM }: IconProps) => {
  return <img src={IhaqSvg} alt='Ihaq' width={size} height={size} />;
};
