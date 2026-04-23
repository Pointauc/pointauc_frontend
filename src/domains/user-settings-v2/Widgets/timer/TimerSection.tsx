import { Divider, Group, Stack, Text } from '@mantine/core';
import {
  IconArrowsUpDown,
  IconClock,
  IconClockHour4,
  IconMoneybagPlus,
  IconSquareRoundedPlusFilled,
} from '@tabler/icons-react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FieldLabel from '@domains/user-settings-v2/ui/FieldLabel';
import FormCheckboxField from '@domains/user-settings-v2/ui/FormCheckboxField';
import FormSwitchField from '@domains/user-settings-v2/ui/FormSwitchField';
import SettingsCard from '@domains/user-settings-v2/ui/SettingsCard';
import SettingsRow from '@domains/user-settings-v2/ui/SettingsRow';
import SettingsSection from '@domains/user-settings-v2/ui/SettingsSection';
import { SettingsForm } from '@models/settings.model.ts';
import FormInput from '@shared/mantine/ui/Input/FormInput.tsx';

const TimerSection = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<SettingsForm>();

  return (
    <SettingsSection
      id='website-settings-timer'
      title={t('settings.stopwatch.stopwatch')}
      icon={<IconClockHour4 size={24} />}
    >
      <SettingsCard>
        <SettingsRow htmlFor='showTotalTime'>
          <FormSwitchField
            name='showTotalTime'
            control={control}
            label={<FieldLabel text={t('settings.stopwatch.totalTime')} hint={t('settings.stopwatch.totalTimeHint')} />}
          />
        </SettingsRow>

        <Divider />

        <SettingsCard nested>
          <Stack gap={0}>
            <SettingsRow>
              <Text fw={700} size='md' c='dimmed'>
                {t('settings.stopwatch.addOnCondition')}
              </Text>
            </SettingsRow>

            <SettingsRow compact htmlFor='isAutoincrementActive' nested>
              <Group align='center' justify='space-between' gap='md' wrap='wrap'>
                <FormCheckboxField
                  name='isAutoincrementActive'
                  control={control}
                  label={
                    <FieldLabel
                      text={t('settings.stopwatch.addTimeOnLeaderChange')}
                      leftSection={<IconArrowsUpDown size={18} />}
                    />
                  }
                />
                <FormInput
                  name='autoincrementTime'
                  control={control}
                  size='sm'
                  type='number'
                  w={96}
                  rightSection={<Text>{t('common.sec')}</Text>}
                />
              </Group>
            </SettingsRow>

            <Divider />

            <SettingsRow compact htmlFor='isNewSlotIncrement' nested>
              <Group align='center' justify='space-between' gap='md' wrap='wrap'>
                <FormCheckboxField
                  name='isNewSlotIncrement'
                  control={control}
                  label={
                    <FieldLabel
                      text={t('settings.stopwatch.addTimeOnNewPosition')}
                      leftSection={<IconSquareRoundedPlusFilled size={18} />}
                    />
                  }
                />
                <FormInput
                  name='newSlotIncrement'
                  control={control}
                  size='sm'
                  type='number'
                  w={96}
                  rightSection={<Text>{t('common.sec')}</Text>}
                />
              </Group>
            </SettingsRow>

            <Divider />

            <SettingsRow compact htmlFor='isIncrementActive' nested>
              <Group align='center' justify='space-between' gap='md' wrap='wrap'>
                <FormCheckboxField
                  name='isIncrementActive'
                  control={control}
                  label={
                    <FieldLabel
                      text={t('settings.stopwatch.addTimeOnDonation')}
                      leftSection={<IconMoneybagPlus size={18} />}
                    />
                  }
                />
                <FormInput
                  name='incrementTime'
                  control={control}
                  size='sm'
                  type='number'
                  w={96}
                  rightSection={<Text>{t('common.sec')}</Text>}
                />
              </Group>
            </SettingsRow>

            <Divider />

            <SettingsRow>
              <Text fw={700} size='md' c='dimmed'>
                {t('settings.website.timer.exceptions')}
              </Text>
            </SettingsRow>

            <SettingsRow compact htmlFor='isMinTimeActive' nested>
              <Group align='center' justify='space-between' gap='md' wrap='wrap'>
                <FormCheckboxField
                  name='isMinTimeActive'
                  control={control}
                  label={
                    <FieldLabel
                      text={t('settings.stopwatch.maxAdditionalTime')}
                      leftSection={<IconClock size={18} />}
                    />
                  }
                />
                <FormInput
                  name='minTime'
                  control={control}
                  size='sm'
                  type='number'
                  w={96}
                  rightSection={<Text>{t('common.min')}</Text>}
                />
              </Group>
            </SettingsRow>
          </Stack>
        </SettingsCard>
      </SettingsCard>
    </SettingsSection>
  );
};

export default TimerSection;
