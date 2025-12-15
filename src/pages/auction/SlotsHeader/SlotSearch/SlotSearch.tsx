import { ActionIcon, CloseButton, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { ChangeEvent } from 'react';

import { setSearchTerm } from '@reducers/Slots/Slots';
import { RootState } from '@reducers';

import classes from './SlotSearch.module.css';

const SlotSearch = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { searchTerm } = useSelector((root: RootState) => root.slots);

  const onSearchTermChange = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchTerm(event.target.value));
  };

  const clearSearch = () => {
    dispatch(setSearchTerm(''));
  };

  return (
    <TextInput
      leftSection={<IconSearch size={22} color='var(--mantine-color-dark-0)' />}
      classNames={{ input: classes.input }}
      variant='filled'
      placeholder={t('auc.lotSearch')}
      value={searchTerm}
      onChange={onSearchTermChange}
      rightSection={searchTerm && <CloseButton onClick={clearSearch} size='lg' />}
      rightSectionPointerEvents='all'
    />
  );
};

export default SlotSearch;
