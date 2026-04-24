import { Stack } from '@mantine/core';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FieldLabel from '@domains/user-settings-v2/ui/FieldLabel';
import FormSwitchField from '@domains/user-settings-v2/ui/FormSwitchField';
import SettingsRow from '@domains/user-settings-v2/ui/SettingsRow';
import { SettingsForm } from '@models/settings.model.ts';

const GeometryBackgroundSettings = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<SettingsForm>();

  return (
    <Stack gap={0}>
      <SettingsRow compact nested htmlFor='isGeometryBackgroundColorEnabled'>
        <FormSwitchField
          name='isGeometryBackgroundColorEnabled'
          control={control}
          label={<FieldLabel text={t('settings.auc.geometryBackgroundColor')} />}
        />
      </SettingsRow>
    </Stack>
  );
};

export default GeometryBackgroundSettings;
