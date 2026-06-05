import { Text } from '@mantine/core';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FixedSizeList } from 'react-window';

import { ActionLogEntry } from './cards/entryTypes';
import { ACTION_LOG_ROW_HEIGHT } from './constants';
import ActionLogRow, { ActionLogRowData } from './ActionLogRow';

interface ActionLogsListProps {
  entries: ActionLogEntry[];
  revertingIds: string[];
  onRevert: (entryId: string) => void;
}

const ActionLogsList: FC<ActionLogsListProps> = ({ entries, revertingIds, onRevert }) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const updateHeight = (): void => setHeight(container.getBoundingClientRect().height);
    const observer = new ResizeObserver(updateHeight);

    updateHeight();
    observer.observe(container);

    return (): void => observer.disconnect();
  }, []);

  const itemData = useMemo<ActionLogRowData>(
    () => ({ entries, revertingIds, onRevert }),
    [entries, revertingIds, onRevert],
  );

  return (
    <div ref={containerRef} className='min-h-0 w-[310px] flex-1'>
      {entries.length === 0 ? (
        <Text size='sm' c='dimmed' ta='center' mt='md'>
          {t('actionsLog.empty')}
        </Text>
      ) : (
        height > 0 && (
          <FixedSizeList
            width='100%'
            height={height}
            itemCount={entries.length}
            itemData={itemData}
            itemSize={ACTION_LOG_ROW_HEIGHT}
            overscanCount={8}
            itemKey={(index, data) => data.entries[index].id}
          >
            {ActionLogRow}
          </FixedSizeList>
        )
      )}
    </div>
  );
};

export default ActionLogsList;
