import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { LotContributor } from '@models/slot.model';
import { numberUtils } from '@utils/common/number';

interface LotContributorTooltipContentProps {
  contributors: LotContributor[];
  hideAmounts: boolean;
}

const getDisplayAmount = (amount: number, hideAmounts: boolean): string | number => {
  return hideAmounts ? '**' : numberUtils.roundFixed(amount, 2);
};

const LotContributorTooltipContent = ({ contributors, hideAmounts }: LotContributorTooltipContentProps) => {
  const { t } = useTranslation();
  const sortedContributors = useMemo(
    () => [...contributors].sort((first, second) => second.amount - first.amount),
    [contributors],
  );
  const totalAmount = useMemo(
    () => sortedContributors.reduce((sum, contributor) => sum + contributor.amount, 0),
    [sortedContributors],
  );

  return (
    <div className='w-64 overflow-hidden rounded-md bg-[var(--mantine-color-dark-7)] text-[var(--mantine-color-gray-1)] shadow-lg'>
      <div className='flex items-center justify-between border-b border-[var(--mantine-color-dark-4)] px-3 py-2'>
        <span className='text-xs font-semibold tracking-wide text-[var(--mantine-color-gray-4)] uppercase'>
          {t('lot.contributorsBreakdown')}
        </span>
      </div>

      <div className='max-h-56 overflow-y-auto px-2 py-2'>
        {sortedContributors.map((contributor, index) => (
          <div
            key={contributor.name}
            className='grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-2 rounded px-1.5 py-1.5'
          >
            <span className='flex h-5 w-5 items-center justify-center rounded-full bg-[var(--mantine-color-dark-5)] text-[10px] font-bold text-[var(--mantine-color-gray-4)]'>
              {index + 1}
            </span>
            <span className='truncate text-sm font-medium'>{contributor.name}</span>
            <span className='rounded bg-[var(--mantine-color-dark-5)] px-2 py-0.5 text-xs font-semibold'>
              {getDisplayAmount(contributor.amount, hideAmounts)}
            </span>
          </div>
        ))}
      </div>

      <div className='flex items-center justify-between border-t border-[var(--mantine-color-dark-4)] px-3 py-2 text-xs'>
        <span className='font-medium text-[var(--mantine-color-gray-4)]'>{t('lot.contributorsTotal')}</span>
        <span className='font-bold'>{getDisplayAmount(totalAmount, hideAmounts)}</span>
      </div>
    </div>
  );
};

export default LotContributorTooltipContent;
