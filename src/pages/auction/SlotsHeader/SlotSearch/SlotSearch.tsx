import React from 'react';
import { IconButton, InputBase, InputBaseProps, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import './SlotSearch.scss';
import { useDispatch, useSelector } from 'react-redux';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';

import { setSearchTerm } from '../../../../reducers/Slots/Slots';
import { RootState } from '../../../../reducers';

const SlotSearch = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { searchTerm } = useSelector((root: RootState) => root.slots);

  const onSearchTermChange: InputBaseProps['onChange'] = (event) => {
    dispatch(setSearchTerm(event.target.value));
  };

  const clearSearch = () => {
    dispatch(setSearchTerm(''));
  };

  return (
    <Paper className='slot-search'>
      <SearchIcon />
      <InputBase
        className='search-input'
        placeholder={t('auc.lotSearch')}
        value={searchTerm}
        onChange={onSearchTermChange}
      />
      <div className='close-button-wrapper'>
        {searchTerm && (
          <IconButton className='close-button' onClick={clearSearch} size='large'>
            <CloseIcon />
          </IconButton>
        )}
      </div>
    </Paper>
  );
};

export default SlotSearch;
