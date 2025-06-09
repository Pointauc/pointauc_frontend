import React from 'react';
import { Button, Menu, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { Select } from '@mantine/core';
import LanguageIcon from '@mui/icons-material/Language';

import { getCurrentLanguage, SupportedLanguages } from '@constants/language.constants.ts';
import { Language } from '@enums/language.enum.ts';

import classes from './LanguageDropdown.module.css';

const LanguageDropdown = () => {
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const currentLanguage = getCurrentLanguage(i18n);

  const handleClick = (event: any): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  const setLanguage = (key: Language) => {
    i18n.changeLanguage(key);
    handleClose();
  };

  return (
    <>
      <Select
        data={SupportedLanguages.map(({ key, name }) => ({ value: key, label: name }))}
        value={currentLanguage.key}
        onChange={(value) => setLanguage(value as Language)}
        allowDeselect={false}
        classNames={{ input: classes.input, section: classes.section }}
        chevronColor='white'
        leftSection={<LanguageIcon />}
        radius='xl'
        size='md'
      />
    </>
  );
};

export default LanguageDropdown;
