import React from 'react';
import { Button, Menu } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { IconLanguage } from '@tabler/icons-react';

import { getCurrentLanguage, SupportedLanguages } from '@constants/language.constants';
import { Language } from '@enums/language.enum';

import classes from './MobileLanguageSelector.module.css';

/**
 * Mobile-optimized language selector component for the header.
 * Shows current language key and provides a dropdown menu for language switching.
 */
const MobileLanguageSelector = () => {
  const { i18n } = useTranslation();
  const currentLanguage = getCurrentLanguage(i18n);

  const handleLanguageChange = (languageKey: Language) => {
    i18n.changeLanguage(languageKey);
  };

  return (
    <Menu shadow='md' position='bottom-end'>
      <Menu.Target>
        <Button
          variant='light'
          color='gray'
          size='sm'
          classNames={{ section: classes.section }}
          leftSection={<IconLanguage size={24} />}
          aria-label={`Current language: ${currentLanguage.key.toUpperCase()}`}
        >
          <span>{currentLanguage.key.toUpperCase()}</span>
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        {SupportedLanguages.map((language) => (
          <Menu.Item
            key={language.key}
            onClick={() => handleLanguageChange(language.key)}
            className={language.key === currentLanguage.key ? classes.activeItem : ''}
          >
            <div className={classes.menuItem}>
              <span className={classes.menuLangKey}>{language.key.toUpperCase()}</span>
              <span className={classes.menuLangName}>{language.name}</span>
            </div>
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
};

export default MobileLanguageSelector;
