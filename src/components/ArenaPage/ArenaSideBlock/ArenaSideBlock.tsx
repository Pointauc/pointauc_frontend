import React, { FC, ReactNode, useMemo, useState } from 'react';
import classNames from 'classnames';
import { IconButton } from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';

export enum Sides {
  left = 'left',
  right = 'right',
}

interface ArenaSideBlockProps {
  side: Sides;
  children?: ReactNode;
}

const ArenaSideBlock: FC<ArenaSideBlockProps> = ({ side, children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const toggleOpen = (): void => setIsOpen((prev) => !prev);

  const arrowIcon = useMemo(() => {
    if (side === Sides.right) {
      return isOpen ? <ArrowForwardIosIcon /> : <ArrowBackIosIcon className="arrow-back" />;
    }
    return isOpen ? <ArrowBackIosIcon className="arrow-back" /> : <ArrowForwardIosIcon />;
  }, [isOpen, side]);

  return (
    <div className={classNames('side-ui-container', side, { closed: !isOpen })}>
      <div className="side-ui-content">{children}</div>
      <IconButton className="side-ui-collapse-btn" onClick={toggleOpen}>
        {arrowIcon}
      </IconButton>
    </div>
  );
};

export default ArenaSideBlock;
