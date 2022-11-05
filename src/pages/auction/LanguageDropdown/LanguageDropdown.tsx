import React from 'react';
import { Button, Menu, MenuItem } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import UnfoldMoreIcon from '@material-ui/icons/UnfoldMore';
import { getCurrentLanguage, SupportedLanguages } from '../../../constants/language.constants';
import { Language } from '../../../enums/language.enum';
import './LanguageDropdown.scss';

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
      <Button
        className="language-dropdown-button"
        aria-controls="language-menu"
        onClick={handleClick}
        variant="outlined"
        startIcon={<UnfoldMoreIcon />}
      >
        {t('auc.language', { replace: { lng: currentLanguage.name } })}
      </Button>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        {SupportedLanguages.map(({ key, name }) => (
          <MenuItem key={key} selected={key === currentLanguage.key} onClick={() => setLanguage(key)}>
            {name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageDropdown;
