import { ActionIcon, Group, Stack, Tooltip } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormColorPicker from '@components/Form/FormColorPicker/FormColorPicker.tsx';
import { COLORS } from '@constants/color.constants.ts';
import SettingLabel from '@domains/user-settings/ui/SettingLabel';
import SettingsGroup from '@domains/user-settings/ui/SettingsGroup/SettingsGroup';
import BackgroundSettings from '@domains/user-settings/ui/BackgroundSettings';

const AppearanceSettings = () => {
  const { t } = useTranslation();
  const { setValue, control } = useFormContext();

  const resetPrimary = () => setValue('primaryColor', COLORS.THEME.PRIMARY, { shouldDirty: true, shouldTouch: true });
  const resetBackgroundTone = () =>
    setValue('backgroundTone', COLORS.THEME.BACKGROUND_TONE, { shouldDirty: true, shouldTouch: true });

  return (
    <SettingsGroup title={t('settings.appearance.appearance')}>
      <Stack gap='sm'>
        <BackgroundSettings />
        <Group>
          <SettingLabel text={t('settings.appearance.primaryColor')} />
          <FormColorPicker control={control} name='primaryColor' />
          <Tooltip label={t('common.reset')}>
            <ActionIcon size='lg' variant='subtle' className='auc-settings-reset-background' onClick={resetPrimary}>
              <IconRefresh size={20} />
            </ActionIcon>
          </Tooltip>
        </Group>
        <Group>
          <SettingLabel text={t('settings.appearance.backgroundTone')} />
          <FormColorPicker disabled={true} control={control} name='backgroundTone' />
          <Tooltip label={t('common.reset')}>
            <ActionIcon
              size='lg'
              variant='subtle'
              className='auc-settings-reset-background'
              onClick={resetBackgroundTone}
            >
              <IconRefresh size={20} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Stack>
    </SettingsGroup>
  );
};

export default AppearanceSettings;
