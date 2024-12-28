import React, { useContext, useMemo } from 'react';
import Grid from '@mui/material/Grid2';
import HighlightIcon from '@mui/icons-material/Highlight';
import { Divider } from '@mui/material';
import classNames from 'classnames';

import { WheelItem } from '@models/wheel.model.ts';
import { WheelContext } from '@components/RandomWheel/WheelSettings/WheelContext.tsx';

import '@components/RandomWheel/ItemsPreview/Item.scss';

interface Props {
  item: WheelItem;
  disabled: boolean;
  total: number;
  actionable?: boolean;
}

const Item = ({ item, disabled, total, actionable }: Props) => {
  const { name, amount, color } = item;
  const chance = useMemo(() => ((amount / total) * 100).toFixed(1), [amount, total]);
  const { controller } = useContext(WheelContext);

  const onHover = () => {
    if (disabled || !actionable) return;
    controller.current?.highlight(item.id);
  };

  const onLeave = () => {
    if (disabled || !actionable) return;
    controller.current?.resetStyles();
  };

  return (
    <Grid
      container
      alignItems='center'
      className={classNames('wheel-preview-item', { disabled })}
      direction='row'
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <Grid className='name'>{name}</Grid>
      <Grid className='amount'>{amount}</Grid>
      <Divider orientation='vertical' />
      <Grid className='chance'>{chance + ' %'}</Grid>
      <Grid>
        <div className='color'>
          {!disabled && (
            <>
              {actionable && <HighlightIcon className='find-icon' />}
              <div style={{ color }} />
            </>
          )}
        </div>
      </Grid>
    </Grid>
  );
};

export default Item;
