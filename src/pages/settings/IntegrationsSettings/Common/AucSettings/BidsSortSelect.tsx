import { ComboboxItem, ComboboxLikeRenderOptionInput, Group, Text } from '@mantine/core';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import { FC } from 'react';
import { Control, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import SettingLabel from '@domains/user-settings/ui/SettingLabel';
import FormSelect from '@shared/mantine/ui/Select/FormSelect';

// t('sortBids')

interface BidsSortSelectProps {
  control: Control;
}

const BidsSortSelect: FC<BidsSortSelectProps> = ({ control }) => {
  const { t } = useTranslation();

  const value = useWatch({ control, name: 'purchaseSort' });

  const data = [
    { value: '0', label: t('settings.auc.purchaseSortOptions.earliest'), icon: <AccessTimeOutlinedIcon /> },
    { value: '1', label: t('settings.auc.purchaseSortOptions.newest'), icon: <AccessTimeOutlinedIcon /> },
    { value: '2', label: t('settings.auc.purchaseSortOptions.lowest'), icon: <AttachMoneyOutlinedIcon /> },
    { value: '3', label: t('settings.auc.purchaseSortOptions.highest'), icon: <AttachMoneyOutlinedIcon /> },
  ];

  const renderOption = (option: ComboboxLikeRenderOptionInput<ComboboxItem>) => (
    <Group>
      {data[Number(option.option.value)].icon}
      <Text>{option.option.label}</Text>
    </Group>
  );

  return (
    <FormSelect
      control={control}
      name='purchaseSort'
      label={<SettingLabel text={t('settings.integrationCommon.sortBids')} />}
      data={data}
      renderOption={renderOption}
      leftSection={data[value ?? 0].icon}
      leftSectionPointerEvents='none'
      isInlineLabel
      isNumberValue
      inputWidth='md'
      allowDeselect={false}
    />
  );
};

export default BidsSortSelect;
