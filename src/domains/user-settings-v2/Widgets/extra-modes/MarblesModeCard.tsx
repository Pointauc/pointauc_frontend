import { Anchor, Divider } from '@mantine/core';
import { useFormContext, useWatch } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import ExtraModeCard from '@domains/user-settings-v2/Widgets/extra-modes/ExtraModeCard';
import FieldLabel from '@domains/user-settings-v2/ui/FieldLabel';
import SettingsRow from '@domains/user-settings-v2/ui/SettingsRow';
import { SettingsForm } from '@models/settings.model.ts';
import FormInput from '@shared/mantine/ui/Input/FormInput.tsx';

const MarblesModeCard = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<SettingsForm>();
  const isEnabled = useWatch({ control, name: 'marblesAuc' });

  return (
    <ExtraModeCard
      control={control}
      switchName='marblesAuc'
      title={t('settings.marbles.marbles')}
      description={<Trans i18nKey='settings.marbles.marblesAucDesc' components={{ a: <Anchor underline='always' /> }} />}
      isEnabled={Boolean(isEnabled)}
    >
      <SettingsRow compact htmlFor='marbleRate' description={t('settings.marbles.marbleCostDesc')}>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <FieldLabel text={t('settings.marbles.marbleCost')} withDescriptionIcon />
          <FormInput name='marbleRate' control={control} size='sm' type='number' w={96} />
        </div>
      </SettingsRow>

      <Divider />

      <SettingsRow compact htmlFor='marbleCategory' description={t('settings.marbles.newPositionCostDesc')}>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <FieldLabel text={t('settings.marbles.newPositionCost')} withDescriptionIcon />
          <FormInput name='marbleCategory' control={control} size='sm' type='number' w={96} />
        </div>
      </SettingsRow>
    </ExtraModeCard>
  );
};

export default MarblesModeCard;
