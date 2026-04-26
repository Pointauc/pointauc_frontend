import { Kbd } from '@mantine/core';
import clsx from 'clsx';

import { renderHotkeyDisplayPart, splitHotkeyDisplayLabel } from '@shared/lib/hotkeys/hotkeyDisplay';
import { resolveHotkeyDisplayLabel } from '@shared/lib/hotkeys/hotkeys.registry';

import type { HotkeyActionId } from '@shared/lib/hotkeys/hotkeys.types';

const hotkeyHintVariantClasses = {
  default:
    'h-6 min-w-6 rounded-md border border-white/15 bg-[rgba(14,18,22,0.35)] px-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-white shadow-none',
  tooltip:
    'h-6 min-w-6 rounded-md border border-white/12 bg-[rgba(6,8,12,0.32)] px-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-white shadow-none',
  overlay:
    'h-6 min-w-6 rounded-md border border-white/12 bg-[rgba(6,8,12,0.52)] px-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-white shadow-none backdrop-blur-[2px]',
} as const;

interface HotkeyHintProps {
  actionId?: HotkeyActionId;
  label?: string;
  className?: string;
  variant?: keyof typeof hotkeyHintVariantClasses;
}

const HotkeyHint = ({ actionId, label, className, variant = 'default' }: HotkeyHintProps) => {
  const displayLabel = label ?? (actionId ? resolveHotkeyDisplayLabel(actionId) : '');
  const parts = splitHotkeyDisplayLabel(displayLabel);

  if (!displayLabel) {
    return null;
  }

  return (
    <span className={clsx('inline-flex items-center gap-1 whitespace-nowrap', className)}>
      {parts.map((part, index) => (
        <span key={`${part}-${index}`} className='inline-flex items-center gap-1'>
          {index > 0 && <span className='text-dimmed text-xs'>+</span>}
          <Kbd className={hotkeyHintVariantClasses[variant]}>{renderHotkeyDisplayPart(part)}</Kbd>
        </span>
      ))}
    </span>
  );
};

export default HotkeyHint;
