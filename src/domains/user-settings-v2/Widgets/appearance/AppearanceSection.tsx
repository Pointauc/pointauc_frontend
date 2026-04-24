import { ColorInput, ColorSwatch, Divider, Group, Stack, UnstyledButton } from '@mantine/core';
import { IconPalette } from '@tabler/icons-react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FieldLabel from '@domains/user-settings-v2/ui/FieldLabel';
import SettingsCard from '@domains/user-settings-v2/ui/SettingsCard';
import SettingsRow from '@domains/user-settings-v2/ui/SettingsRow';
import FormSwitchField from '@domains/user-settings-v2/ui/FormSwitchField';
import SettingsSection from '@domains/user-settings-v2/ui/SettingsSection';
import { SettingsForm } from '@models/settings.model.ts';
import { COLORS } from '@constants/color.constants.ts';

import AuctionBackgroundSettings from './auction-background/AuctionBackgroundSettings';

const PRIMARY_COLOR_SHORTCUTS = [COLORS.THEME.PRIMARY, '#4d824a', '#69b39d', '#db991f', '#d67676', '#a481de'];

const AppearanceSection = () => {
  const { t } = useTranslation();
  const { control, setValue } = useFormContext<SettingsForm>();

  const handlePrimaryColorShortcutClick = (color: string) => {
    setValue('primaryColor', color, { shouldDirty: true, shouldTouch: true });
  };

  return (
    <SettingsSection
      id='website-settings-appearance'
      title={t('settings.appearance.appearance')}
      icon={<IconPalette size={24} />}
    >
      <SettingsCard>
        <AuctionBackgroundSettings />

        <Divider />

        <Stack gap={0}>
          <SettingsRow compact htmlFor='primaryColor'>
            <Group align='center' justify='space-between' gap='md' wrap='wrap'>
              <FieldLabel text={t('settings.appearance.primaryColor')} />
              <Group gap='md' align='center'>
                <Group gap={8} wrap='nowrap'>
                  {PRIMARY_COLOR_SHORTCUTS.map((color) => (
                    <UnstyledButton
                      key={color}
                      type='button'
                      aria-label={`Set primary color to ${color}`}
                      onClick={() => handlePrimaryColorShortcutClick(color)}
                    >
                      <ColorSwatch color={color} size={26} />
                    </UnstyledButton>
                  ))}
                </Group>
                <Controller
                  control={control}
                  name='primaryColor'
                  render={({ field }) => (
                    <ColorInput
                      id='primaryColor'
                      ref={field.ref}
                      value={field.value}
                      onChangeEnd={(color) => {
                        field.onChange(color);
                        field.onBlur();
                      }}
                      onBlur={field.onBlur}
                      fixOnBlur={false}
                      format='hex'
                      name='primaryColor'
                      w={150}
                    />
                  )}
                />
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
