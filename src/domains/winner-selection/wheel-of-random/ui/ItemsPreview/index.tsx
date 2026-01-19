import { ActionIcon, Checkbox, Grid, Group, Stack, Text } from '@mantine/core';
import { IconChevronsLeft } from '@tabler/icons-react';
import classNames from 'classnames';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';

import { WheelFormat } from '@constants/wheel.ts';
import * as wheelItem from '@domains/winner-selection/wheel-of-random/lib/item';
import Item from '@domains/winner-selection/wheel-of-random/ui/ItemsPreview/Item';
import useStorageState from '@hooks/useStorageState.ts';
import { WheelItemWithMetadata } from '@models/wheel.model.ts';
import { createMapByKey } from '@utils/common.utils.ts';

import classes from './index.module.css';

interface Props {
  allItems: WheelItemWithMetadata[];
  activeItems: WheelItemWithMetadata[];
  format: WheelFormat;
  centerItems?: boolean;
  showControls?: boolean;
  className?: string;
}

const ItemsPreview = ({
  allItems,
  activeItems,
  format,
  className,
  showControls = true,
  centerItems = false,
}: Props) => {
  const [hideInactive, setHideInactive] = useState(false);
  const [collapsed, setCollapsed] = useStorageState('wheel.itemsPreview.collapsed', false);
  const listContainer = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();

  const activeMap = useMemo(
    () =>
      createMapByKey(
        activeItems,
        (item) => item.id,
        () => true,
      ),
    [activeItems],
  );
  const total = useMemo(() => allItems.reduce((acc, item) => acc + wheelItem.getAmount(item), 0), [allItems]);
  const visibleItems = useMemo(
    () => (hideInactive ? allItems.filter((item) => activeMap.get(item.id)) : allItems),
    [hideInactive, allItems, activeMap],
  );
  const allSorted = useMemo(
    () => {
      return [...visibleItems].sort((a, b) => {
        if (a.isFavorite !== b.isFavorite) {
          return a.isFavorite ? -1 : 1;
        }

        return wheelItem.getAmount(b) - wheelItem.getAmount(a)
      });
    },
    [visibleItems]
  );

  return (
    <div className={classNames(classes.wrapper, { [classes.collapsed]: collapsed }, className)}>
      {showControls && (
        <Grid align='center'>
          {!collapsed && (
            <Grid.Col span='auto'>
              {format === WheelFormat.Dropout && (
                <Group>
                  <Checkbox
                    checked={hideInactive}
                    onChange={(event) => setHideInactive(event.currentTarget.checked)}
                    label={t('wheel.hideInactive')}
                  />
                </Group>
              )}
            </Grid.Col>
          )}
          <Grid.Col span='content'>
            <ActionIcon
              className={classes.collapseButton}
              onClick={() => setCollapsed(!collapsed)}
              variant='subtle'
              radius='xl'
              size='lg'
              color='white'
            >
              <IconChevronsLeft size={24} />
            </ActionIcon>
          </Grid.Col>
        </Grid>
      )}
      {!collapsed && (
        <Stack className={classes.expandedContainer} gap='xs'>
          <div
            ref={listContainer}
            style={{ flex: '1 1 auto', width: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <AutoSizer disableWidth>
              {({ height }) => (
                <FixedSizeList
                  itemSize={48}
                  height={height}
                  itemCount={allSorted.length}
                  width='100%'
                  className={classNames({ [classes.itemsCentered]: centerItems })}
                >
                  {({ index, style }) => (
                    <div style={style as any}>
                      <Item
                        item={allSorted[index]}
                        actionable={allSorted.length < 300}
                        disabled={!activeMap.get(allSorted[index].id)}
                        total={total}
                      />
                    </div>
                  )}
                </FixedSizeList>
              )}
            </AutoSizer>
          </div>
          <Text size='lg'>{t('wheel.totalItems', { amount: activeItems.length })}</Text>
        </Stack>
      )}
    </div>
  );
};

export default ItemsPreview;
