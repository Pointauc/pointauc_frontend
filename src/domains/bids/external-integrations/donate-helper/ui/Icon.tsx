import DonateHelperSvg from '@assets/icons/donateHelper.svg?react';
import { IconProps } from '@models/integration';

export const DonateHelperIcon = ({ classes, size = 22 }: IconProps) => {
  const negativePaddings = Math.round(size * 0.2);

  return (
    <div style={{ width: size, height: size }}>
      <DonateHelperSvg
        className={classes}
        width={size + negativePaddings}
        height={size + negativePaddings}
        style={{ margin: `-${negativePaddings / 2}px` }}
      />
    </div>
  );
};
