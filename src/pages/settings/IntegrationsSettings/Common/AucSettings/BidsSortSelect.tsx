import { ComboboxItem, ComboboxLikeRenderOptionInput, Group, Text } from '@mantine/core';
import ArrowDownwardOutlinedIcon from '@mui/icons-material/ArrowDownwardOutlined';
import ArrowUpwardOutlinedIcon from '@mui/icons-material/ArrowUpwardOutlined';
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
    { value: '0', label: t('settings.auc.dateSort'), icon: <ArrowUpwardOutlinedIcon /> },
    { value: '1', label: t('settings.auc.dateSort'), icon: <ArrowDownwardOutlinedIcon /> },
    { value: '2', label: t('settings.auc.costSort'), icon: <ArrowUpwardOutlinedIcon /> },
    { value: '3', label: t('settings.auc.costSort'), icon: <ArrowDownwardOutlinedIcon /> },
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
      leftSection={data[value].icon}
      leftSectionPointerEvents='none'
      isInlineLabel
      isNumberValue
      inputWidth='md'
      allowDeselect={false}
    />
  );
};

export default BidsSortSelect;
