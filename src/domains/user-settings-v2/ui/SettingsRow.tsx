import { Box } from '@mantine/core';
import clsx from 'clsx';

import type { ReactNode } from 'react';

interface SettingsRowProps {
  children: ReactNode;
  compact?: boolean;
  htmlFor?: string;
  nested?: boolean;
}

const SettingsRow = ({ children, compact, htmlFor, nested = false }: SettingsRowProps) => {
  return (
    <Box
      component={htmlFor ? 'label' : 'div'}
      htmlFor={htmlFor}
      className={clsx(
        htmlFor && 'rounded-sm transition-colors duration-150',
        htmlFor && (nested ? 'hover:bg-[var(--mantine-color-dark-6)]' : 'hover:bg-[var(--mantine-color-dark-7)]'),
      )}
      px='md'
      py={compact ? 'xxs' : 'sm'}
      style={{ display: 'block', minWidth: 0, cursor: htmlFor ? 'pointer' : undefined }}
    >
      {children}
    </Box>
  );
};

export default SettingsRow;
