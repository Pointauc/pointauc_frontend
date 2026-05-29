import { Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { LotContributor } from '@models/slot.model';
import { getLeadingContributor } from '@utils/slotContributors.utils';

import LotContributorTooltipContent from './LotContributorTooltipContent';

interface LotContributorSummaryProps {
  contributors?: LotContributor[];
  hideAmounts: boolean;
}

const LotContributorSummary = ({ contributors = [], hideAmounts }: LotContributorSummaryProps) => {
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
      <div className='relative flex h-full max-w-44 shrink-0 items-center'>
        <span className='text-dimmed min-w-0 truncate rounded-sm text-sm font-medium transition-colors'>
          {t('lot.contributorBy', { name: leadingContributor.name })}
        </span>
        {additionalContributorCount > 0 && (
          <span className='text-dimmed absolute top-2 right-1 translate-x-full rounded-full text-[10px] leading-none font-bold'>
            {t('lot.additionalContributors', { count: additionalContributorCount })}
          </span>
        )}
      </div>
    </Tooltip>
  );
};

export default LotContributorSummary;
