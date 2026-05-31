import { Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { getLeadingContributor } from '@utils/slotContributors.utils';

import LotContributorTooltipContent from './LotContributorTooltipContent';

import type { LotContributor } from '@models/slot.model';

interface LotContributorSummaryProps {
  contributors?: LotContributor[];
  hideAmounts: boolean;
  extraPosition?: 'inline' | 'corner';
}

const LotContributorSummary = ({
  contributors = [],
  hideAmounts,
  extraPosition = 'corner',
}: LotContributorSummaryProps) => {
  const { t } = useTranslation();
  const leadingContributor = getLeadingContributor(contributors);
  const additionalContributorCount = Math.max(contributors.length - 1, 0);

  if (!leadingContributor) {
    return null;
  }

  return (
    <Tooltip
      withArrow
      openDelay={120}
      color='transparent'
      position='bottom'
      p={0}
      label={<LotContributorTooltipContent contributors={contributors} hideAmounts={hideAmounts} />}
    >
      <div className={'relative flex max-w-44 shrink-0 items-center pr-1'}>
        <span className='text-dimmed min-w-0 truncate rounded-sm text-sm font-medium transition-colors'>
          {t('lot.contributorBy', { name: leadingContributor.name })}
        </span>
        {additionalContributorCount > 0 && (
          <span
            className={
              'text-dimmed absolute translate-x-full rounded-full text-[10px] leading-none font-bold' +
              (extraPosition === 'inline' ? ' top-1/2 right-0 -translate-y-1/2' : ' top-0 right-2 -translate-y-1/2')
            }
          >
            {t('lot.additionalContributors', { count: additionalContributorCount })}
          </span>
        )}
      </div>
    </Tooltip>
  );
};

export default LotContributorSummary;
