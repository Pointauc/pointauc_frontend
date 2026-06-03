import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import ExtraModeCard from '@domains/user-settings-v2/Widgets/extra-modes/ExtraModeCard';
import FieldLabel from '@domains/user-settings-v2/ui/FieldLabel';
import FormSwitchField from '@domains/user-settings-v2/ui/FormSwitchField';
import SettingsRow from '@domains/user-settings-v2/ui/SettingsRow';
import { SettingsForm } from '@models/settings.model.ts';

const WheelOfLuckModeCard = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<SettingsForm>();
  const isEnabled = useWatch({ control, name: 'luckyWheelEnabled' });

  return (
    <ExtraModeCard
      control={control}
      switchName='luckyWheelEnabled'
      title={t('settings.luckyWheel.luckyWheel')}
      description={t('settings.luckyWheel.desc')}
      isEnabled={Boolean(isEnabled)}
    >
      <SettingsRow htmlFor='luckyWheelSelectBet'>
        <FormSwitchField
          name='luckyWheelSelectBet'
          control={control}
          label={<FieldLabel text={t('settings.luckyWheel.selectBet')} />}
        />
      </SettingsRow>
    </ExtraModeCard>
  );
};

export default WheelOfLuckModeCard;
