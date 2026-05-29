import clsx from 'clsx';
import { Tooltip } from '@mantine/core';

import type { ReactNode } from 'react';

interface SettingsRowProps {
  children: ReactNode;
  compact?: boolean;
  description?: ReactNode;
  htmlFor?: string;
  nested?: boolean;
}

const SettingsRow = ({ children, compact, description, htmlFor, nested = false }: SettingsRowProps) => {
  const isLabel = Boolean(htmlFor);
  const Component = isLabel ? 'label' : 'div';
  const row = (
    <Component
      {...(htmlFor ? { htmlFor } : {})}
      className={clsx(
        'block min-w-0 px-4',
        compact ? 'py-1.5' : 'py-3',
        htmlFor && 'rounded-sm transition-colors duration-150',
        htmlFor && (nested ? 'hover:bg-paper-600' : 'hover:bg-paper-700'),
      )}
      style={{ cursor: htmlFor ? 'pointer' : undefined }}
    >
      {children}
    </Component>
  );

  if (!description) {
    return row;
  }

  return (
    <Tooltip label={description} position='left-start' withArrow withinPortal multiline maw={320}>
      {row}
    </Tooltip>
  );
};

export default SettingsRow;
