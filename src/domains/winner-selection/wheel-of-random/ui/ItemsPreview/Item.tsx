import { Divider, Group, Text } from '@mantine/core';
import HighlightIcon from '@mui/icons-material/Highlight';
import classNames from 'classnames';
import { useContext, useMemo } from 'react';

import * as wheelItem from '@domains/winner-selection/wheel-of-random/lib/item';
import { WheelContext } from '@domains/winner-selection/wheel-of-random/settings/ui/Context/WheelContext';
import { WheelItemWithMetadata } from '@models/wheel.model.ts';

import classes from './Item.module.css';

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
    <Group
      className={classNames(classes.item, { [classes.disabled]: disabled })}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <Text className={classes.name}>{name}</Text>
      <Text className={classes.amount}>{Number(amountToDisplay.toFixed(2))}</Text>
      <Divider orientation='vertical' />
      <Text className={classes.chance}>{chance + ' %'}</Text>
      <div className={classes.color}>
        {!disabled && (
          <>
            {actionable && <HighlightIcon className={classes.findIcon} />}
            <div style={{ color }} />
          </>
        )}
      </div>
    </Group>
  );
};

export default Item;
