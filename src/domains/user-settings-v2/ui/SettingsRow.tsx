import clsx from 'clsx';

import type { ReactNode } from 'react';

interface SettingsRowProps {
  children: ReactNode;
  compact?: boolean;
  htmlFor?: string;
  nested?: boolean;
}

const SettingsRow = ({ children, compact, htmlFor, nested = false }: SettingsRowProps) => {
  const isLabel = Boolean(htmlFor);
  const Component = isLabel ? 'label' : 'div';

  return (
    <Component
      {...(htmlFor ? { htmlFor } : {})}
      className={clsx(
        'block min-w-0 px-4',
        compact ? 'py-1.5' : 'py-3',
        htmlFor && 'rounded-sm transition-colors duration-150',
        htmlFor && (nested ? 'hover:bg-[var(--mantine-color-dark-6)]' : 'hover:bg-[var(--mantine-color-dark-7)]'),
      )}
      style={{ cursor: htmlFor ? 'pointer' : undefined }}
    >
      {children}
    </Component>
  );
};

export default SettingsRow;
