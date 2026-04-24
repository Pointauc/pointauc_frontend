import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  ComboboxItem,
  ComboboxLikeRenderOptionInput,
  Divider,
  SegmentedControl,
  Text,
  Tooltip,
} from '@mantine/core';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import { IconArticle } from '@tabler/icons-react';

import { InsertStrategy } from '@enums/insertStrategy.enum';
import { BidNameStrategy } from '@enums/bid.enum';
import FieldLabel from '@domains/user-settings-v2/ui/FieldLabel';
import SettingsCard from '@domains/user-settings-v2/ui/SettingsCard';
import SettingsRow from '@domains/user-settings-v2/ui/SettingsRow';
import SettingsSection from '@domains/user-settings-v2/ui/SettingsSection';
import { SettingsForm } from '@models/settings.model.ts';
import FormSelect from '@shared/mantine/ui/Select/FormSelect';

import ExchangeRateExample from '../donations/ExchangeRateExample';
import ExchangeRateControls from '../donations/ExchangeRateControls';

const BidsGeneralSection = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<SettingsForm>();

  const purchaseSort = useWatch({ control, name: 'purchaseSort' });
  const bidNameStrategyLabelId = 'bidNameStrategy-label';

  const insertStrategyOptions = [
    { value: InsertStrategy.Force, label: t('settings.integrationCommon.insertStrategy.force') },
    { value: InsertStrategy.Match, label: t('settings.integrationCommon.insertStrategy.match') },
    { value: InsertStrategy.None, label: t('settings.integrationCommon.insertStrategy.none') },
  ];

  const bidsSortOptions = [
    { value: '0', label: t('settings.auc.purchaseSortOptions.earliest'), icon: <AccessTimeOutlinedIcon /> },
    { value: '1', label: t('settings.auc.purchaseSortOptions.newest'), icon: <AccessTimeOutlinedIcon /> },
    { value: '2', label: t('settings.auc.purchaseSortOptions.lowest'), icon: <AttachMoneyOutlinedIcon /> },
    { value: '3', label: t('settings.auc.purchaseSortOptions.highest'), icon: <AttachMoneyOutlinedIcon /> },
  ];

  const renderBidsSortOption = (option: ComboboxLikeRenderOptionInput<ComboboxItem>) => (
    <div className='flex items-center gap-2'>
      {bidsSortOptions[Number(option.option.value)]?.icon}
      <Text>{option.option.label}</Text>
    </div>
  );

  return (
    <SettingsSection
      id='website-settings-bids-general'
      title={t('settings.website.toc.bidsGeneral')}
      icon={<IconArticle size={24} />}
    >
      <SettingsCard>
        <div className='flex flex-col'>
          <SettingsRow compact htmlFor='insertStrategy'>
            <div className='flex flex-wrap items-center justify-between gap-4'>
              <FieldLabel text={t('settings.integrationCommon.insertStrategyLabel')} />
              <FormSelect
                name='insertStrategy'
                control={control}
                data={insertStrategyOptions}
                inputWidth='md'
                allowDeselect={false}
              />
            </div>
          </SettingsRow>

          <Divider />

          <SettingsRow compact htmlFor='purchaseSort'>
            <div className='flex flex-wrap items-center justify-between gap-4'>
              <FieldLabel text={t('settings.integrationCommon.sortBids')} />
              <FormSelect
                control={control}
                name='purchaseSort'
                data={bidsSortOptions}
                renderOption={renderBidsSortOption}
                leftSection={bidsSortOptions[purchaseSort ?? 0]?.icon}
                leftSectionPointerEvents='none'
                isNumberValue
                inputWidth='md'
                allowDeselect={false}
              />
            </div>
          </SettingsRow>

          <Divider />

          <SettingsRow compact htmlFor='bidNameStrategy'>
            <div className='flex flex-nowrap items-start justify-between gap-4'>
              <div className='flex max-w-[520px] flex-col gap-1'>
                <Text id={bidNameStrategyLabelId} fw={500} size='sm'>
                  {t('settings.integrationCommon.bidNameStrategyLabel')}
                </Text>
                <Text size='xs' c='dimmed'>
                  {t('settings.integrationCommon.bidNameStrategyHint')}
                </Text>
              </div>

              <Controller
                name='bidNameStrategy'
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <SegmentedControl
                    name='bidNameStrategy'
                    aria-labelledby={bidNameStrategyLabelId}
                    className='flex-shrink-0'
                    data={[
                      {
                        value: BidNameStrategy.Message,
                        label: (
                          <Tooltip
                            label={t('settings.integrationCommon.bidNameStrategy.messageTooltip')}
                            withArrow
                            withinPortal
                            multiline
                            w={280}
                          >
                            <Text span>{t('settings.integrationCommon.bidNameStrategy.message')}</Text>
                          </Tooltip>
                        ),
                      },
                      {
                        value: BidNameStrategy.Username,
                        label: (
                          <Tooltip
                            label={t('settings.integrationCommon.bidNameStrategy.usernameTooltip')}
                            withArrow
                            withinPortal
                            multiline
                            w={280}
                          >
                            <Text span>{t('settings.integrationCommon.bidNameStrategy.username')}</Text>
                          </Tooltip>
                        ),
                      },
                    ]}
                    value={value}
                    color='primary'
                    onChange={(nextValue) => {
                      onChange(nextValue);
                      onBlur();
                    }}
                  />
                )}
              />
            </div>
          </SettingsRow>

          <Divider />

          <SettingsRow compact htmlFor='pointsRate'>
            <div className='flex flex-wrap items-start justify-between gap-4'>
              <FieldLabel text={t('settings.donations.conversion')} hint={<ExchangeRateExample />} />
              <ExchangeRateControls />
            </div>
          </SettingsRow>
        </div>
      </SettingsCard>
    </SettingsSection>
  );
};

export default BidsGeneralSection;
