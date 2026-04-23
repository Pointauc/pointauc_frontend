import { ActionIcon, Divider, Group, Stack, Tooltip } from '@mantine/core';
import { IconPalette, IconRefresh } from '@tabler/icons-react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import BackgroundSettings from '@domains/user-settings/ui/BackgroundSettings';
import FieldLabel from '@domains/user-settings-v2/ui/FieldLabel';
import SettingsCard from '@domains/user-settings-v2/ui/SettingsCard';
import SettingsRow from '@domains/user-settings-v2/ui/SettingsRow';
import FormSwitchField from '@domains/user-settings-v2/ui/FormSwitchField';
import SettingsSection from '@domains/user-settings-v2/ui/SettingsSection';
import { SettingsForm } from '@models/settings.model.ts';
import { COLORS } from '@constants/color.constants.ts';
import FormColorPicker from '@components/Form/FormColorPicker/FormColorPicker.tsx';

const AppearanceSection = () => {
  const { t } = useTranslation();
  const { control, setValue } = useFormContext<SettingsForm>();

  const resetPrimaryColor = () => {
    setValue('primaryColor', COLORS.THEME.PRIMARY, { shouldDirty: true, shouldTouch: true });
  };

  const resetBackgroundTone = () => {
    setValue('backgroundTone', COLORS.THEME.BACKGROUND_TONE, { shouldDirty: true, shouldTouch: true });
  };

  return (
    <SettingsSection
      id='website-settings-appearance'
      title={t('settings.appearance.appearance')}
      icon={<IconPalette size={24} />}
    >
      <SettingsCard>
        <SettingsRow>
          <BackgroundSettings />
        </SettingsRow>

        <Divider />

        <Stack gap={0}>
          <SettingsRow compact>
            <Group align='center' justify='space-between' gap='md' wrap='wrap'>
              <FieldLabel text={t('settings.appearance.primaryColor')} />
              <Group gap='xs' wrap='nowrap'>
                <FormColorPicker control={control} name='primaryColor' />
                <Tooltip label={t('common.reset')}>
                  <ActionIcon size='lg' variant='subtle' onClick={resetPrimaryColor}>
                    <IconRefresh size={20} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>
          </SettingsRow>

          <Divider />

          <SettingsRow htmlFor='isTotalVisible'>
            <FormSwitchField
              name='isTotalVisible'
              control={control}
              label={<FieldLabel text={t('settings.auc.showTotal')} />}
            />
          </SettingsRow>

          <Divider />

          <SettingsRow htmlFor='showChances'>
            <FormSwitchField
              name='showChances'
              control={control}
              label={<FieldLabel text={t('settings.auc.showWinningChances')} />}
            />
          </SettingsRow>

          <Divider />

          <SettingsRow htmlFor='hideAmounts'>
            <FormSwitchField
              name='hideAmounts'
              control={control}
              label={<FieldLabel text={t('settings.auc.hideAmounts')} />}
            />
          </SettingsRow>
        </Stack>
      </SettingsCard>
    </SettingsSection>
  );
};

export default AppearanceSection;
