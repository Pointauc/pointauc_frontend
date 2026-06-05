import { Loader } from '@mantine/core';
import clsx from 'clsx';

import type { HTMLAttributes, KeyboardEventHandler, ReactNode } from 'react';

export type IntegrationStatusCardStatus = 'disabled' | 'loading' | 'enabled';

interface IntegrationStatusCardRootProps {
  children: ReactNode;
  status: IntegrationStatusCardStatus;
  className?: string;
  isInteractive?: boolean;
  isPressed?: boolean;
  ariaLabel?: string;
  onClick?: () => void;
}

interface IntegrationStatusCardHeaderProps {
  title: ReactNode;
  status: IntegrationStatusCardStatus;
  icon?: ReactNode;
  rightSection?: ReactNode;
  className?: string;
  indicatorPosition?: 'start' | 'end';
}

interface IntegrationStatusCardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

interface IntegrationStatusCardStatusIndicatorProps {
  status: IntegrationStatusCardStatus;
  className?: string;
}

const statusClassNames: Record<IntegrationStatusCardStatus, string> = {
  disabled: 'border-paper-500/80 bg-paper-700/80 hover:border-paper-400 hover:bg-paper-600 text-paper-50 ',
  loading: 'border bg-sky-800/25 text-sky-600 border-transparent',
  enabled: 'bg-emerald-800/35 hover:bg-emerald-800/25 text-emerald-600 border-transparent',
};

export const IntegrationStatusCardRoot = ({
  children,
  status,
  className,
  isInteractive = false,
  isPressed,
  ariaLabel,
  onClick,
}: IntegrationStatusCardRootProps) => {
  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (!isInteractive || event.target !== event.currentTarget) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      className={clsx(
        'overflow-hidden rounded-lg border shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-colors duration-50',
        isInteractive && 'cursor-pointer',
        statusClassNames[status],
        className,
      )}
      data-status={status}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-pressed={isInteractive ? isPressed : undefined}
      aria-label={ariaLabel}
      onClick={isInteractive ? onClick : undefined}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
};

export const IntegrationStatusCardStatusIndicator = ({
  status,
  className,
}: IntegrationStatusCardStatusIndicatorProps) => (
  <span
    className={clsx(
      'relative inline-flex h-4 w-4 flex-none items-center justify-center rounded-full',
      status === 'disabled' && 'border border-dashed border-slate-500',
      status === 'enabled' && 'border border-emerald-400/80 bg-emerald-500/15 shadow-[0_0_10px_rgba(16,185,129,0.35)]',
      className,
    )}
    data-status={status}
    aria-hidden='true'
  >
    {status === 'loading' ? (
      <Loader size={16} />
    ) : (
      <span className={clsx('h-1.5 w-1.5 rounded-full', status === 'enabled' && 'bg-emerald-300')} />
    )}
  </span>
);

export const IntegrationStatusCardHeader = ({
  title,
  status,
  icon,
  rightSection,
  className,
  indicatorPosition = 'start',
}: IntegrationStatusCardHeaderProps) => (
  <div className={clsx('flex min-h-[42px] items-center gap-2.5 px-3', className)}>
    {indicatorPosition === 'start' ? <IntegrationStatusCardStatusIndicator status={status} /> : null}
    {icon ? <span className='inline-flex flex-none items-center'>{icon}</span> : null}
    <div className='min-w-0 flex-1'>{title}</div>
    {indicatorPosition === 'end' ? <IntegrationStatusCardStatusIndicator status={status} /> : null}
    {rightSection ? <div className='flex flex-none items-center'>{rightSection}</div> : null}
  </div>
);

export const IntegrationStatusCardBody = ({ children, className, ...props }: IntegrationStatusCardBodyProps) => (
  <div className={clsx('px-2 pb-2', className)} {...props}>
    {children}
  </div>
);
