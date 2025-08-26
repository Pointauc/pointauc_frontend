import React, { useContext, useMemo } from 'react';
import Grid from '@mui/material/Grid';
import HighlightIcon from '@mui/icons-material/Highlight';
import { Divider } from '@mui/material';
import classNames from 'classnames';

import { WheelItemWithMetadata } from '@models/wheel.model.ts';
import { WheelContext } from '@components/RandomWheel/WheelSettings/WheelContext.tsx';
import * as wheelItem from '@domains/winner-selection/wheel-of-random/lib/item';
import '@components/RandomWheel/ItemsPreview/Item.scss';

interface Props {
  item: WheelItemWithMetadata;
  disabled: boolean;
  total: number;
  actionable?: boolean;
}

const Item = ({ item, disabled, total, actionable }: Props) => {
  const { name, color } = item;
  const amountToDisplay = wheelItem.getAmount(item);
  const chance = useMemo(() => ((amountToDisplay / total) * 100).toFixed(1), [amountToDisplay, total]);
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
      <Grid className='amount'>{amountToDisplay}</Grid>
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
