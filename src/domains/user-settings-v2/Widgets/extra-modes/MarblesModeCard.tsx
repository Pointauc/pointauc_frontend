import { Anchor, Divider, Group } from '@mantine/core';
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
      hint={<Trans i18nKey='settings.marbles.marblesAucDesc' components={{ a: <Anchor underline='always' /> }} />}
      isEnabled={Boolean(isEnabled)}
    >
      <SettingsRow compact htmlFor='marbleRate'>
        <Group align='center' justify='space-between' gap='md' wrap='wrap'>
          <FieldLabel text={t('settings.marbles.marbleCost')} hint={t('settings.marbles.marbleCostDesc')} />
          <FormInput name='marbleRate' control={control} size='sm' type='number' w={96} />
        </Group>
      </SettingsRow>

      <Divider />

      <SettingsRow compact htmlFor='marbleCategory'>
        <Group align='center' justify='space-between' gap='md' wrap='wrap'>
          <FieldLabel text={t('settings.marbles.newPositionCost')} hint={t('settings.marbles.newPositionCostDesc')} />
          <FormInput name='marbleCategory' control={control} size='sm' type='number' w={96} />
        </Group>
      </SettingsRow>
    </ExtraModeCard>
  );
};

export default MarblesModeCard;
