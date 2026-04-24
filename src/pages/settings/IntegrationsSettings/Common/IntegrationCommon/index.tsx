import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Group, SegmentedControl, Stack, Text, Tooltip } from '@mantine/core';

import BidsSortSelect from '@pages/settings/IntegrationsSettings/Common/AucSettings/BidsSortSelect';
import { InsertStrategy } from '@enums/insertStrategy.enum';
import { BidNameStrategy } from '@enums/bid.enum';
import FormSelect from '@shared/mantine/ui/Select/FormSelect';
import SettingLabel from '@domains/user-settings/ui/SettingLabel';

const IntegrationCommon = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'settings.integrationCommon' });
  const { control } = useFormContext();

  const insertStrategyOptions = [
    { value: InsertStrategy.Force, label: t('insertStrategy.force') },
    { value: InsertStrategy.Match, label: t('insertStrategy.match') },
    { value: InsertStrategy.None, label: t('insertStrategy.none') },
  ];

  return (
    <Stack gap='sm'>
      <FormSelect
        name='insertStrategy'
        label={<SettingLabel text={t('insertStrategyLabel')} />}
        control={control}
        data={insertStrategyOptions}
        isInlineLabel
        inputWidth='md'
        allowDeselect={false}
      />
      <BidsSortSelect control={control} />
      <Group gap='xxs' wrap='wrap'>
        <SettingLabel
          text={t('bidNameStrategyLabel')}
          hint={t('bidNameStrategyHint')}
        />
        <Controller
          name='bidNameStrategy'
          control={control}
          render={({ field: { onChange, value, onBlur } }) => (
            <SegmentedControl
              data={[
                {
                  value: BidNameStrategy.Message,
                  label: (
                    <Tooltip label={t('bidNameStrategy.messageTooltip')} withArrow withinPortal multiline w={280}>
                      <Text span>{t('bidNameStrategy.message')}</Text>
                    </Tooltip>
                  ),
                },
                {
                  value: BidNameStrategy.Username,
                  label: (
                    <Tooltip label={t('bidNameStrategy.usernameTooltip')} withArrow withinPortal multiline w={280}>
                      <Text span>{t('bidNameStrategy.username')}</Text>
                    </Tooltip>
                  ),
                },
              ]}
              value={value}
              color='primary'
              onChange={(value) => {
                onChange(value);
                onBlur();
              }}
            />
          )}
        />
      </Group>
    </Stack>
  );
};

export default IntegrationCommon;
