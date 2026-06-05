import { Menu, Paper, Tooltip, UnstyledButton } from '@mantine/core';
import { IconChevronRight, IconLanguage } from '@tabler/icons-react';
import clsx from 'clsx';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { getCurrentLanguage, SupportedLanguages } from '@constants/language.constants';
import ROUTES from '@constants/routes.constants';
import { Language } from '@enums/language.enum';
import { RootState } from '@reducers';

const NavbarLanguageMenu = () => {
  const { t, i18n } = useTranslation();
  const path = useLocation().pathname;
  const customBackground = useSelector((state: RootState) => state.aucSettings.settings.background);
  const currentLanguage = useMemo(() => getCurrentLanguage(i18n), [i18n]);

  const handleLanguageChange = (language: Language): void => {
    void i18n.changeLanguage(language);
  };

  return (
    <Paper
      className={clsx('bg-paper-600', { 'bg-paper-transparent-900': customBackground && path === ROUTES.HOME })}
      p={4}
      radius='md'
    >
      <Menu position='right-end' offset={8} withArrow>
        <Menu.Target>
          <Tooltip
            label={t('auc.language', { lng: currentLanguage.name })}
            px='sm'
            py='xs'
            fw={600}
            fz='md'
            position='right'
            withArrow
            arrowSize={7}
          >
            <UnstyledButton className='group hover:bg-primary-400/20 active:border-primary-500 active:bg-primary-light-hover relative flex h-[46px] w-full items-center justify-center rounded-md border border-transparent text-inherit transition-[background-color,border-color] duration-150'>
              <span className='group-hover:text-primary-500 flex transition-colors duration-150 [&_svg]:size-[26px]'>
                <IconLanguage />
              </span>
              <span
                className='text-dimmed group-hover:text-primary-500 pointer-events-none absolute right-[3px] bottom-[3px] flex items-center justify-center opacity-60 group-hover:opacity-100 [&_svg]:size-[12px]'
                aria-hidden
              >
                <IconChevronRight />
              </span>
            </UnstyledButton>
          </Tooltip>
        </Menu.Target>
        <Menu.Dropdown>
          {SupportedLanguages.map((language) => (
            <Menu.Item
              key={language.key}
              onClick={() => handleLanguageChange(language.key)}
              fw={language.key === currentLanguage.key ? 700 : 400}
            >
              {language.name}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    </Paper>
  );
};

export default NavbarLanguageMenu;
