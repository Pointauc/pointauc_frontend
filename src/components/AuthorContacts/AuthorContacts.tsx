import { useTranslation } from 'react-i18next';
import TelegramIcon from '@mui/icons-material/Telegram';
import { Anchor, Group, Stack, Title } from '@mantine/core';
import clsx from 'clsx';

import Boosty from '@assets/icons/boosty.svg?react';

import classes from './AuthorContacts.module.css';

interface AuthorContactsProps {
  compact?: boolean;
}

const AuthorContacts = ({ compact }: AuthorContactsProps) => {
  const { t } = useTranslation();

  return (
    <Stack className={clsx(classes.wrapper, { [classes.compact]: compact })} gap='md'>
      <Stack gap='xs'>
        <Title className={classes.text} order={5}>
          {t('author.contacts')}
        </Title>
        <Group wrap='nowrap' gap='xs' className={classes.contact}>
          <TelegramIcon className={classes.icon} />
          <Anchor href='https://t.me/kozjarych' rel='noreferrer' target='_blank' className={classes.text}>
            @kozjarych
          </Anchor>
        </Group>
      </Stack>
      <Stack gap='xs'>
        <Title className={classes.text} order={5}>
          {t('author.support')}
        </Title>
        <Group wrap='nowrap' gap='xs' className={classes.contact}>
          <Boosty className={`${classes.boostyIcon} ${classes.icon}`} />
          <Anchor href='https://boosty.to/kozjar/donate' rel='noreferrer' target='_blank' className={classes.text}>
            boosty/kozjar
          </Anchor>
        </Group>
      </Stack>
    </Stack>
  );
};

export default AuthorContacts;
