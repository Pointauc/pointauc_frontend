import { CSSProperties, useEffect, useRef } from 'react';
import { ListChildComponentProps } from 'react-window';

import ActionLogEntryCard from './ActionLogEntryCard';
import { ActionLogEntry } from './cards/entryTypes';

export interface ActionLogRowData {
  entries: ActionLogEntry[];
  revertingIds: string[];
  onRevert: (entryId: string) => void;
  setRowHeight: (entryId: string, rowHeight: number) => void;
}

const ActionLogRow = ({ index, style, data }: ListChildComponentProps<ActionLogRowData>) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const entry = data.entries[index];

  useEffect(() => {
    const row = rowRef.current;

    if (!row) {
      return undefined;
    }

    const updateRowHeight = (): void => {
      data.setRowHeight(entry.id, Math.ceil(row.getBoundingClientRect().height));
    };
    const observer = new ResizeObserver(updateRowHeight);

    updateRowHeight();
    observer.observe(row);

    return (): void => observer.disconnect();
  }, [data, entry.id]);

  return (
    <div style={style as CSSProperties}>
      <div ref={rowRef} className='px-0 pb-2'>
        <ActionLogEntryCard entry={entry} isReverting={data.revertingIds.includes(entry.id)} onRevert={data.onRevert} />
      </div>
    </div>
  );
};

export default ActionLogRow;
