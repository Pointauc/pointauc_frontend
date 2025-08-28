import { useMemo, useRef, useState } from 'react';
import Grid from '@mui/material/Grid';
import { Checkbox, FormControlLabel, IconButton, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import classNames from 'classnames';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';

import { WheelItemWithMetadata } from '@models/wheel.model.ts';
import { createMapByKey } from '@utils/common.utils.ts';
import Item from '@domains/winner-selection/wheel-of-random/ui/ItemsPreview/Item';
import { WheelFormat } from '@constants/wheel.ts';
import useStorageState from '@hooks/useStorageState.ts';
import * as wheelItem from '@domains/winner-selection/wheel-of-random/lib/item';

import './index.scss';
import classes from './index.module.css';

console.log(classes);

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
    () => [...visibleItems].sort((a, b) => wheelItem.getAmount(b) - wheelItem.getAmount(a)),
    [visibleItems],
  );

  return (
    <div className={classNames('wheel-preview-wrapper', { collapsed }, className)}>
      {showControls && (
        <Grid container>
          <Grid flexGrow={collapsed ? 0 : 1}>
            {format === WheelFormat.Dropout && !collapsed && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={hideInactive}
                    onChange={(e) => setHideInactive(e.target.checked)}
                    color='primary'
                  />
                }
                label={t('wheel.hideInactive')}
                className='wheel-controls-checkbox'
              />
            )}
          </Grid>
          <IconButton className='wheel-preview-collapse-button' onClick={() => setCollapsed(!collapsed)}>
            <KeyboardDoubleArrowLeftIcon />
          </IconButton>
        </Grid>
      )}
      {!collapsed && (
        <>
          <Grid ref={listContainer} flex='1 1 auto' container direction='column' width='100%'>
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
                    <div style={style}>
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
          </Grid>
          <Grid>
            <Typography fontSize='1.1rem'>{t('wheel.totalItems', { amount: activeItems.length })}</Typography>
          </Grid>
        </>
      )}
    </div>
  );
};

export default ItemsPreview;
