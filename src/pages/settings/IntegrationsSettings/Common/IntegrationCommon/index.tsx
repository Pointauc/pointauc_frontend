import { Controller, useFormContext } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { Group, List, SegmentedControl, Stack, Text } from '@mantine/core';

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
          hint={
            <Trans
              i18nKey='settings.integrationCommon.bidNameStrategyHint'
              values={{ messageLabel: t('bidNameStrategy.message'), usernameLabel: t('bidNameStrategy.username') }}
              components={{ ul: <List size='sm' />, li: <List.Item />, b: <Text size='sm' span fw={600} /> }}
            />
          }
        />
        <Controller
          name='bidNameStrategy'
          control={control}
          render={({ field: { onChange, value, onBlur } }) => (
            <SegmentedControl
              data={[
                { value: BidNameStrategy.Message, label: t('bidNameStrategy.message') },
                { value: BidNameStrategy.Username, label: t('bidNameStrategy.username') },
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
