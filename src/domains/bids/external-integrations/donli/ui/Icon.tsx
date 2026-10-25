import clsx from 'clsx';
import DonliLogoPng from '@assets/icons/donli.png';
import * as Integration from '@models/integration';

export const DonliIcon = ({ size = Integration.IconSize.MEDIUM, classes }: { size?: number; classes?: string }) => (
  <img
    src={DonliLogoPng}
    alt='Donli'
    className={clsx('inline-block object-contain', classes)}
    style={{ width: size, height: size }}
  />
);
