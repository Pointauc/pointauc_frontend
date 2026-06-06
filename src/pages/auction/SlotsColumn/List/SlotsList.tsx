import { Box } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import clsx from 'clsx';
import { FC, memo, RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { FixedSizeList, ListChildComponentProps } from 'react-window';

import useAutoScroll from '@hooks/useAutoScroll';
import { Lot } from '@models/slot.model.ts';
import DroppableSlot from '@pages/auction/Slot/DroppableSlot';
import AnimatedList from '@pages/auction/SlotsColumn/AnimatedList/AnimatedList';
import { RootState } from '@reducers';

import {
  AUCTION_LOT_FOCUS_EVENT,
  AUCTION_LOT_HIGHLIGHT_DURATION_MS,
  AuctionLotFocusEventDetail,
} from '../../actionLogLotFocus';

import classes from './SlotsList.module.css';

interface SlotsListProps {
  slots: Lot[];
  optimize: boolean;
  containerRef: RefObject<HTMLDivElement | null>;
  readonly?: boolean;
  isTransparentUi?: boolean;
}

interface SlotsRowData {
  slots: Lot[];
  highlightedLotId: string | null;
}

const Row = ({ index, style, data }: ListChildComponentProps<SlotsRowData>) => (
  <div style={style as any}>
    <DroppableSlot
      index={index + 1}
      slot={data.slots[index]}
      isHighlighted={data.slots[index].id === data.highlightedLotId}
    />
  </div>
);

interface VirtualListProps {
  slots: Lot[];
  height: number;
  compact: boolean;
  containerRef: RefObject<HTMLDivElement | null>;
  highlightedLotId: string | null;
  listRef: RefObject<FixedSizeList<SlotsRowData> | null>;
}

const VirtualLots: FC<VirtualListProps> = ({ slots, height, compact, containerRef, highlightedLotId, listRef }) => {
  const itemData = useMemo(() => ({ slots, highlightedLotId }), [highlightedLotId, slots]);

  return (
    <FixedSizeList
      ref={listRef}
      outerRef={containerRef}
      width='100%'
      height={height}
      itemData={itemData}
      itemCount={slots.length}
      itemSize={compact ? 41 : 54}
      overscanCount={16}
      itemKey={(index: any) => slots[index].id}
    >
      {Row as any}
    </FixedSizeList>
  );
};

const SlotsList: FC<SlotsListProps> = ({ slots, optimize, containerRef, readonly, isTransparentUi }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const compact = useSelector((root: RootState) => root.aucSettings.view.compact);
  const autoScroll = useSelector((root: RootState) => root.aucSettings.view.autoScroll);
  const background = useSelector((root: RootState) => root.aucSettings.settings.background);
  const { draggedRedemption } = useSelector((root: RootState) => root.purchases);
  const [height, setHeight] = useState<number>();
  const [highlightedLotId, setHighlightedLotId] = useState<string | null>(null);
  const virtualListRef = useRef<FixedSizeList<SlotsRowData> | null>(null);
  const containerVirtualRef = useRef<HTMLDivElement>(null);

  useAutoScroll(compact || optimize ? containerVirtualRef : containerRef, slots.length, autoScroll, {
    scrollSpeed: 50,
    pauseOnEdgesDuration: 2,
    mouseResumeDelay: 5,
  });

  // useEffect(() => {
  //   if (optimize && !compact) {
  //     notifications.show({
  //       message: t('auc.optimizationEnabled'),
  //     });
  //   }
  // }, [compact, dispatch, optimize, t]);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      setHeight(entries[0].contentRect.height);
    });

    if (containerRef.current) {
      setHeight(containerRef.current?.getBoundingClientRect().height);

      observer.observe(containerRef.current);
    }
  }, [containerRef]);

  useEffect(() => {
    const handleFocusLot = (event: Event): void => {
      const lotId = (event as CustomEvent<AuctionLotFocusEventDetail>).detail?.lotId;

      if (!lotId) {
        setHighlightedLotId(null);
        return;
      }

      const lotIndex = slots.findIndex((slot) => slot.id === lotId);

      if (lotIndex === -1) {
        setHighlightedLotId(null);
        return;
      }

      setHighlightedLotId(lotId);
      virtualListRef.current?.scrollToItem(lotIndex, 'center');

      window.setTimeout(() => {
        document
          .querySelector(`[data-auction-lot-id="${lotId}"]`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    };

    window.addEventListener(AUCTION_LOT_FOCUS_EVENT, handleFocusLot);

    return () => {
      window.removeEventListener(AUCTION_LOT_FOCUS_EVENT, handleFocusLot);
    };
  }, [slots]);

  return (
    <Box
      className={clsx(classes.root, {
        'compact-view': compact,
        'custom-background': background || isTransparentUi,
        dragging: !!draggedRedemption,
      })}
    >
      {(compact || optimize) && height != null && (
        <VirtualLots
          slots={slots}
          height={height}
          compact={compact}
          containerRef={containerVirtualRef}
          highlightedLotId={highlightedLotId}
          listRef={virtualListRef}
        />
      )}
      {!compact && !optimize && <AnimatedList slots={slots} highlightedLotId={highlightedLotId} />}
    </Box>
  );
};

export default memo(SlotsList);
