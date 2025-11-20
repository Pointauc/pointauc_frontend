import { Trans, useTranslation } from 'react-i18next';
import { Group, Stack, Text, List, Flex } from '@mantine/core';
import { IconArrowsUpDown, IconSquareRoundedPlusFilled, IconMoneybagPlus, IconClock } from '@tabler/icons-react';
import { useFormContext } from 'react-hook-form';

import SettingsGroup from '@domains/user-settings/ui/SettingsGroup/SettingsGroup';
import FormSwitch from '@shared/mantine/ui/Switch/FormSwitch.tsx';
import FormInput from '@shared/mantine/ui/Input/FormInput.tsx';
import SettingLabel from '@domains/user-settings/ui/SettingLabel';

import styles from './TimerSettings.module.css';

const TimerSettings = () => {
  const { t } = useTranslation();
  const { control } = useFormContext();

  return (
    <SettingsGroup title={t('settings.stopwatch.stopwatch')}>
      <Stack gap='sm'>
        <Group>
          <FormSwitch
            label={
              <SettingLabel text={t('settings.stopwatch.totalTime')} hint={t('settings.stopwatch.totalTimeHint')} />
            }
            name='showTotalTime'
            control={control}
          />
        </Group>
        <Flex gap='lg' align='flex-start' className='timer-settings' direction={{ base: 'column', md: 'row' }}>
          <Stack gap='sm' style={{ flex: 1 }}>
            <Text className={styles.addTime} size='lg' fw={600}>
              {t('settings.stopwatch.addOnCondition')}
            </Text>
            <Stack gap='sm' className={styles.offset}>
              <Group>
                <FormSwitch
                  name='isAutoincrementActive'
                  control={control}
                  label={
                    <SettingLabel
                      text={t('settings.stopwatch.addTimeOnLeaderChange')}
                      leftSection={<IconArrowsUpDown size={24} />}
                    />
                  }
                />
                <FormInput
                  name='autoincrementTime'
                  control={control}
                  size='sm'
                  type='number'
                  w={80}
                  rightSection={<Text>{t('common.sec')}</Text>}
                />
              </Group>
              <Group className='auc-settings-row'>
                <FormSwitch
                  name='isNewSlotIncrement'
                  control={control}
                  label={
                    <SettingLabel
                      text={t('settings.stopwatch.addTimeOnNewPosition')}
                      leftSection={<IconSquareRoundedPlusFilled size={24} />}
                    />
                  }
                />
                <FormInput
                  name='newSlotIncrement'
                  control={control}
                  size='sm'
                  type='number'
                  w={80}
                  rightSection={<Text>{t('common.sec')}</Text>}
                />
              </Group>
              <Group className='auc-settings-row'>
                <FormSwitch
                  name='isIncrementActive'
                  control={control}
                  label={
                    <SettingLabel
                      text={t('settings.stopwatch.addTimeOnDonation')}
                      leftSection={<IconMoneybagPlus size={24} />}
                    />
                  }
                />
                <FormInput
                  name='incrementTime'
                  className='field'
                  size='sm'
                  control={control}
                  type='number'
                  w={80}
                  rightSection={<Text>{t('common.sec')}</Text>}
                />
              </Group>
            </Stack>
          </Stack>
          <Stack gap='sm' style={{ flex: 1 }}>
            <Text className={styles.notAddTime} size='lg' fw={600}>
              {t('settings.stopwatch.notOnCondition')}
            </Text>
            <Stack gap='sm' className={styles.offset}>
              <Group className='auc-settings-row'>
                <FormSwitch
                  name='isMinTimeActive'
                  control={control}
                  label={
                    <SettingLabel
                      text={t('settings.stopwatch.maxAdditionalTime')}
                      leftSection={<IconClock size={24} />}
                      hint={
                        <Trans
                          t={t}
                          i18nKey='settings.stopwatch.maxAdditionalTimeHint'
                          components={{ b: <Text size='sm' span fw={600} />, u: <List size='sm' />, li: <List.Item /> }}
                        />
                      }
                    />
                  }
                />
                <FormInput
                  name='minTime'
                  className='field'
                  size='sm'
                  control={control}
                  type='number'
                  w={86}
                  rightSectionWidth={48}
                  rightSection={<Text>{t('common.min')}</Text>}
                />
              </Group>
            </Stack>
          </Stack>
        </Flex>
      </Stack>
    </SettingsGroup>
  );
};

export default TimerSettings;
